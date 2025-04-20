import axios from 'axios'
import { CSRFManager } from '../security/csrf/CSRFManager'
import { TokenManager } from '../security/encryption/TokenManager'
import { useStore } from '../store'

// Base URL configuration - centralized
export const API_BASE_URL = import.meta.env.VITE_API_URL || ''
export const API_PREFIX = '/api/v1'  // Standardized API prefix

const api = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`, // Apply prefix to all requests
  timeout: 10000,
  withCredentials: true
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add CSRF token
    const csrfHeaders = CSRFManager.getHeaders()
    config.headers = { ...config.headers, ...csrfHeaders }

    // Add authorization token
    const token = TokenManager.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Enhanced response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Check specifically for token expiration error
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = TokenManager.getRefreshToken()
        
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Attempt to refresh the token
        const response = await axios.post(
          `${API_BASE_URL}${API_PREFIX}/auth/refresh`,
          { refreshToken }
        )

        const { accessToken, refreshToken: newRefreshToken } = response.data
        
        if (!accessToken || !newRefreshToken) {
          throw new Error('Invalid token response')
        }

        // Save new tokens
        TokenManager.setTokens(accessToken, newRefreshToken)

        // Update the auth header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axios(originalRequest)
      } catch (refreshError) {
        // Handle refresh token failure
        console.error('Token refresh failed:', refreshError)
        
        // Get the store instance
        const store = useStore.getState()
        
        // Clear tokens and logout
        TokenManager.clearTokens()
        store.logout()
        
        window.location.href = '/login'
        return Promise.reject(new Error('Authentication failed. Please login again.'))
      }
    }

    return Promise.reject(error)
  }
)

export default api