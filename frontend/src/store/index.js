import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { AESEncryption } from '../security/encryption/AESEncryption'
import { authSlice } from './slices/authSlice'
import { uiSlice } from './slices/uiSlice'
import { offlineSlice } from './slices/offlineSlice'

// Custom encrypted storage
const encryptedStorage = {
  getItem: async (name) => {
    const value = localStorage.getItem(name)
    if (value) {
      return JSON.parse(AESEncryption.decrypt(value))
    }
    return null
  },
  setItem: async (name, value) => {
    localStorage.setItem(name, AESEncryption.encrypt(JSON.stringify(value)))
  },
  removeItem: async (name) => {
    localStorage.removeItem(name)
  },
}

// Create store with middleware
export const useStore = create(
  persist(
    (set, get) => ({
      ...authSlice(set, get),
      ...uiSlice(set, get),
      ...offlineSlice(set, get),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => encryptedStorage),
      partialize: (state) => ({
        auth: state.auth,
        ui: state.ui,
        offline: state.offline // Added offline state to persist
      }),
    }
  )
)

// Cross-tab synchronization
if (typeof window !== 'undefined') {
  const channel = new BroadcastChannel('app-state')
  
  useStore.subscribe((state) => {
    channel.postMessage({ type: 'STATE_UPDATE', state })
  })

  channel.onmessage = (event) => {
    if (event.data.type === 'STATE_UPDATE') {
      useStore.setState(event.data.state)
    }
  }
}