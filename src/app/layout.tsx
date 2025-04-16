import '~/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'

import { TRPCReactProvider } from '~/trpc/react'
import { type ReactNode } from 'react'
import ThemeProvider from '~/providers/theme-provider'
import { Toaster } from '~/components/ui/sonner'
import Script from 'next/script'
import FirstTimeVisitScript from '~/scripts/first-time-visit'

export const metadata: Metadata = {
    title: 'Pomodoro Timer',
    description: 'Simple pomodoro timer',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html suppressHydrationWarning lang="es" className={`${GeistSans.variable}`}>
            <head>
                <Script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" />
                <FirstTimeVisitScript />
            </head>
            <body>
                <Toaster richColors={true} />
                <TRPCReactProvider>
                    <ThemeProvider>{children}</ThemeProvider>
                </TRPCReactProvider>
            </body>
        </html>
    )
}
