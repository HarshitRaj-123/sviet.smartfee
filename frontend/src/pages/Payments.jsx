import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../config/axios'

const Payments = () => {
  const [filter, setFilter] = useState({
    status: 'all',
    dateRange: 'month'
  })

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payments', filter],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/payments', { params: filter })
      return data.payments
    }
  })

  if (isLoading) return <div className="p-4">Loading payments...</div>
  if (error) return <div className="p-4 text-red-500">Error loading payments: {error.message}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payment Management</h1>
      
      <div className="mb-4 flex gap-4">
        <select 
          className="border rounded px-3 py-2"
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        
        <select 
          className="border rounded px-3 py-2"
          value={filter.dateRange}
          onChange={(e) => setFilter({...filter, dateRange: e.target.value})}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments?.length > 0 ? (
              payments.map(payment => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{payment.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{payment.studentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(payment.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${payment.status === 'failed' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                    <button className="text-blue-600 hover:text-blue-900">Receipt</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No payments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Payments