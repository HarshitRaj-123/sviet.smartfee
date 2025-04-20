import axios from 'axios'
import { CSRFManager } from '../security/csrf/CSRFManager'
import { TokenManager } from '../security/encryption/TokenManager'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = TokenManager.getRefreshToken()
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          refreshToken
        })

        const { accessToken, newRefreshToken } = response.data
        TokenManager.setTokens(accessToken, newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axios(originalRequest)
      } catch (error) {
        // Handle refresh token failure
        TokenManager.clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api