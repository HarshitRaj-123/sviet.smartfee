import { useEffect, useRef } from 'react'

export function useSyncWorker() {
  const workerRef = useRef(null)

  useEffect(() => {
    // Initialize the worker
    const worker = new Worker(new URL('../sync/worker.js', import.meta.url), { type: 'module' })
    
    // Set up message handling
    worker.onmessage = (event) => {
      const { type, error } = event.data
      
      switch (type) {
        case 'SYNC_COMPLETE':
          console.log('Sync completed successfully')
          break
        case 'SYNC_ERROR':
          console.error('Sync error:', error)
          break
      }
    }
    
    // Start sync
    worker.postMessage({ type: 'START_SYNC' })
    
    workerRef.current = worker
    
    // Clean up on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'STOP_SYNC' })
        workerRef.current.terminate()
      }
    }
  }, [])

  const triggerSync = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'SYNC_NOW' })
    }
  }

  return { triggerSync }
}