import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { queryClient } from './config/queryClient'
import { AuthGuard } from './auth/AuthGuard'
import { lazy, Suspense } from 'react'
import ErrorBoundary from './components/common/ErrorBoundary'
import MainLayout from './components/layout/MainLayout'
import { AnimatedRoutes } from './components/layout/AnimatedRoutes'
import './App.css'
import './styles/transitions.css'

// Import components
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Payments = lazy(() => import('./pages/Payments'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Unauthorized = lazy(() => import('./pages/Unauthorized'))
const FeeStructures = lazy(() => import('./pages/FeeStructures'))
const Admins = lazy(() => import('./pages/Admins'))

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Separate component to use location
function AppContent() {
  const location = useLocation();
  
  return (
    <AnimatedRoutes>
      <Routes location={location}>
        {/* Public routes */}
        <Route path="/login" element={
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Login />
          </Suspense>
        } />
        <Route path="/unauthorized" element={
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Unauthorized />
          </Suspense>
        } />
        
        {/* Protected routes with MainLayout */}
        <Route path="/" element={<MainLayout />}>
          {/* Routes here */}
          <Route index element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          } />
          
          <Route path="payments" element={
            <AuthGuard>
              <Payments />
            </AuthGuard>
          } />
          
          <Route path="fee-structures" element={
            <AuthGuard>
              <FeeStructures />
            </AuthGuard>
          } />
          
          <Route path="admins" element={
            <AuthGuard>
              <Admins />
            </AuthGuard>
          } />
        </Route>
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/404" replace />} />
        <Route path="404" element={
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <NotFound />
          </Suspense>
        } />
      </Routes>
    </AnimatedRoutes>
  );
}

export default App;