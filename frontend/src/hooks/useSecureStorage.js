import { AESEncryption } from '../security/encryption/AESEncryption'

export const useSecureStorage = () => {
  const setItem = (key, value) => {
    try {
      const encrypted = AESEncryption.encrypt(value)
      localStorage.setItem(key, encrypted)
    } catch (error) {
      console.error('Error storing data:', error)
      throw error
    }
  }

  const getItem = (key) => {
    try {
      const encrypted = localStorage.getItem(key)
      return encrypted ? AESEncryption.decrypt(encrypted) : null
    } catch (error) {
      console.error('Error retrieving data:', error)
      return null
    }
  }

  const removeItem = (key) => {
    localStorage.removeItem(key)
  }

  return { setItem, getItem, removeItem }
}