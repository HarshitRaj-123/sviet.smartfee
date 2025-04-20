import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { queryClient } from './config/queryClient'
import './App.css'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <p className="text-7xl font-bold underline">
          Hello world!
        </p>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App