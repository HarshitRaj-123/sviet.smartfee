export const authSlice = (set) => ({
  auth: {
    user: null,
    isAuthenticated: false,
    tokens: { access: null, refresh: null },
  },
  setAuth: (user, tokens) => 
    set((state) => ({
      auth: {
        ...state.auth,
        user,
        isAuthenticated: !!user,
        tokens,
      }
    })),
  logout: () => 
    set((state) => ({
      auth: {
        ...state.auth,
        user: null,
        isAuthenticated: false,
        tokens: null,
      }
    })),
})