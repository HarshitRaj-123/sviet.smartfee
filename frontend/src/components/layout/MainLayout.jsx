import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../common/Sidebar'
import Header from '../common/Header'
import { useStore } from '../../store'

const MainLayout = () => {
  const { isAuthenticated } = useStore(state => state.auth)
  
  if (!isAuthenticated) {
    return null
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4">
          <Suspense fallback={<div className="flex justify-center p-6">Loading...</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default MainLayout