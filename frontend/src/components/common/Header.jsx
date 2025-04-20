import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store'
import { useAuth } from '../../auth/useAuth'

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user } = useStore(state => state.auth)
  const { logout } = useAuth()
  const notifications = useStore(state => state.ui.notifications)
  
  const unreadNotifications = notifications.filter(n => !n.read)
  
  return (
    <header className="bg-white shadow h-16 flex items-center justify-between px-6">
      <div className="flex-1"></div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button className="p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none focus:bg-gray-100">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            
            {unreadNotifications.length > 0 && (
              <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
              </span>
            )}
          </button>
        </div>
        
        {/* Profile dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              {user?.name ? user.name[0].toUpperCase() : '?'}
            </div>
            <span className="font-medium text-sm">{user?.name}</span>
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg z-10">
              <Link 
                to="/profile" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                onClick={() => setDropdownOpen(false)}
              >
                Your Profile
              </Link>
              
              <Link
                to="/settings" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                onClick={() => setDropdownOpen(false)}
              >
                Settings
              </Link>
              
              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  logout()
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header