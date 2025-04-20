import validator from 'validator'

export class InputValidator {
  static patterns = {
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
    username: /^[a-zA-Z0-9_]{3,20}$/,
    phone: /^\+?[\d\s-]{10,}$/,
    html: /<[^>]*>/g
  }

  static sanitizeInput(input, type) {
    if (typeof input !== 'string') return ''
    
    let sanitized = validator.trim(input)
    sanitized = validator.escape(sanitized)

    switch (type) {
      case 'email':
        return validator.normalizeEmail(sanitized)
      case 'text':
        return sanitized.replace(/[<>]/g, '')
      default:
        return sanitized
    }
  }

  static validate(value, type) {
    const sanitized = this.sanitizeInput(value, type)
    
    switch (type) {
      case 'email':
        return validator.isEmail(sanitized)
      case 'password':
        return this.patterns.password.test(sanitized)
      case 'username':
        return this.patterns.username.test(sanitized)
      case 'phone':
        return this.patterns.phone.test(sanitized)
      default:
        return true
    }
  }

  static hasHTML(input) {
    return this.patterns.html.test(input)
  }
}