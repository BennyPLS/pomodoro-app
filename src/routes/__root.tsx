import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import Devtools from '@/dev-tools'
import { env } from '@/env'
import { MusicPlayerProvider } from '@/providers/music-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { TimerProvider } from '@/providers/timer-provider'
import { useLocale } from '@/lib/i18n'
import FirstTimeVisitScript from '@/scripts/first-time-visit'

export const Route = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Scripts />
      <Toaster richColors={true} />
      <MusicPlayerProvider>
        <TimerProvider>
          <ThemeProvider>
            <LocalizedOutlet />
          </ThemeProvider>
        </TimerProvider>
      </MusicPlayerProvider>
      {env.VITE_ENV === 'development' && <Devtools />}
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
