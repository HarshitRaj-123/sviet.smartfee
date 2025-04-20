import { useIdleTimer } from 'react-idle-timer'
import { SessionManager } from './SessionManager'
import { useAuth } from '../../auth/useAuth'
import { SESSION_TIMEOUT } from '../../config/constants'

export const useIdleTimerHook = () => {
  const { logout } = useAuth()

  const handleOnIdle = () => {
    console.log('User is idle')
    SessionManager.clearSession()
    logout()
  }

  const idleTimer = useIdleTimer({
    timeout: SESSION_TIMEOUT,
    onIdle: handleOnIdle,
    debounce: 500
  })

  return idleTimer
}