import { InputValidator } from '../security/sanitization/InputValidator'

/**
 * Validates form fields based on specified rules
 * @param {Object} values - Form values to validate
 * @param {Object} rules - Validation rules for each field
 * @returns {Object} Object containing errors (if any)
 */
export const validateForm = (values, rules) => {
  const errors = {}

  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = values[field]
    
    // Required field validation
    if (fieldRules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${fieldRules.label || field} is required`
      return
    }

    // Min length validation
    if (fieldRules.minLength && value?.length < fieldRules.minLength) {
      errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`
      return
    }

    // Max length validation
    if (fieldRules.maxLength && value?.length > fieldRules.maxLength) {
      errors[field] = `${fieldRules.label || field} must not exceed ${fieldRules.maxLength} characters`
      return
    }

    // Pattern validation
    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.message || `${fieldRules.label || field} is invalid`
      return
    }

    // Type-specific validation
    if (fieldRules.type && value) {
      const isValid = InputValidator.validate(value, fieldRules.type)
      if (!isValid) {
        errors[field] = fieldRules.message || `${fieldRules.label || field} is invalid`
      }
    }

    // Custom validation
    if (fieldRules.validate && typeof fieldRules.validate === 'function') {
      const customError = fieldRules.validate(value, values)
      if (customError) {
        errors[field] = customError
      }
    }
  })

  return errors
}

/**
 * Common validation rules that can be reused across forms
 */
export const validationRules = {
  email: {
    required: true,
    type: 'email',
    label: 'Email address',
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 8,
    type: 'password',
    label: 'Password',
    message: 'Password must be at least 8 characters and contain at least one letter, number, and special character'
  },
  phone: {
    required: true,
    type: 'phone',
    label: 'Phone number',
    message: 'Please enter a valid phone number'
  },
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    type: 'username',
    label: 'Username',
    message: 'Username must be between 3-20 characters and contain only letters, numbers, and underscores'
  }
}