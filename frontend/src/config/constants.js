export const ENCRYPTION_KEY = import.meta.env.VITE_CRYPTO_SECRET
export const TOKEN_VERSION = 'v1'
export const REFRESH_TOKEN_KEY = 'refresh_token'
export const ACCESS_TOKEN_KEY = 'access_token'
export const SESSION_TIMEOUT = 900000 // 15 minutes in milliseconds
export const ROLES = {
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant', 
  STUDENT: 'student'
}
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.ACCOUNTANT]: 2,
  [ROLES.STUDENT]: 1
}