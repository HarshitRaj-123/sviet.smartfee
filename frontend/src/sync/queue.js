import { useStore } from '../store'

export class ActionQueue {
  static async addAction(action) {
    const store = useStore.getState()
    
    store.addToQueue({
      id: Date.now(),
      action,
      timestamp: Date.now(),
      retryCount: 0,
    })
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
    // Implementation depends on action type
    switch (action.type) {
      case 'CREATE':
      case 'UPDATE':
      case 'DELETE':
        // Handle CRUD operations
        break
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