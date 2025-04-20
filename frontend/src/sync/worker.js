import { ActionQueue } from './queue'
import { CRDT } from './crdt/crdt'

let syncInterval = null

self.onmessage = (event) => {
  switch (event.data.type) {
    case 'START_SYNC':
      startSync()
      break
    case 'STOP_SYNC':
      stopSync()
      break
    case 'SYNC_NOW':
      syncNow()
      break
  }
}

function startSync() {
  if (syncInterval) return
  syncInterval = setInterval(syncNow, 30000) // Sync every 30 seconds
}

function stopSync() {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}

async function syncNow() {
  try {
    await ActionQueue.processQueue()
    self.postMessage({ type: 'SYNC_COMPLETE' })
  } catch (error) {
    self.postMessage({ type: 'SYNC_ERROR', error: error.message })
  }
}

// Handle network status changes
self.addEventListener('online', () => {
  syncNow()
})