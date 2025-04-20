import CryptoJS from 'crypto-js'
import { ENCRYPTION_KEY, TOKEN_VERSION } from '../../config/constants'

export class AESEncryption {
  static encrypt(data) {
    try {
      // Generate random salt and IV
      const salt = CryptoJS.lib.WordArray.random(128/8)
      const iv = CryptoJS.lib.WordArray.random(128/8)

      // Generate key using PBKDF2
      const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, salt, {
        keySize: 256/32,
        iterations: 100000
      })

      // Encrypt the data
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
        iv: iv,
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.Pkcs7
      })

      // Combine all components
      const result = [
        TOKEN_VERSION,
        salt.toString(),
        iv.toString(),
        encrypted.toString()
      ].join('$')

      return result
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Encryption failed')
    }
  }

  static decrypt(encryptedData) {
    try {
      // Split the components
      const [version, salt, iv, data] = encryptedData.split('$')

      if (version !== TOKEN_VERSION) {
        throw new Error('Invalid token version')
      }

      // Regenerate key using PBKDF2
      const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, CryptoJS.enc.Hex.parse(salt), {
        keySize: 256/32,
        iterations: 100000
      })

      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(data, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.Pkcs7
      })

      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Decryption failed')
    }
  }
}