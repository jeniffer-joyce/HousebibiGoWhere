// SingPass Verification Service
// Verifies against a separate "singpass_verification" collection

import { db } from '@/firebase/firebase_config'
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'

/**
 * Verify seller details against SingPass verified businesses collection
 * 
 * @param {Object} sellerData - Data to verify
 * @param {string} sellerData.nric - NRIC/FIN number
 * @param {string} sellerData.fullName - Full legal name
 * @param {string} sellerData.dateOfBirth - Date of birth (YYYY-MM-DD)
 * @returns {Promise<Object>} Verification result
 */
export async function verifySingPass(sellerData) {
  try {
    const { nric, fullName, dateOfBirth } = sellerData

    // Validate input
    if (!nric || !fullName || !dateOfBirth) {
      return {
        success: false,
        error: 'Missing required fields for verification',
        code: 'MISSING_FIELDS'
      }
    }

    // Query the SingPass verified businesses collection
    const verifiedBusinessesRef = collection(db, 'singpass_verification')
    const q = query(
      verifiedBusinessesRef,
      where('nric', '==', nric.trim().toUpperCase())
    )

    const querySnapshot = await getDocs(q)

    // Check if NRIC exists in verified businesses
    if (querySnapshot.empty) {
      return {
        success: false,
        error: 'NRIC not found in SingPass verified businesses. Please ensure you are registered with ACRA.',
        code: 'NRIC_NOT_FOUND',
        details: 'This NRIC is not linked to any verified business registration.'
      }
    }

    // Get the verified business document
    const businessDoc = querySnapshot.docs[0]
    const verifiedBusiness = businessDoc.data()

    // Verify name match (case-insensitive, trimmed)
    const normalizedInputName = fullName.trim().toLowerCase()
    const normalizedDbName = (verifiedBusiness.fullName || verifiedBusiness.displayName || '').trim().toLowerCase()

    if (normalizedInputName !== normalizedDbName) {
      return {
        success: false,
        error: 'Name does not match SingPass records. Please enter your full legal name as per NRIC.',
        code: 'NAME_MISMATCH',
        details: {
          provided: fullName,
          expected: verifiedBusiness.fullName || verifiedBusiness.displayName
        }
      }
    }

    // Verify date of birth match
    if (dateOfBirth !== verifiedBusiness.dateOfBirth) {
      return {
        success: false,
        error: 'Date of birth does not match SingPass records.',
        code: 'DOB_MISMATCH',
        details: {
          provided: dateOfBirth,
          expected: verifiedBusiness.dateOfBirth
        }
      }
    }

    // Check if already registered
    if (verifiedBusiness.isRegistered) {
      return {
        success: false,
        error: 'This business is already registered on our platform.',
        code: 'ALREADY_REGISTERED',
        details: {
          registeredEmail: verifiedBusiness.registeredEmail,
          registeredDate: verifiedBusiness.registeredDate
        }
      }
    }

    // Success! Return verified data (simulating MyInfo response)
    return {
      success: true,
      message: 'SingPass verification successful',
      data: {
        // Personal details
        nric: verifiedBusiness.nric,
        fullName: verifiedBusiness.fullName || verifiedBusiness.displayName,
        dateOfBirth: verifiedBusiness.dateOfBirth,
        gender: verifiedBusiness.gender,
        phone: verifiedBusiness.phone,
        
        // Business details
        businessName: verifiedBusiness.companyName,
        uen: verifiedBusiness.uen,
        businessAddress: {
          postalCode: verifiedBusiness.postalCode,
          addressLine: verifiedBusiness.addressLine,
          unitNo: verifiedBusiness.unitNo
        },
        
        // Verification info
        verificationId: businessDoc.id,
        verifiedDate: verifiedBusiness.verifiedDate || new Date().toISOString(),
        isNewRegistration: true
      }
    }

  } catch (error) {
    console.error('SingPass verification error:', error)
    return {
      success: false,
      error: 'Verification service is temporarily unavailable. Please try again later.',
      code: 'SERVICE_ERROR',
      details: error.message
    }
  }
}

