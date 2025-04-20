import { useEffect } from 'react'
import { useStore } from '../store'
import socketService from '../services/socketService'
import { useSyncWorker } from './useSyncWorker'

export function useAppInitialization() {
  const { user, isAuthenticated } = useStore(state => state.auth)
  const { triggerSync } = useSyncWorker()
  
  // Initialize socket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      socketService.connect()
      
      // Start sync worker
      triggerSync()
      
      return () => {
        socketService.disconnect()
      }
    }
  }, [isAuthenticated, user, triggerSync])

  // Return any initialization state if needed
  return {
    initialized: true
  }
}