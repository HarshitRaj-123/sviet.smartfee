import { useQuery, useMutation } from '@tanstack/react-query'
import { axiosInstance } from '../../config/queryClient'

export const useStudents = (options = {}) => {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/students')
      return data
    },
    ...options
  })
}

export const useStudent = (id) => {
  return useQuery({
    queryKey: ['students', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/students/${id}`)
      return data
    },
    enabled: !!id
  })
}

export const useCreateStudent = () => {
  return useMutation({
    mutationFn: async (studentData) => {
      const { data } = await axiosInstance.post('/students', studentData)
      return data
    }
  })
}