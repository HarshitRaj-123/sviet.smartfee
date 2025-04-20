import CryptoJS from 'crypto-js'
import { ENCRYPTION_KEY } from '../../config/constants'

export class AESEncryption {
  // Existing methods...
  
  // Add these enhanced encryption methods
  static encryptWithPBKDF2(data, customKey = null) {
    try {
      const secretKey = customKey || ENCRYPTION_KEY
      const salt = CryptoJS.lib.WordArray.random(16)
      const iv = CryptoJS.lib.WordArray.random(16)
      
      // Generate key with PBKDF2 (100,000 iterations)
      const key = CryptoJS.PBKDF2(secretKey, salt, {
        keySize: 256/32,
        iterations: 100000
      })
      
      // Encrypt with AES-GCM mode
      const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
        iv: iv,
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.Pkcs7
      }).toString()
      
      // Format with version, salt and IV for future-proofing
      return `v1$${salt}$${iv}$${ciphertext}`
    } catch (error) {
      console.error('Enhanced encryption failed:', error)
      throw new Error('Data encryption failed')
    }
  }
  
  static decryptWithPBKDF2(encryptedData, customKey = null) {
    try {
      const secretKey = customKey || ENCRYPTION_KEY
      const [version, salt, iv, ciphertext] = encryptedData.split('$')
      
      if (version !== 'v1') {
        throw new Error('Unsupported encryption version')
      }
      
      const key = CryptoJS.PBKDF2(secretKey, salt, {
        keySize: 256/32,
        iterations: 100000
      })
      
      const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        iv: iv,
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.Pkcs7
      })
      
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
    } catch (error) {
      console.error('Enhanced decryption failed:', error)
      return null
    }
  }
}