import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import Devtools from '@/dev-tools'
import { env } from '@/env'
import { MusicPlayerProvider } from '@/providers/music-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { TimerProvider } from '@/providers/timer-provider'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        title: 'Pomodoro',
      },
      { charSet: 'UTF-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { property: 'og:title', content: 'Pomodoro' },
      { property: 'og:description', content: 'A simple Pomodoro timer to boost your focus and productivity.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://github.com/BennyPLS/pomodoro-app/' },
      { property: 'og:image', content: 'screenshot-mobile.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Pomodoro' },
      { name: 'twitter:description', content: 'A simple Pomodoro timer to boost your focus and productivity.' },
      { name: 'twitter:image', content: 'screenshot-mobile.png' },
      { name: 'twitter:url', content: 'https://github.com/BennyPLS/pomodoro-app/' },
    ],
    links: [
      { rel: 'icon', href: 'favicon.ico', sizes: '48x48' },
      { rel: 'apple-touch-icon', href: 'apple-touch-icon-180x180.png' },
      { rel: 'icon', href: 'favicon.ico' },
    ],
  }),
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
    </>
  ),
})
