import DOMPurify from 'dompurify'

const defaultConfig = {
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 
    'li', 'br', 'span', 'div', 'h1', 'h2', 'h3'
  ],
  ALLOWED_ATTR: ['href', 'class', 'target'],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ADD_TAGS: ['custom-component'],
  ADD_ATTR: ['custom-attr'],
  WHOLE_DOCUMENT: false,
  SANITIZE_DOM: true
}

export class DOMSanitizer {
  static sanitize(dirty, config = {}) {
    const mergedConfig = { ...defaultConfig, ...config }
    return DOMPurify.sanitize(dirty, mergedConfig)
  }

  static sanitizeAndValidateHTML(input) {
    // First pass sanitization
    const firstPass = this.sanitize(input)
    
    // Second pass with stricter config
    const strictConfig = {
      ...defaultConfig,
      ALLOWED_TAGS: ['p', 'span', 'div', 'b', 'i'],
      ALLOWED_ATTR: ['class']
    }
    
    return this.sanitize(firstPass, strictConfig)
  }
}