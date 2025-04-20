import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals'
import * as Sentry from '@sentry/react'

// Configure endpoints
const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT || '/api/v1/analytics/vitals'

class WebVitalsService {
  constructor() {
    this.metrics = {}
    this.isEnabled = false
  }
  
  enable() {
    if (this.isEnabled) return
    
    this.isEnabled = true
    this.startTracking()
  }
  
  startTracking() {
    // Core Web Vitals
    onCLS(this.handleMetric.bind(this))
    onFID(this.handleMetric.bind(this))
    onLCP(this.handleMetric.bind(this))
    
    // Additional metrics
    onFCP(this.handleMetric.bind(this))
    onTTFB(this.handleMetric.bind(this))
    
    // Track custom metrics
    this.trackJSErrors()
    this.trackResourceLoads()
    this.trackInteractions()
  }
  
  handleMetric(metric) {
    // Store metrics
    this.metrics[metric.name] = metric.value
    
    // Send to analytics
    this.sendToAnalytics({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      navigationType: metric.navigationType || 'navigate'
    })
    
    // Send to Sentry for performance monitoring
    if (Sentry) {
      Sentry.setTag(`web_vital_${metric.name.toLowerCase()}`, metric.value)
      
      if (metric.name === 'CLS' && metric.value > 0.25) {
        Sentry.captureMessage(`High CLS detected: ${metric.value}`, 'warning')
      }
      
      if (metric.name === 'LCP' && metric.value > 4000) {
        Sentry.captureMessage(`Slow LCP detected: ${metric.value}ms`, 'warning')
      }
    }
  }
  
  sendToAnalytics(data) {
    const payload = {
      ...data,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        rtt: navigator.connection.rtt,
        downlink: navigator.connection.downlink
      } : undefined
    }
    
    // Use sendBeacon when available for better reliability
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      navigator.sendBeacon(ANALYTICS_ENDPOINT, blob)
    } else {
      fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        },
        keepalive: true
      }).catch(err => console.error('Failed to send analytics', err))
    }
  }
  
  trackJSErrors() {
    window.addEventListener('error', (event) => {
      this.sendToAnalytics({
        name: 'JS_ERROR',
        value: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        type: 'error'
      })
    })
  }
  
  trackResourceLoads() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
          const duration = entry.duration
          
          // Only track slow resource loads (> 3s)
          if (duration > 3000) {
            this.sendToAnalytics({
              name: 'SLOW_RESOURCE',
              value: duration,
              resourceUrl: entry.name,
              initiatorType: entry.initiatorType,
              type: 'performance'
            })
          }
        }
      }
    })
    
    observer.observe({ entryTypes: ['resource'] })
  }
  
  trackInteractions() {
    let lastInteraction = 0
    
    // Track time to first interaction
    window.addEventListener('click', () => {
      if (lastInteraction === 0) {
        lastInteraction = Date.now()
        const tti = lastInteraction - performance.timing.navigationStart
        
        this.sendToAnalytics({
          name: 'TTI',
          value: tti,
          type: 'interaction'
        })
      }
    }, { once: true })
  }
  
  getMetrics() {
    return { ...this.metrics }
  }
}

export const webVitals = new WebVitalsService()

// Initialize vitals tracking when the page loads
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    webVitals.enable()
  } else {
    window.addEventListener('load', () => webVitals.enable())
  }
}