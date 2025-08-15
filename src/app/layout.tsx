import '~/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'

import { type ReactNode } from 'react'
import ThemeProvider from '~/providers/theme-provider'
import { Toaster } from '~/components/ui/sonner'
import Script from 'next/script'
import FirstTimeVisitScript from '~/scripts/first-time-visit'

export const metadata: Metadata = {
    title: 'Pomodoro Timer',
    description: 'Simple pomodoro timer',
    icons: [
        { rel: 'icon', type: 'shortcut icon', url: '/favicon.ico' },
        { rel: 'icon', url: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', url: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', url: '/favicon-96x96.png', sizes: '96x96' },
        { rel: 'apple-touch-icon', sizes: '180x180', url: '/apple-icon.png' },
    ],
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html suppressHydrationWarning lang="es" className={`${GeistSans.variable}`}>
            <head>
                <meta name="apple-mobile-web-app-title" content="Pomodoro" />
                <Script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" />
                <FirstTimeVisitScript />
                <title>Pomodoro Timer</title>
            </head>
            <body>
                <Toaster richColors={true} />
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    )
}
