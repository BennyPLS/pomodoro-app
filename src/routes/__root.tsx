import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner.tsx'
import Devtools from '@/dev-tools.tsx'
import { env } from '@/env.ts'
import { MusicPlayerProvider } from '@/providers/music-provider.tsx'
import { ThemeProvider } from '@/providers/theme-provider.tsx'
import { TimerProvider } from '@/providers/timer-provider.tsx'

export const Route = createRootRoute({
  component: () => (
    <>
      <Toaster richColors={true} />
      <MusicPlayerProvider>
        <TimerProvider>
          <ThemeProvider>
            <Outlet />
          </ThemeProvider>
        </TimerProvider>
      </MusicPlayerProvider>
      {env.VITE_ENV === 'development' && <Devtools />}
    </>
  ),
})
