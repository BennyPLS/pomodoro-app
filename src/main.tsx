import { z } from 'zod'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'
import { routeTree } from '@/routeTree.gen'
import './styles.css'
import { env } from '@/env'
import { getLocale } from '@/lib/i18n'
import { applyAppearance, readAppearance } from '@/lib/themes'

applyAppearance(readAppearance())

document.documentElement.lang = getLocale()
z.config(z.locales[getLocale()]())

// Dev-only: dynamic import so react-scan never enters the production graph.
if (import.meta.env.DEV) {
  void import('react-scan').then(({ scan }) => scan({ enabled: true }))
}

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  basepath: env.VITE_ENV !== 'production' ? '' : '/pomodoro-app/',
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<RouterProvider router={router} />)
}
