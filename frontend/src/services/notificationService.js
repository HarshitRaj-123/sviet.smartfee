import { io } from 'socket.io-client'
import { TokenManager } from '../security/encryption/TokenManager'
import { API_BASE_URL } from '../config/axios'
import { useStore } from '../store'

class NotificationService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.notifications = []
    this.unreadCount = 0
    this.listeners = new Map()
  }
  
  connect() {
    if (this.socket) return
    
    const token = TokenManager.getAccessToken()
    if (!token) return
    
    this.socket = io(`${API_BASE_URL}/notifications`, {
      auth: {
        token
      },
      transports: ['websocket']
    })
    
    this.setupListeners()
    this.loadInitialNotifications()
  }
  
  setupListeners() {
    this.socket.on('connect', () => {
      console.log('Notification service connected')
      this.isConnected = true
      this.notifyListeners('connectionChange', true)
    })
    
    this.socket.on('disconnect', () => {
      console.log('Notification service disconnected')
      this.isConnected = false
      this.notifyListeners('connectionChange', false)
    })
    
    this.socket.on('notification:new', (notification) => {
      this.notifications.unshift(notification)
      this.unreadCount++
      
      this.notifyListeners('new', notification)
      this.notifyListeners('unreadCount', this.unreadCount)
      
      // Send to UI notification stack
      const store = useStore.getState()
      store.addNotification?.({
        id: notification.id,
        type: this.mapPriorityToType(notification.priority),
        message: notification.message,
        title: this.mapTypeToTitle(notification.notificationType),
        duration: 6000,
        actionable: !!notification.actionUrl,
        action: notification.actionUrl ? {
          label: 'View',
          url: notification.actionUrl
        } : null
      })
    })
    
    this.socket.on('notification:read', (id) => {
      const notification = this.notifications.find(n => n.id === id)
      if (notification && !notification.read) {
        notification.read = true
        this.unreadCount = Math.max(0, this.unreadCount - 1)
        
        this.notifyListeners('read', id)
        this.notifyListeners('unreadCount', this.unreadCount)
      }
    })
  }
  
  async loadInitialNotifications() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications`, {
        headers: {
          'Authorization': `Bearer ${TokenManager.getAccessToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to load notifications')
      }
      
      const data = await response.json()
      
      this.notifications = data.notifications || []
      this.unreadCount = this.notifications.filter(n => !n.read).length
      
      this.notifyListeners('initial', this.notifications)
      this.notifyListeners('unreadCount', this.unreadCount)
    } catch (error) {
      console.error('Failed to load initial notifications:', error)
    }
  }
  
  markAsRead(id) {
    if (!this.isConnected) return
    
    this.socket.emit('notification:markAsRead', { id })
  }
  
  markAllAsRead() {
    if (!this.isConnected) return
    
    this.socket.emit('notification:markAllAsRead')
    
    this.notifications.forEach(notification => {
      notification.read = true
    })
    
    this.unreadCount = 0
    this.notifyListeners('readAll')
    this.notifyListeners('unreadCount', 0)
  }
  
  getNotifications(limit = 10, offset = 0) {
    return this.notifications.slice(offset, offset + limit)
  }
  
  getUnreadCount() {
    return this.unreadCount
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    
    this.isConnected = false
    this.notifications = []
    this.unreadCount = 0
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
        console.error(`Error in notification listener for event ${event}:`, error)
      }
    })
  }
  
  mapPriorityToType(priority) {
    const map = {
      HIGH: 'error',
      MEDIUM: 'warning',
      LOW: 'info'
    }
    return map[priority] || 'info'
  }
  
  mapTypeToTitle(type) {
    const map = {
      PAYMENT_SUCCESS: 'Payment Successful',
      PAYMENT_DUE: 'Payment Due',
      CHEQUE_BOUNCE: 'Cheque Bounced',
      FINE_IMPOSED: 'Fine Imposed',
      DEADLINE_REMINDER: 'Deadline Reminder',
      CUSTOM: 'Notification'
    }
    return map[type] || 'Notification'
  }
}

export const notificationService = new NotificationService()