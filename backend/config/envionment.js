/**
 * Environment variable validation configuration
 * @module config/environment
 */

// Constants for validation
const ENV_CONFIG = {
  NODE_ENV: {
    required: true,
    validate: (value) => ['development', 'production', 'test'].includes(value),
    message: 'NODE_ENV must be either development, production, or test'
  },
  PORT: {
    required: true,
    validate: (value) => !isNaN(value) && value > 0 && value < 65536,
    message: 'PORT must be a valid number between 1 and 65535'
  },
  MONGODB_URI: {
    required: true,
    validate: (value) => /^mongodb(\+srv)?:\/\/.+/.test(value),
    message: 'Invalid MONGODB_URI format'
  },
  JWT_SECRET: {
    required: true,
    validate: (value) => value.length >= 32,
    message: 'JWT_SECRET must be at least 32 characters long'
  },
  JWT_EXPIRES_IN: {
    required: true,
    validate: (value) => /^\d+[hdwmy]$/.test(value),
    message: 'JWT_EXPIRES_IN must be in format: number + h|d|w|m|y'
  },
  EMAIL_HOST: { required: true },
  EMAIL_PORT: {
    required: true,
    validate: (value) => !isNaN(value) && value > 0,
    message: 'EMAIL_PORT must be a valid number'
  },
  EMAIL_USER: {
    required: true,
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'EMAIL_USER must be a valid email address'
  },
  EMAIL_PASS: { required: true },
  RAZORPAY_KEY_ID: { required: true },
  RAZORPAY_KEY_SECRET: { required: true }
};

/**
 * Validates environment variables
 * @throws {Error} If validation fails
 */
const validateEnvironment = () => {
  const errors = [];

  // Check for missing required variables
  Object.entries(ENV_CONFIG).forEach(([key, config]) => {
    if (config.required && !process.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    } else if (process.env[key] && config.validate) {
      try {
        if (!config.validate(process.env[key])) {
          errors.push(config.message || `Invalid value for ${key}`);
        }
      } catch (error) {
        errors.push(`Error validating ${key}: ${error.message}`);
      }
    }
  });

  // Additional security checks
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SECURE_COOKIES) {
      errors.push('SECURE_COOKIES must be set in production');
    }
    if (!process.env.TRUST_PROXY) {
      errors.push('TRUST_PROXY must be set in production');
    }
  }

  // File upload validations
  if (process.env.MAX_FILE_SIZE && isNaN(process.env.MAX_FILE_SIZE)) {
    errors.push('MAX_FILE_SIZE must be a number');
  }

  // Rate limiting validations
  if (process.env.RATE_LIMIT_WINDOW && isNaN(process.env.RATE_LIMIT_WINDOW)) {
    errors.push('RATE_LIMIT_WINDOW must be a number');
  }
  if (process.env.RATE_LIMIT_MAX && isNaN(process.env.RATE_LIMIT_MAX)) {
    errors.push('RATE_LIMIT_MAX must be a number');
  }

  // Throw all validation errors at once
  if (errors.length > 0) {
    throw new Error(
      'Environment validation failed:\n' + errors.join('\n')
    );
  }

  // Log successful validation in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    console.log('Environment validation successful');
  }
};

module.exports = validateEnvironment;