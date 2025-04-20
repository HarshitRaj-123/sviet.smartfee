class AnalyticsService {
  constructor() {
    this.enabled = false
    this.userId = null
    this.sessionId = this.generateSessionId()
    this.eventQueue = []
    this.isQueueProcessing = false
    this.flushInterval = null
    this.pageViewTimestamp = null
    this.endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT || '/api/v1/analytics'
    this.initialized = false
  }
  
  init(userId) {
    if (this.initialized) return
    
    this.userId = userId
    this.enabled = true
    this.initialized = true
    
    // Track page views
    this.trackPageView()
    
    // Set up listeners
    this.setupListeners()
    
    // Start flush interval (send events batch every 30s)
    this.flushInterval = setInterval(() => this.flush(), 30000)
    
    // Ensure events are sent before page unload
    window.addEventListener('beforeunload', () => this.flush(true))
  }
  
  generateSessionId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }
  
  setupListeners() {
    // Track client-side route changes
    const pushState = history.pushState
    history.pushState = (...args) => {
      pushState.apply(history, args)
      this.trackPageView()
    }
    
    window.addEventListener('popstate', () => this.trackPageView())
    
    // Track clicks on certain elements
    document.addEventListener('click', (event) => {
      // Track button clicks
      if (event.target.tagName === 'BUTTON' || 
          event.target.closest('button')) {
        const button = event.target.tagName === 'BUTTON' ? 
                       event.target : event.target.closest('button')
        
        this.trackEvent('click', {
          element: 'button',
          id: button.id || null,
          text: button.innerText || null,
          class: button.className || null
        })
      }
      
      // Track link clicks
      if (event.target.tagName === 'A' || 
          event.target.closest('a')) {
        const link = event.target.tagName === 'A' ? 
                     event.target : event.target.closest('a')
        
        this.trackEvent('click', {
          element: 'link',
          href: link.href || null,
          id: link.id || null,
          text: link.innerText || null
        })
      }
    })
  }
  
  trackPageView() {
    if (!this.enabled) return
    
    const previousPage = this.pageViewTimestamp ? {
      path: this.lastPageViewPath,
      timeSpent: Date.now() - this.pageViewTimestamp
    } : null
    
    this.pageViewTimestamp = Date.now()
    this.lastPageViewPath = window.location.pathname
    
    this.trackEvent('pageview', {
      path: window.location.pathname,
      referrer: document.referrer || null,
      previousPage
    })
  }
  
  trackEvent(eventName, data = {}) {
    if (!this.enabled) return
    
    this.eventQueue.push({
      eventName,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      data
    })
    
    // Auto-flush if queue gets too large
    if (this.eventQueue.length >= 20) {
      this.flush()
    }
  }
  
  async flush(forceSynchronous = false) {
    if (!this.enabled || this.isQueueProcessing || this.eventQueue.length === 0) return
    
    this.isQueueProcessing = true
    const eventsToSend = [...this.eventQueue]
    this.eventQueue = []
    
    try {
      // Use sendBeacon for better reliability when page is unloading
      if (forceSynchronous && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(eventsToSend)], { type: 'application/json' })
        navigator.sendBeacon(this.endpoint, blob)
      } else {
        // Use fetch for normal operation
        await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventsToSend),
          keepalive: true
        })
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error)
      // Add back to queue on failure
      this.eventQueue = [...eventsToSend, ...this.eventQueue]
    } finally {
      this.isQueueProcessing = false
    }
  }
  
  // Conversion tracking
  trackConversion(funnelName, step, data = {}) {
    this.trackEvent('conversion', {
      funnel: funnelName,
      step,
      ...data
    })
  }
  
  // Feature usage tracking
  trackFeatureUsage(featureName, action, data = {}) {
    this.trackEvent('feature', {
      feature: featureName,
      action,
      ...data
    })
  }
  
  // Error tracking
  trackError(errorType, message, stack = null) {
    this.trackEvent('error', {
      type: errorType,
      message,
      stack
    })
  }
  
  // Clean up
  dispose() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    
    // Send any remaining events
    this.flush(true)
    
    this.enabled = false
    this.initialized = false
  }
}

export const analyticsService = new AnalyticsService()