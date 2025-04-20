import { useQuery, useMutation } from '@tanstack/react-query'
import { axiosInstance } from '../../config/queryClient'

export const usePayments = (options = {}) => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/payments')
      return data
    },
    ...options
  })
}

export const usePayment = (id) => {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/payments/${id}`)
      return data
    },
    enabled: !!id
  })
}

export const useCreatePayment = () => {
  return useMutation({
    mutationFn: async (paymentData) => {
      const { data } = await axiosInstance.post('/payments', paymentData)
      return data
    }
  })
}

export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: async ({ paymentId, verificationData }) => {
      const { data } = await axiosInstance.post(
        `/payments/${paymentId}/verify`, 
        verificationData
      )
      return data
    }
  })
}