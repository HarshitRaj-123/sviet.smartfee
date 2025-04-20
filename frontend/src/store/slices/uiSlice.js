export const uiSlice = (set) => ({
  ui: {
    theme: 'light',
    language: 'en',
    isLoading: false,
    notifications: [],
    modal: {
      isOpen: false,
      type: null,
      data: null
    }
  },
  setTheme: (theme) => 
    set((state) => ({
      ui: { ...state.ui, theme }
    })),
  setLanguage: (language) => 
    set((state) => ({
      ui: { ...state.ui, language }
    })),
  setLoading: (isLoading) => 
    set((state) => ({
      ui: { ...state.ui, isLoading }
    })),
  addNotification: (notification) =>
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: [...state.ui.notifications, {
          id: Date.now(),
          ...notification
        }]
      }
    })),
  removeNotification: (id) =>
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: state.ui.notifications.filter(n => n.id !== id)
      }
    })),
  openModal: (type, data) =>
    set((state) => ({
      ui: {
        ...state.ui,
        modal: { isOpen: true, type, data }
      }
    })),
  closeModal: () =>
    set((state) => ({
      ui: {
        ...state.ui,
        modal: { isOpen: false, type: null, data: null }
      }
    }))
})