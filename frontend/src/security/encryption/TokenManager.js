import { AESEncryption } from './AESEncryption'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../config/constants'

export class TokenManager {
  static setTokens(accessToken, refreshToken) {
    try {
      const encryptedAccess = AESEncryption.encrypt(accessToken)
      const encryptedRefresh = AESEncryption.encrypt(refreshToken)
      
      localStorage.setItem(ACCESS_TOKEN_KEY, encryptedAccess)
      localStorage.setItem(REFRESH_TOKEN_KEY, encryptedRefresh)
    } catch (error) {
      console.error('Error storing tokens:', error)
      throw error
    }
  }

  static getAccessToken() {
    try {
      const encrypted = localStorage.getItem(ACCESS_TOKEN_KEY)
      return encrypted ? AESEncryption.decrypt(encrypted) : null
    } catch (error) {
      console.error('Error retrieving access token:', error)
      return null
    }
  }

  static getRefreshToken() {
    try {
      const encrypted = localStorage.getItem(REFRESH_TOKEN_KEY)
      return encrypted ? AESEncryption.decrypt(encrypted) : null
    } catch (error) {
      console.error('Error retrieving refresh token:', error)
      return null
    }
  }

  static clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}