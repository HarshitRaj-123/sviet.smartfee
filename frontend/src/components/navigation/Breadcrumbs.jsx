import { useLocation, Link } from 'react-router-dom'
import { useMemo } from 'react'

const routeConfig = {
  '/': { label: 'Dashboard', icon: 'home' },
  '/payments': { label: 'Payments', icon: 'credit-card' },
  '/fee-structures': { label: 'Fee Structures', icon: 'file-text' },
  '/admins': { label: 'Admin Management', icon: 'users' },
  '/students': { label: 'Students', icon: 'user-graduate' },
  '/reports': { label: 'Reports', icon: 'chart-bar' }
}

// Dynamic segment handlers
const dynamicSegments = {
  student: (id) => ({
    fetch: async () => {
      try {
        const response = await fetch(`/api/v1/students/${id}`)
        const data = await response.json()
        return data.studentName || `Student ${id}`
      } catch (error) {
        return `Student ${id}`
      }
    }
  }),
  payment: (id) => ({
    fetch: async () => {
      try {
        const response = await fetch(`/api/v1/payments/${id}`)
        const data = await response.json()
        return `Payment #${id.substring(0, 8)}`
      } catch (error) {
        return `Payment ${id}`
      }
    }
  })
}

export const Breadcrumbs = () => {
  const location = useLocation()
  
  const breadcrumbs = useMemo(() => {
    const pathnames = location.pathname.split('/').filter(Boolean)
    
    // Always start with home
    const crumbs = [{ 
      path: '/', 
      label: routeConfig['/'].label,
      icon: routeConfig['/'].icon 
    }]
    
    // Build up the breadcrumb paths
    pathnames.reduce((acc, path, idx) => {
      const url = `${acc}/${path}`
      
      // Check if it's a dynamic segment (has an ID pattern)
      const isDynamicSegment = /^[0-9a-f]{24}$/.test(path) || /^\d+$/.test(path)
      
      if (isDynamicSegment && pathnames[idx-1]) {
        // If previous segment has a dynamic handler
        const handler = dynamicSegments[pathnames[idx-1]]
        if (handler) {
          crumbs.push({
            path: url,
            label: `Loading...`,
            isDynamic: true,
            handler: handler(path)
          })
        } else {
          crumbs.push({
            path: url,
            label: path
          })
        }
      } else {
        // Static path
        const route = routeConfig[url]
        crumbs.push({
          path: url,
          label: route ? route.label : path.charAt(0).toUpperCase() + path.slice(1),
          icon: route ? route.icon : null
        })
      }
      
      return url
    }, '')
    
    return crumbs
  }, [location.pathname])
  
  // Load dynamic segments data
  const [loadedBreadcrumbs, setLoadedBreadcrumbs] = useState(breadcrumbs)
  
  useEffect(() => {
    const loadDynamicSegments = async () => {
      const updatedCrumbs = [...breadcrumbs]
      
      for (let i = 0; i < breadcrumbs.length; i++) {
        if (breadcrumbs[i].isDynamic && breadcrumbs[i].handler) {
          try {
            const label = await breadcrumbs[i].handler.fetch()
            updatedCrumbs[i] = { ...updatedCrumbs[i], label }
          } catch (error) {
            console.error('Failed to load dynamic breadcrumb:', error)
          }
        }
      }
      
      setLoadedBreadcrumbs(updatedCrumbs)
    }
    
    loadDynamicSegments()
  }, [breadcrumbs])
  
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumbs">
        {loadedBreadcrumbs.map((crumb, idx) => (
          <li key={idx} className="breadcrumb-item">
            {idx < loadedBreadcrumbs.length - 1 ? (
              <Link to={crumb.path}>
                {crumb.icon && <i className={`icon ${crumb.icon}`} />}
                {crumb.label}
              </Link>
            ) : (
              <span className="breadcrumb-active">
                {crumb.icon && <i className={`icon ${crumb.icon}`} />}
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}