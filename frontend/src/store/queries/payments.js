import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../config/axios'
import { useStore } from '../index'
import { ActionQueue } from '../../sync/queue'

// Get all payments with filtering
export const usePayments = (filters = {}) => {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => {
      const { data } = await api.get('/payments', { params: filters })
      return data
    },
    staleTime: 60000, // 1 minute
  })
}

// Get a single payment by ID
export const usePayment = (id) => {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: async () => {
      if (!id) return null
      const { data } = await api.get(`/payments/${id}`)
      return data
    },
    enabled: !!id,
  })
}

// Create a payment with offline support
export const useCreatePayment = () => {
  const queryClient = useQueryClient()
  const isOnline = navigator.onLine
  
  return useMutation({
    mutationFn: async (paymentData) => {
      if (!isOnline) {
        // Add to offline queue
        await ActionQueue.addAction({
          type: 'CREATE',
          endpoint: '/payments',
          data: paymentData
        })
        
        // Return optimistic response
        return {
          id: `temp-${Date.now()}`,
          ...paymentData,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      }
      
      // Online - process normally
      const { data } = await api.post('/payments', paymentData)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      
      // Show success notification
      const store = useStore.getState()
      store.addNotification({
        type: 'success',
        message: 'Payment created successfully',
        title: 'Success',
        duration: 3000
      })
    },
    onError: (error) => {
      // Show error notification
      const store = useStore.getState()
      store.addNotification({
        type: 'error',
        message: error.message || 'Failed to create payment',
        title: 'Error',
        duration: 5000
      })
    }
  })
}