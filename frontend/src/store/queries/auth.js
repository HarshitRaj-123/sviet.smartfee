import { useQuery, useMutation } from '@tanstack/react-query'
import { axiosInstance } from '../../config/queryClient'
import { useStore } from '../index'

export const useLogin = () => {
  const setAuth = useStore((state) => state.setAuth)

  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await axiosInstance.post('/auth/login', credentials)
      return data
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens)
    },
  })
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/auth/me')
      return data
    },
  })
}