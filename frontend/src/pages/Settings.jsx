import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useStore } from '../store'
import api from '../config/axios'

const Settings = () => {
  const theme = useStore(state => state.ui.theme)
  const language = useStore(state => state.ui.language)
  const { setTheme, setLanguage } = useStore()
  
  const [smtpSettings, setSmtpSettings] = useState({
    host: '',
    port: '',
    secure: true,
    auth: {
      user: '',
      pass: ''
    }
  })
  
  // Mutation for saving SMTP settings
  const { mutate: saveSettings, isLoading } = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/settings/smtp', data)
      return response.data
    },
    onSuccess: () => {
      useStore.getState().addNotification({
        type: 'success',
        message: 'SMTP settings saved successfully',
        title: 'Settings Updated'
      })
    },
    onError: (error) => {
      useStore.getState().addNotification({
        type: 'error',
        message: `Failed to save settings: ${error.message}`,
        title: 'Error'
      })
    }
  })
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setSmtpSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setSmtpSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    saveSettings(smtpSettings)
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Application Preferences</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <div className="flex gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`px-4 py-2 rounded-md ${
                  theme === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-4 py-2 rounded-md ${
                  theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`px-4 py-2 rounded-md ${
                  theme === 'system' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                System
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">SMTP Settings</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Host
              </label>
              <input
                type="text"
                id="host"
                name="host"
                value={smtpSettings.host}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="smtp.example.com"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Port
              </label>
              <input
                type="text"
                id="port"
                name="port"
                value={smtpSettings.port}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="587"
              />
            </div>
            
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="secure"
                name="secure"
                checked={smtpSettings.secure}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="secure" className="ml-2 block text-sm text-gray-700">
                Use SSL/TLS
              </label>
            </div>
            
            <div className="mb-4">
              <label htmlFor="auth.user" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="auth.user"
                name="auth.user"
                value={smtpSettings.auth.user}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="auth.pass" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="auth.pass"
                name="auth.pass"
                value={smtpSettings.auth.pass}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-blue-300"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Settings