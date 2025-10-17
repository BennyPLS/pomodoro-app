import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import Devtools from '@/dev-tools'
import { env } from '@/env'
import { MusicPlayerProvider } from '@/providers/music-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { TimerProvider } from '@/providers/timer-provider'
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
            <Outlet />
          </ThemeProvider>
        </TimerProvider>
      </MusicPlayerProvider>
      {env.VITE_ENV === 'development' && <Devtools />}
      <FirstTimeVisitScript />
    </>
  ),
})
