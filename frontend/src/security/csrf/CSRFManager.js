import { v4 as uuidv4 } from 'uuid'

export class CSRFManager {
  static tokenKey = 'csrf_token'
  
  static generateToken() {
    const token = uuidv4()
    document.cookie = `${this.tokenKey}=${token}; SameSite=Strict; Secure`
    return token
  }

  static getToken() {
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith(`${this.tokenKey}=`))
    return tokenCookie ? tokenCookie.split('=')[1] : null
  }

  static validateToken(token) {
    return token === this.getToken()
  }

  static getHeaders() {
    const token = this.getToken() || this.generateToken()
    return {
      'X-CSRF-Token': token,
      'X-Requested-With': 'XMLHttpRequest'
    }
  }
}