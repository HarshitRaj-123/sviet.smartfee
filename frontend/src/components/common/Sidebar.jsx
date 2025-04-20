import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { RoleManager } from '../../utils/roles'

const Sidebar = () => {
  const { user } = useStore(state => state.auth)
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  
  if (!user) return null
  
  const isAdmin = RoleManager.isAdmin(user.role)
  const isAccountant = RoleManager.isAccountant(user.role)
  const isStudent = RoleManager.isStudent(user.role)
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-indigo-800 text-white' : 'text-gray-300 hover:bg-indigo-700'
  }
  
  return (
    <div className={`bg-indigo-900 text-white h-screen ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex flex-col`}>
      <div className="p-4 flex items-center justify-between">
        {!collapsed && <h1 className="text-xl font-bold">SmartFee</h1>}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1 rounded-full hover:bg-indigo-700"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1">
        <nav className="mt-5 px-2">
          {/* Dashboard - Available for all roles */}
          <Link 
            to="/" 
            className={`${isActive('/')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
          >
            <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {!collapsed && <span>Dashboard</span>}
          </Link>

          {/* Users Management - Admin only */}
          {isAdmin && (
            <>
              <div className={`${!collapsed ? 'mt-3 mb-1 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider' : 'mt-3 mb-1'}`}>
                {!collapsed && 'Users Management'}
              </div>
              
              <Link 
                to="/students" 
                className={`${isActive('/students')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
              >
                <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {!collapsed && <span>Students</span>}
              </Link>
              
              <Link 
                to="/accountants" 
                className={`${isActive('/accountants')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
              >
                <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {!collapsed && <span>Accountants</span>}
              </Link>
              
              <Link 
                to="/admins" 
                className={`${isActive('/admins')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
              >
                <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {!collapsed && <span>Admins</span>}
              </Link>
            </>
          )}
          
          {/* Fee Management */}
          {(isAdmin || isAccountant) && (
            <>
              <div className={`${!collapsed ? 'mt-3 mb-1 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider' : 'mt-3 mb-1'}`}>
                {!collapsed && 'Fee Management'}
              </div>
              
              <Link 
                to="/fee-structures" 
                className={`${isActive('/fee-structures')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
              >
                <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {!collapsed && <span>Fee Structures</span>}
              </Link>
              
              <Link 
                to="/payments" 
                className={`${isActive('/payments')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
              >
                <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {!collapsed && <span>Payments</span>}
              </Link>
              
              <Link 
                to="/transactions" 
                className={`${isActive('/transactions')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
              >
                <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                {!collapsed && <span>Transactions</span>}
              </Link>
            </>
          )}
          
          {/* Student specific options */}
          {isStudent && (
            <>
              <div className={`${!collapsed ? 'mt-3 mb-1 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider' : 'mt-3 mb-1'}`}>
                {!collapsed && 'My Information'}
              </div>
              
              <Link 
                to="/profile" 
                className={`${isActive('/profile')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
              >
                <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {!collapsed && <span>My Profile</span>}
              </Link>
              
              <Link 
                to="/my-fees" 
                className={`${isActive('/my-fees')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
              >
                <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {!collapsed && <span>My Fees</span>}
              </Link>
              
              <Link 
                to="/payment-history" 
                className={`${isActive('/payment-history')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
              >
                <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {!collapsed && <span>Payment History</span>}
              </Link>
              
              <Link 
                to="/support" 
                className={`${isActive('/support')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
              >
                <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {!collapsed && <span>Support</span>}
              </Link>
            </>
          )}
          
          {/* Common sections */}
          <div className={`${!collapsed ? 'mt-3 mb-1 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider' : 'mt-3 mb-1'}`}>
            {!collapsed && 'General'}
          </div>
          
          {/* Notifications - Available for all */}
          <Link 
            to="/notifications" 
            className={`${isActive('/notifications')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
          >
            <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {!collapsed && <span>Notifications</span>}
          </Link>
          
          {/* Announcements - Available for all */}
          <Link 
            to="/announcements" 
            className={`${isActive('/announcements')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
          >
            <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            {!collapsed && <span>Announcements</span>}
          </Link>
          
          {/* Settings - Admin only */}
          {isAdmin && (
            <Link 
              to="/settings" 
              className={`${isActive('/settings')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
            >
              <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {!collapsed && <span>Settings</span>}
            </Link>
          )}
          
          {/* Reports - Admin and Accountant */}
          {(isAdmin || isAccountant) && (
            <Link 
              to="/reports" 
              className={`${isActive('/reports')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
            >
              <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {!collapsed && <span>Reports</span>}
            </Link>
          )}
          
          {/* Audit Logs - Admin only */}
          {isAdmin && (
            <Link 
              to="/audit-logs" 
              className={`${isActive('/audit-logs')} group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1`}
            >
              <svg className="mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              {!collapsed && <span>Audit Logs</span>}
            </Link>
          )}
        </nav>
      </div>
      
      {/* User profile section */}
      <div className={`p-4 border-t border-indigo-800 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              {user.name ? user.name[0].toUpperCase() : '?'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-300">{user.role}</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            {user.name ? user.name[0].toUpperCase() : '?'}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar