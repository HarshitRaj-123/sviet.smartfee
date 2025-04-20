import { QueryClient } from '@tanstack/react-query'
import { setupCache } from 'axios-cache-interceptor'
import axios from 'axios'

// Create axios instance with caching
export const axiosInstance = setupCache(
  axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  })
)

// Configure query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: (failureCount, error) => {
        if (error.response?.status === 404) return false
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})