import DOMPurify from 'dompurify'
import { DOMSanitizer } from './DOMPurify'
import { InputValidator } from './InputValidator'

export class ContentSanitizer {
  // First layer - Input sanitization using existing InputValidator
  static sanitizeInput(input, type = 'text') {
    return InputValidator.sanitizeInput(input, type)
  }
  
  // Second layer - Output sanitization using existing DOMSanitizer with enhanced config
  static sanitizeOutput(content, config = {}) {
    const defaultConfig = {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'div', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
      ALLOW_DATA_ATTR: false,
      ADD_ATTR: ['target'],
      ADD_TAGS: ['iframe'],
      FORBID_TAGS: ['script', 'style', 'input', 'form', 'object', 'embed'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick'],
      FORCE_BODY: true,
      USE_PROFILES: { html: true }
    }
    
    const mergedConfig = { ...defaultConfig, ...config }
    return DOMSanitizer.sanitize(content, mergedConfig)
  }
  
  // Comprehensive content validation
  static validateContent(content, options = {}) {
    const { sanitize = true, stripHTML = false, allowedTags = [] } = options
    
    // First check for malicious patterns
    if (InputValidator.hasHTML(content) && stripHTML) {
      content = content.replace(InputValidator.patterns.html, '')
    }
    
    // Then sanitize if requested
    if (sanitize) {
      content = this.sanitizeOutput(content, {
        ALLOWED_TAGS: allowedTags.length ? allowedTags : undefined
      })
    }
    
    return content
  }
  
  // Validate a form field with enhanced security
  static validateField(value, fieldType, options = {}) {
    // First sanitize the input
    const sanitized = this.sanitizeInput(value, fieldType)
    
    // Then validate using InputValidator
    const isValid = InputValidator.validate(sanitized, fieldType)
    
    // Return validation result with sanitized value
    return {
      isValid,
      sanitized,
      original: value
    }
  }
}