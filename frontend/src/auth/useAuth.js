import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useLogin as useLoginMutation } from '../store/queries/auth'
import { TokenManager } from '../security/encryption/TokenManager'
import { SessionManager } from '../security/session/SessionManger'
import socketService from '../services/socketService'

export const useAuth = () => {
  const navigate = useNavigate()
  const { mutateAsync: loginMutation, isLoading: isLoginLoading, error: loginError } = useLoginMutation()
  
  const {
    auth: { user, isAuthenticated },
    setAuth,
    logout: logoutStore
  } = useStore()

  const login = useCallback(async (credentials) => {
    try {
      const response = await loginMutation(credentials)
      
      if (!response.user || !response.token) {
        throw new Error('Invalid login response')
      }
      
      // Initialize session
      SessionManager.initSession(response.user.id)
      
      // Initialize socket connection after login
      socketService.connect()
      
      return {
        success: true,
        user: response.user
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Authentication failed'
      }
    }
  }, [loginMutation])

  const logout = useCallback(() => {
    // Disconnect socket
    socketService.disconnect()
    
    // Clear tokens from storage
    TokenManager.clearTokens()
    
    // Clear session
    SessionManager.clearSession()
    
    // Update store state
    logoutStore()
    
    // Redirect to login
    navigate('/login')
  }, [logoutStore, navigate])

  const isUserAuthenticated = useCallback(() => {
    // Check if user and tokens exist
    if (!user || !TokenManager.getAccessToken()) {
      return false
    }
    
    // Check session validity
    if (!SessionManager.validateSession()) {
      logout()
      return false
    }
    
    return isAuthenticated
  }, [isAuthenticated, logout, user])

  return {
    user,
    isAuthenticated: isUserAuthenticated(),
    login,
    logout,
    isLoginLoading,
    loginError
  }
}