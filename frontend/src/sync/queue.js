import { useStore } from '../store'
import api from '../config/axios'

export class ActionQueue {
  static async addAction(action) {
    const store = useStore.getState()
    
    store.addToQueue({
      id: Date.now(),
      action,
      timestamp: Date.now(),
      retryCount: 0,
    })

    // Try to process queue immediately if online
    if (navigator.onLine) {
      this.processQueue()
    }
  }

  static async processQueue() {
    const store = useStore.getState()
    if (store.offline.isSyncing) return

    store.setSyncing(true)

    try {
      const queue = store.offline.queue

      for (const item of queue) {
        try {
          if (!navigator.onLine) break

          await this.processAction(item.action)
          store.removeFromQueue(item.id)
        } catch (error) {
          console.error('Failed to process action:', error)
          item.retryCount++
          if (item.retryCount > 3) {
            store.removeFromQueue(item.id)
          }
        }
      }
    } finally {
      store.setSyncing(false)
    }
  }

  static async processAction(action) {
    // Implementation for CRUD operations
    switch (action.type) {
      case 'CREATE':
        return await api.post(action.endpoint, action.data)
      
      case 'UPDATE':
        return await api.put(`${action.endpoint}/${action.id}`, action.data)
      
      case 'DELETE':
        return await api.delete(`${action.endpoint}/${action.id}`)
      
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }
}

// Listen for online status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    ActionQueue.processQueue()
  })
}