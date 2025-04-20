import { Route, useLocation } from 'react-router-dom'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

export const AnimatedRoutes = ({ children }) => {
  const location = useLocation()
  
  return (
    <TransitionGroup className="transition-group">
      <CSSTransition
        key={location.key}
        timeout={{ enter: 300, exit: 300 }}
        classNames="fade"
      >
        {children}
      </CSSTransition>
    </TransitionGroup>
  )
}