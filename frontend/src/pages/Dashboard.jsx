import { useEffect } from 'react'
import { useAuth } from '../auth/useAuth'
import { useSyncWorker } from '../hooks/useSyncWorker'

const Dashboard = () => {
  const { user } = useAuth()
  const { triggerSync } = useSyncWorker()
  
  useEffect(() => {
    // Initialize sync on component mount
    triggerSync()
  }, [triggerSync])
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-2">Welcome, {user?.name || 'User'}</h2>
        <p>This is the main dashboard of the SmartFee application.</p>
      </div>
    </div>
  )
}

export default Dashboard