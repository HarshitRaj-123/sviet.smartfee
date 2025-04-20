import { Link } from 'react-router-dom'
import { useState } from 'react'
import { queryClient } from '../../config/queryClient'

// Map routes to the queries they depend on
const routeQueryMap = {
  '/payments': ['payments'],
  '/fee-structures': ['feeStructures'],
  '/students': ['students'],
  '/admins': ['admins']
}

export const NavLink = ({ to, children, prefetch = true, ...props }) => {
  const [prefetched, setPrefetched] = useState(false)
  
  const handlePrefetch = () => {
    if (!prefetch || prefetched) return
    
    // Prefetch route data
    const queries = routeQueryMap[to]
    if (queries) {
      queries.forEach(queryKey => {
        queryClient.prefetchQuery({
          queryKey: [queryKey],
          staleTime: 30000 // 30 seconds
        })
      })
    }
    
    // Prefetch the component code
    const route = to === '/' ? 'Dashboard' : 
                 to.charAt(1).toUpperCase() + to.slice(2).replace(/-./g, x => x[1].toUpperCase())
    
    import(`../../pages/${route}.jsx`).catch(() => {
      console.log(`No component found for ${route}`)
    })
    
    setPrefetched(true)
  }
  
  return (
    <Link 
      to={to} 
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      {...props}
    >
      {children}
    </Link>
  )
}