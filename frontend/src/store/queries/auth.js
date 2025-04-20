import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '../../config/queryClient'
import { useStore } from '../index'

export const useLogin = () => {
  const setAuth = useStore((state) => state.setAuth)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials) => {
      try {
        const { data } = await axiosInstance.post('/api/v1/auth/login', credentials)
        
        if (!data || !data.success) {
          throw new Error(data?.message || 'Login failed')
        }
        
        return data
      } catch (error) {
        // Enhance error handling
        const errorMessage = 
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Login failed'
        
        throw new Error(errorMessage)
      }
    },
    onSuccess: (data) => {
      if (data.user && data.token) {
        setAuth(data.user, { access: data.token, refresh: data.refreshToken })
        
        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      } else {
        throw new Error('Invalid response data')
      }
    },
    onError: (error) => {
      console.error('Login error:', error)
      // Error is propagated to the component using the mutation
    }
  })
}

export const useCurrentUser = () => {
  const setAuth = useStore((state) => state.setAuth)
  
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get('/api/v1/auth/me')
        return data
      } catch (error) {
        // If 401, clear auth state
        if (error.response?.status === 401) {
          setAuth(null, null)
        }
        throw error
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized)
      if (error.response?.status === 401) return false
      // Retry other errors up to 3 times
      return failureCount < 3
    },
    // Only run if we have an auth token
    enabled: !!useStore.getState().auth.tokens?.access,
  })
}