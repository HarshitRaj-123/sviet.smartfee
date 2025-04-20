import { io } from 'socket.io-client'
import { TokenManager } from '../security/encryption/TokenManager'
import { API_BASE_URL } from '../config/axios'

class PresenceService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.presenceInterval = null
    this.typingTimeouts = {}
    this.userStatus = {}
    this.listeners = new Map()
  }
  
  connect() {
    if (this.socket) return
    
    const token = TokenManager.getAccessToken()
    if (!token) return
    
    this.socket = io(`${API_BASE_URL}/presence`, {
      auth: {
        token
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })
    
    this.setupListeners()
    this.startHeartbeat()
  }
  
  setupListeners() {
    this.socket.on('connect', () => {
      console.log('Presence service connected')
      this.isConnected = true
      this.notifyListeners('connectionChange', true)
    })
    
    this.socket.on('disconnect', () => {
      console.log('Presence service disconnected')
      this.isConnected = false
      this.notifyListeners('connectionChange', false)
    })
    
    this.socket.on('presence:update', (data) => {
      this.userStatus = { ...this.userStatus, ...data }
      this.notifyListeners('statusUpdate', this.userStatus)
    })
    
    this.socket.on('presence:typing', ({ userId, isTyping }) => {
      this.notifyListeners('typing', { userId, isTyping })
      
      // Clear existing timeout if any
      if (this.typingTimeouts[userId]) {
        clearTimeout(this.typingTimeouts[userId])
      }
      
      // Set timeout to clear typing indicator after 3 seconds
      if (isTyping) {
        this.typingTimeouts[userId] = setTimeout(() => {
          this.notifyListeners('typing', { userId, isTyping: false })
        }, 3000)
      }
    })
  }
  
  startHeartbeat() {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval)
    }
    
    this.presenceInterval = setInterval(() => {
      if (this.isConnected) {
        this.socket.emit('presence:heartbeat', {
          status: document.visibilityState === 'visible' ? 'active' : 'away',
          lastActivity: Date.now()
        })
      }
    }, 30000) // Every 30 seconds
  }
  
  setTyping(conversationId, isTyping) {
    if (!this.isConnected) return
    
    this.socket.emit('presence:typing', {
      conversationId,
      isTyping
    })
  }
  
  disconnect() {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval)
      this.presenceInterval = null
    }
    
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    
    this.isConnected = false
    this.typingTimeouts = {}
    this.userStatus = {}
  }
  
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    
    this.listeners.get(event).add(callback)
    return () => this.removeListener(event, callback)
  }
  
  removeListener(event, callback) {
    if (!this.listeners.has(event)) return
    
    this.listeners.get(event).delete(callback)
  }
  
  notifyListeners(event, data) {
    if (!this.listeners.has(event)) return
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in presence listener for event ${event}:`, error)
      }
    })
  }
  
  getUserStatus(userId) {
    return this.userStatus[userId] || { status: 'offline', lastActive: null }
  }
  
  isUserOnline(userId) {
    const status = this.getUserStatus(userId)
    return status.status !== 'offline'
  }
}

export const presenceService = new PresenceService()