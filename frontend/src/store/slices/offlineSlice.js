export const offlineSlice = (set, get) => ({
  offline: {
    queue: [],
    isSyncing: false,
  },
  addToQueue: (action) =>
    set((state) => ({
      offline: {
        ...state.offline,
        queue: [...state.offline.queue, action],
      }
    })),
  removeFromQueue: (actionId) =>
    set((state) => ({
      offline: {
        ...state.offline,
        queue: state.offline.queue.filter(a => a.id !== actionId),
      }
    })),
  setSyncing: (isSyncing) =>
    set((state) => ({
      offline: {
        ...state.offline,
        isSyncing,
      }
    })),
})