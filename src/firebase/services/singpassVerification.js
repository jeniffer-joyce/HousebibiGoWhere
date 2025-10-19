/**
 * Verify seller details against SingPass verified businesses collection
 * 
 * @param {Object} sellerData - Data to verify
 * @param {string} sellerData.nric - NRIC/FIN number
 * @param {string} sellerData.fullName - Full legal name
 * @param {string} sellerData.dateOfBirth - Date of birth (YYYY-MM-DD)
 * @param {string} sellerData.uen - Business UEN
 * @returns {Promise<Object>} Verification result
 */
export async function verifySingPass(sellerData) {
  try {
    const { nric, fullName, dateOfBirth, uen } = sellerData

    // Validate input
    if (!nric || !fullName || !dateOfBirth || !uen) {
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

    // Verify UEN match (NEW)
    const normalizedInputUen = uen.trim().toUpperCase()
    const normalizedDbUen = (verifiedBusiness.uen || '').trim().toUpperCase()

    if (normalizedInputUen !== normalizedDbUen) {
      return {
        success: false,
        error: 'Business UEN does not match ACRA records. Please check your UEN.',
        code: 'UEN_MISMATCH',
        details: {
          provided: uen,
          expected: verifiedBusiness.uen
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
    
    case 'UEN_MISMATCH':
      return 'The Business UEN you entered does not match ACRA records. Please verify your UEN and try again.'
    
    case 'ALREADY_REGISTERED':
      return 'This business is already registered on our platform. Please try logging in instead.'
    
    case 'SERVICE_ERROR':
      return 'Our verification service is temporarily unavailable. Please try again in a few moments.'
    
    default:
      return result.error || 'Verification failed. Please contact support if this problem persists.'
  }
}