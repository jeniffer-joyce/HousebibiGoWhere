// firebase/services/fileUpload.js
// Handle file uploads to Firebase Storage

import { storage } from '@/firebase/firebase_config.js'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

/**
 * Upload a business license document to Firebase Storage
 * 
 * @param {File} file - The file to upload
 * @param {string} userId - The user's UID (for organizing files)
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<string>} - Download URL of the uploaded file
 */
export async function uploadBusinessLicense(file, userId, onProgress = null) {
  if (!file) {
    throw new Error('upload/no-file')
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    const e = new Error('upload/invalid-file-type')
    e.code = 'upload/invalid-file-type'
    throw e
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    const e = new Error('upload/file-too-large')
    e.code = 'upload/file-too-large'
    throw e
  }

  // Create a unique filename with timestamp
  const timestamp = Date.now()
  const fileExtension = file.name.split('.').pop()
  const fileName = `${userId}_${timestamp}.${fileExtension}`
  
  // Storage path: business-licenses/{userId}/{filename}
  const filePath = `business-licenses/${userId}/${fileName}`
  const fileRef = ref(storage, filePath)

  // Upload with progress tracking
  const uploadTask = uploadBytesResumable(fileRef, file)

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Calculate progress percentage
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        if (onProgress) {
          onProgress(Math.round(progress))
        }
      },
      (error) => {
        // Handle upload errors
        console.error('Upload error:', error)
        const e = new Error('upload/failed')
        e.code = 'upload/failed'
        e.originalError = error
        reject(e)
      },
      async () => {
        // Upload completed successfully, get download URL
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadURL)
        } catch (error) {
          console.error('Error getting download URL:', error)
          const e = new Error('upload/url-failed')
          e.code = 'upload/url-failed'
          reject(e)
        }
      }
    )
  })
}

/**
 * Format upload error messages for user display
 */
export function formatUploadError(error) {
  const code = error?.code || error?.message || ''
  
  if (code.includes('invalid-file-type')) {
    return 'Please upload a PDF, JPG, or PNG file.'
  }
  if (code.includes('file-too-large')) {
    return 'File is too large. Maximum size is 5MB.'
  }
  if (code.includes('no-file')) {
    return 'Please select a file to upload.'
  }
  if (code.includes('storage/unauthorized')) {
    return 'You do not have permission to upload files.'
  }
  
  return 'File upload failed. Please try again.'
}