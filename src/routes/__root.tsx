import { Suspense, lazy } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { AppUpdate } from '@/components/app-update'
import { AppUpdateProvider } from '@/providers/app-update-provider'
import { Toaster } from '@/components/ui/sonner'
import { MusicPlayerProvider } from '@/providers/music-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { TimerProvider } from '@/providers/timer-provider'
import { useLocale } from '@/lib/i18n'
import FirstTimeVisitScript from '@/scripts/first-time-visit'

// Dev-only: `import.meta.env.DEV` is statically false in production builds, so
// the dynamic import is tree-shaken and no devtools chunk is emitted at all
// (important here: the service worker precaches `**/*`).
const Devtools = import.meta.env.DEV ? lazy(() => import('@/dev-tools')) : null

export const Route = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Scripts />
      <MusicPlayerProvider>
        <TimerProvider>
          <ThemeProvider>
            <AppUpdateProvider>
              <Toaster richColors={true} />
              <AppUpdate />
              <LocalizedOutlet />
            </AppUpdateProvider>
          </ThemeProvider>
        </TimerProvider>
      </MusicPlayerProvider>
      {Devtools && (
        <Suspense fallback={null}>
          <Devtools />
        </Suspense>
      )}
      <FirstTimeVisitScript />
    </>
  ),
})

// Refresh route-local translations and form errors without restarting the timer,
// music player, or theme providers, and without navigating to a new document.
function LocalizedOutlet() {
  const locale = useLocale()
  return <Outlet key={locale} />
}
