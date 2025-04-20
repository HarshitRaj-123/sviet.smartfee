import { v4 as uuidv4 } from 'uuid'
import { SESSION_TIMEOUT } from '../../config/constants'

export class SessionManager {
  static session = null
  static lastActivity = null

  static initSession() {
    const sessionId = uuidv4()
    const userAgent = window.navigator.userAgent
    const ip = window.location.hostname // Basic implementation - ideally get from server

    this.session = {
      id: sessionId,
      userAgent,
      ip,
      startTime: new Date().getTime()
    }

    this.updateLastActivity()
    return this.session
  }

  static validateSession() {
    if (!this.session) return false

    const currentUserAgent = window.navigator.userAgent
    const currentIp = window.location.hostname

    if (
      this.session.userAgent !== currentUserAgent ||
      this.session.ip !== currentIp ||
      this.isSessionExpired()
    ) {
      this.clearSession()
      return false
    }

    this.updateLastActivity()
    return true
  }

  static updateLastActivity() {
    this.lastActivity = new Date().getTime()
  }

  static isSessionExpired() {
    if (!this.lastActivity) return true
    
    const now = new Date().getTime()
    return (now - this.lastActivity) > SESSION_TIMEOUT
  }

  static clearSession() {
    this.session = null
    this.lastActivity = null
  }
}