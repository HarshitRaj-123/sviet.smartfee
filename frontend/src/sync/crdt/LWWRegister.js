// Last-Write-Wins Register implementation
export class LWWRegister {
  constructor(id, initialValue = null) {
    this.id = id
    this.timestamp = Date.now()
    this.nodeId = this.generateNodeId()
    this.value = initialValue
  }
  
  // Generate a node ID based on browser fingerprint
  generateNodeId() {
    const nav = window.navigator
    const screen = window.screen
    const fingerprint = [
      nav.userAgent,
      screen.width,
      screen.height,
      nav.language,
      new Date().getTimezoneOffset()
    ].join('.')
    
    return this.hashString(fingerprint)
  }
  
  hashString(str) {
    let hash = 0
    if (str.length === 0) return hash
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }
  
  // Update value with timestamp
  update(newValue) {
    const now = Date.now()
    if (now >= this.timestamp) {
      this.value = newValue
      this.timestamp = now
    }
    return this
  }
  
  // Merge with another register
  merge(other) {
    if (!(other instanceof LWWRegister)) {
      throw new Error('Can only merge with another LWWRegister')
    }
    
    if (other.timestamp > this.timestamp || 
        (other.timestamp === this.timestamp && other.nodeId > this.nodeId)) {
      this.value = other.value
      this.timestamp = other.timestamp
      // Keep our nodeId
    }
    
    return this
  }
  
  // Serialize for storage/transmission
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      nodeId: this.nodeId,
      value: this.value
    }
  }
  
  // Deserialize from storage/transmission
  static fromJSON(json) {
    const register = new LWWRegister(json.id)
    register.timestamp = json.timestamp
    register.nodeId = json.nodeId
    register.value = json.value
    return register
  }
}