/**
 * Check if NRIC is already registered (for new signups)
 * Checks both verified businesses and existing users
 * 
 * @param {string} nric - NRIC to check
 * @returns {Promise<Object>} Check result
 */
export async function checkNRICExists(nric) {
  try {
    const normalizedNric = nric.trim().toUpperCase()

    // Check if in verified businesses collection
    const verifiedRef = collection(db, 'singpass_verification')
    const verifiedQuery = query(verifiedRef, where('nric', '==', normalizedNric))
    const verifiedSnapshot = await getDocs(verifiedQuery)

    if (!verifiedSnapshot.empty) {
      const verifiedData = verifiedSnapshot.docs[0].data()
      
      // Check if already registered on platform
      if (verifiedData.isRegistered) {
        return {
          exists: true,
          inVerifiedList: true,
          alreadyRegistered: true,
          message: 'This NRIC is already registered on our platform',
          registeredEmail: verifiedData.registeredEmail
        }
      }

      return {
        exists: true,
        inVerifiedList: true,
        alreadyRegistered: false,
        message: 'NRIC found in verified businesses - ready to register'
      }
    }

    // Check if in users collection (shouldn't happen but good to check)
    const usersRef = collection(db, 'users')
    const usersQuery = query(usersRef, where('nric', '==', normalizedNric))
    const usersSnapshot = await getDocs(usersQuery)

    if (!usersSnapshot.empty) {
      const userData = usersSnapshot.docs[0].data()
      return {
        exists: true,
        inVerifiedList: false,
        alreadyRegistered: true,
        message: 'This NRIC is already registered',
        accountType: userData.role,
        username: userData.username
      }
    }

    return {
      exists: false,
      inVerifiedList: false,
      alreadyRegistered: false,
      message: 'NRIC not found in verified businesses. Please contact ACRA.'
    }

  } catch (error) {
    console.error('NRIC check error:', error)
    throw error
  }
}

/**
 * Mark a verified business as registered after successful signup
 * 
 * @param {string} verificationId - Document ID from singpass_verification
 * @param {Object} registrationData - User registration details
 * @returns {Promise<void>}
 */
export async function markBusinessAsRegistered(verificationId, registrationData) {
  try {
    const { updateDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js')
    
    const businessRef = doc(db, 'singpass_verification', verificationId)
    await updateDoc(businessRef, {
      isRegistered: true,
      registeredEmail: registrationData.email,
      registeredUsername: registrationData.username,
      registeredUid: registrationData.uid,
      registeredDate: new Date().toISOString()
    })

    console.log('✅ Marked business as registered')
  } catch (error) {
    console.error('Error marking business as registered:', error)
    // Non-critical error - don't fail the registration
  }
}

/**
 * Format verification error for user display
 * 
 * @param {Object} result - Verification result object
 * @returns {string} User-friendly error message
 */
export function formatVerificationError(result) {
  switch (result.code) {
    case 'MISSING_FIELDS':
      return 'Please fill in all required fields.'
    
    case 'NRIC_NOT_FOUND':
      return 'Your NRIC is not found in our verified business registry. Please ensure your business is registered with ACRA and contact support if needed.'
    
    case 'NAME_MISMATCH':
      return 'The name you entered does not match SingPass records. Please enter your full legal name exactly as it appears on your NRIC.'
    
    case 'DOB_MISMATCH':
      return 'The date of birth you entered does not match SingPass records. Please check and try again.'
    
    case 'ALREADY_REGISTERED':
      return 'This business is already registered on our platform. Please try logging in instead.'
    
    case 'SERVICE_ERROR':
      return 'Our verification service is temporarily unavailable. Please try again in a few moments.'
    
    default:
      return result.error || 'Verification failed. Please contact support if this problem persists.'
  }
}