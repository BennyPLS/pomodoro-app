import { createContext, use, useCallback, useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import type { ReactNode } from 'react'

const CHECK_INTERVAL = 60 * 60 * 1000

type CheckStatus = 'idle' | 'checking' | 'current' | 'error'
const AppUpdateContext = createContext<{
  available: boolean
  supported: boolean
  status: CheckStatus
  updating: boolean
  check: () => Promise<void>
  update: () => Promise<void>
} | null>(null)

// update() can resolve while the new worker is still downloading its cache.
function waitForInstallation(worker: ServiceWorker) {
  return new Promise<void>((resolve, reject) => {
    const finish = () => {
      if (worker.state === 'redundant') cleanup(new Error('Update installation failed'))
      else if (worker.state === 'installed' || worker.state === 'activated') cleanup()
    }
    const cleanup = (error?: Error) => {
      clearTimeout(timeout)
      worker.removeEventListener('statechange', finish)
      if (error) reject(error)
      else resolve()
    }
    const timeout = window.setTimeout(() => cleanup(new Error('Update installation timed out')), 120_000)
    worker.addEventListener('statechange', finish)
    finish()
  })
}

export function AppUpdateProvider({ children }: { children: ReactNode }) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>()
  const [status, setStatus] = useState<CheckStatus>('idle')
  const [updating, setUpdating] = useState(false)
  const busy = useRef(false)
  const supported = import.meta.env.PROD && 'serviceWorker' in navigator
  const {
    needRefresh: [available, setAvailable],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW: (_url, value) => setRegistration(value),
    onRegisterError: () => setStatus('error'),
  })

  const check = useCallback(async () => {
    if (!registration || busy.current) return
    busy.current = true
    setStatus('checking')
    try {
      if (!navigator.onLine) throw new Error('Offline')
      await registration.update()
      if (registration.installing) await waitForInstallation(registration.installing)
      if (registration.waiting) setAvailable(true)
      setStatus('current')
    } catch {
      setStatus('error')
    } finally {
      busy.current = false
    }
  }, [registration, setAvailable])

  useEffect(() => {
    if (!registration) return
    const checkWhenVisible = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) void check()
    }
    checkWhenVisible()
    const interval = window.setInterval(checkWhenVisible, CHECK_INTERVAL)
    window.addEventListener('online', checkWhenVisible)
    document.addEventListener('visibilitychange', checkWhenVisible)
    return () => {
      clearInterval(interval)
      window.removeEventListener('online', checkWhenVisible)
      document.removeEventListener('visibilitychange', checkWhenVisible)
    }
  }, [registration, check])

  useEffect(() => {
    if (!updating) return
    const reload = () => window.location.reload()
    navigator.serviceWorker.addEventListener('controllerchange', reload)
    const timeout = window.setTimeout(() => {
      setUpdating(false)
      setStatus('error')
    }, 30_000)
    return () => {
      clearTimeout(timeout)
      navigator.serviceWorker.removeEventListener('controllerchange', reload)
    }
  }, [updating])

  const update = async () => {
    setUpdating(true)
    try {
      await updateServiceWorker(true)
    } catch {
      setStatus('error')
      setUpdating(false)
    }
  }

  return (
    <AppUpdateContext value={{ available, supported: supported && !!registration, status, updating, check, update }}>
      {children}
    </AppUpdateContext>
  )
}

export function useAppUpdate() {
  const value = use(AppUpdateContext)
  if (!value) throw new Error('useAppUpdate must be used within AppUpdateProvider')
  return value
}
