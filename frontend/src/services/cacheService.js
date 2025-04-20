import localforage from 'localforage'
import { AESEncryption } from '../security/encryption/AESEncryption'

// Create separate instances for different data types
const paymentStore = localforage.createInstance({
  name: 'smartfee',
  storeName: 'payments'
})

const studentStore = localforage.createInstance({
  name: 'smartfee',
  storeName: 'students'
})

const settingsStore = localforage.createInstance({
  name: 'smartfee',
  storeName: 'settings'
})

class CacheService {
  constructor() {
    // Default options
    this.defaultTTL = 15 * 60 * 1000 // 15 minutes
    this.stores = {
      payments: paymentStore,
      students: studentStore,
      settings: settingsStore,
    }
    this.encryptSensitiveData = true
  }
  
  async set(storeKey, key, data, options = {}) {
    try {
      const store = this.getStore(storeKey)
      if (!store) return false
      
      const ttl = options.ttl || this.defaultTTL
      const encrypt = options.encrypt ?? this.encryptSensitiveData
      
      // Prepare data with metadata
      const entry = {
        data: encrypt ? AESEncryption.encryptWithPBKDF2(data) : data,
        encrypted: encrypt,
        timestamp: Date.now(),
        expires: Date.now() + ttl
      }
      
      await store.setItem(key, entry)
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }
  
  async get(storeKey, key, options = {}) {
    try {
      const store = this.getStore(storeKey)
      if (!store) return null
      
      // Retrieve from cache
      const entry = await store.getItem(key)
      
      // If not found or expired
      if (!entry || (entry.expires && entry.expires < Date.now())) {
        if (entry) {
          // Clean up expired entry
          this.remove(storeKey, key).catch(console.error)
        }
        return null
      }
      
      // Return decrypted data if needed
      return entry.encrypted ? 
        AESEncryption.decryptWithPBKDF2(entry.data) : 
        entry.data
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }
  
  async remove(storeKey, key) {
    try {
      const store = this.getStore(storeKey)
      if (!store) return false
      
      await store.removeItem(key)
      return true
    } catch (error) {
      console.error('Cache remove error:', error)
      return false
    }
  }
  
  async clear(storeKey) {
    try {
      if (storeKey) {
        const store = this.getStore(storeKey)
        if (store) await store.clear()
      } else {
        // Clear all stores
        await Promise.all(
          Object.values(this.stores).map(store => store.clear())
        )
      }
      return true
    } catch (error) {
      console.error('Cache clear error:', error)
      return false
    }
  }
  
  async keys(storeKey) {
    try {
      const store = this.getStore(storeKey)
      if (!store) return []
      
      return await store.keys()
    } catch (error) {
      console.error('Cache keys error:', error)
      return []
    }
  }
  
  getStore(storeKey) {
    return this.stores[storeKey] || null
  }
}

export const cacheService = new CacheService()