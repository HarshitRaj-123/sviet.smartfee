import { useState } from 'react'
import { ContentSanitizer } from '../../security/sanitization/ContentSanitizer'

export const FormInput = ({ 
  type = 'text',
  name,
  value,
  onChange,
  sanitizeType,
  ...props
}) => {
  const [sanitizedValue, setSanitizedValue] = useState(value || '')
  
  const handleChange = (e) => {
    const rawValue = e.target.value
    
    // Apply input sanitization
    const sanitized = sanitizeType ? 
      ContentSanitizer.sanitizeInput(rawValue, sanitizeType) : 
      rawValue
      
    setSanitizedValue(sanitized)
    
    // Pass sanitized value to parent
    if (onChange) {
      const modifiedEvent = { ...e, target: { ...e.target, value: sanitized } }
      onChange(modifiedEvent)
    }
  }
  
  return (
    <input
      type={type}
      name={name}
      value={sanitizedValue}
      onChange={handleChange}
      {...props}
    />
  )
}