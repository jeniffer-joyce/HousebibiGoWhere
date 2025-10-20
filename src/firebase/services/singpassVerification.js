import { db } from '@/firebase/firebase_config.js'
import { 
  doc, 
  getDoc,
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore'

/**
 * Verify against existing Firestore document
 */
export async function verifySingPass(formData) {
  try {
    const { nric, fullName, dateOfBirth, uen } = formData

    console.log('📝 Form Input:', { nric, fullName, dateOfBirth, uen })

    // Validate inputs
    if (!nric || !fullName || !dateOfBirth || !uen) {
      return {
        success: false,
        error: 'missing-fields',
        message: 'All fields are required'
      }
    }

    // Normalize NRIC
    const normalizedNric = nric.trim().toUpperCase()
    console.log('🔑 Looking up document:', normalizedNric)

    // Check if verification document exists
    const verificationRef = doc(db, 'singpass_verification', normalizedNric)
    console.log('📄 Document reference created')
    
    const verificationSnap = await getDoc(verificationRef)
    console.log('📥 Document fetch attempted')

    if (!verificationSnap.exists()) {
      console.error('❌ Document not found')
      return {
        success: false,
        error: 'not-found',
        message: 'No verification found for this NRIC'
      }
    }

    const verificationData = verificationSnap.data()
    console.log('💾 Database Values:', {
      nric: verificationData.nric,
      fullName: verificationData.fullName,
      dateOfBirth: verificationData.dateOfBirth,
      uen: verificationData.uen
    })

    // Check if already registered
    if (verificationData.isRegistered === true) {
      console.warn('⚠️ Already registered')
      return {
        success: false,
        error: 'already-registered',
        message: 'This business has already been registered'
      }
    }

    // Verify the details match
    const nameMatch = verificationData.fullName.toLowerCase().trim() === fullName.toLowerCase().trim()
    const dobMatch = verificationData.dateOfBirth.trim() === dateOfBirth.trim()
    const uenMatch = verificationData.uen.toUpperCase().trim() === uen.toUpperCase().trim()

    console.log('🔍 Match Results:', { nameMatch, dobMatch, uenMatch })

    if (!nameMatch || !dobMatch || !uenMatch) {
      console.error('❌ Verification failed - details do not match')
      return {
        success: false,
        error: 'verification-failed',
        message: 'Details do not match our records'
      }
    }

    console.log('✅ Verification successful!')

    // Return verified data
    return {
      success: true,
      data: {
        nric: verificationData.nric,
        fullName: verificationData.fullName,
        dateOfBirth: verificationData.dateOfBirth,
        gender: verificationData.gender,
        phone: verificationData.phone,
        uen: verificationData.uen,
        businessName: verificationData.companyName,
        businessAddress: {
          postalCode: verificationData.postalCode,
          addressLine: verificationData.addressLine,
          unitNo: verificationData.unitNo
        }
      }
    }

  } catch (error) {
    console.error('❌ SingPass verification error:', error)
    return {
      success: false,
      error: 'verification-failed',
      message: 'Verification failed. Please try again.'
    }
  }
}

/**
 * Mark verification as registered after successful signup
 */
export async function markBusinessAsRegistered(nric, userData) {
  if (!nric || !userData?.uid) {
    throw new Error('Missing NRIC or user data')
  }

  try {
    const normalizedNric = nric.trim().toUpperCase()
    const verificationRef = doc(db, 'singpass_verification', normalizedNric)
    
    const verificationSnap = await getDoc(verificationRef)
    if (!verificationSnap.exists()) {
      console.warn('⚠️ Verification record not found for NRIC:', normalizedNric)
      return false
    }

    await updateDoc(verificationRef, {
      isRegistered: true,
      registeredUid: userData.uid,
      registeredEmail: userData.email,
      registeredUsername: userData.username,
      registeredDate: serverTimestamp()
    })

    console.log('✅ Verification marked as registered:', normalizedNric)
    return true
  } catch (error) {
    console.error('❌ Error marking verification as registered:', error)
    throw error
  }
}

/**
 * Format verification errors for display
 */
export function formatVerificationError(result) {
  const errorMessages = {
    'missing-fields': 'Please fill in all required fields',
    'invalid-nric': 'Invalid NRIC/FIN format',
    'verification-failed': 'Details do not match our records. Please check and try again.',
    'not-found': 'No verification found for this NRIC. Please contact support.',
    'already-registered': 'This business has already been registered on our platform.'
  }

  return errorMessages[result.error] || result.message || 'An error occurred during verification'
}