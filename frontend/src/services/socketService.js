import { io } from 'socket.io-client'
import { API_BASE_URL } from '../config/axios'
import { TokenManager } from '../security/encryption/TokenManager'
import { useStore } from '../store'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 1000
    this.listeners = {}
  }

  connect() {
    if (this.socket) return

    const accessToken = TokenManager.getAccessToken()
    
    if (!accessToken) {
      console.error('Cannot connect to socket: No authentication token')
      return
    }

    this.socket = io(API_BASE_URL, {
      auth: { token: accessToken },
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
      transports: ['websocket', 'polling']
    })

    this.setupListeners()
  }

  setupListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected')
      this.isConnected = true
      this.reconnectAttempts = 0
      
      // Notify components that we're connected
      this.emit('connectionStateChanged', true)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      this.isConnected = false
      
      // Notify components
      this.emit('connectionStateChanged', false)
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    this.socket.on('reconnect_attempt', (attempt) => {
      this.reconnectAttempts = attempt
      console.log(`Socket reconnection attempt ${attempt}`)
    })

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after max attempts')
    })

    // Handle notifications
    this.socket.on('notification', (notification) => {
      const store = useStore.getState()
      store.addNotification(notification)
    })

    // Handle online status updates
    this.socket.on('userStatusChanged', (data) => {
      const store = useStore.getState()
      store.updateUserStatus(data.userId, data.status)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  emit(event, data) {
    if (!this.socket || !this.isConnected) {
      console.warn('Cannot emit event: Socket not connected')
      return false
    }

    this.socket.emit(event, data)
    return true
  }

  on(event, callback) {
    if (!this.socket) return

    this.socket.on(event, callback)
    
    // Store listener for cleanup
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event, callback) {
    if (!this.socket) return

    if (callback) {
      this.socket.off(event, callback)
      
      // Remove specific listener
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
      }
    } else {
      // Remove all listeners for this event
      this.socket.off(event)
      this.listeners[event] = []
    }
  }
}

// Create singleton instance
const socketService = new SocketService()

// Hook for React components
export const useSocket = () => {
  return {
    connect: socketService.connect.bind(socketService),
    disconnect: socketService.disconnect.bind(socketService),
    emit: socketService.emit.bind(socketService),
    on: socketService.on.bind(socketService),
    off: socketService.off.bind(socketService),
    isConnected: () => socketService.isConnected
  }
}

export default socketService