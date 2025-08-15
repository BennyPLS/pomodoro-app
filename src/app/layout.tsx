import '~/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'

import { type ReactNode } from 'react'
import ThemeProvider from '~/providers/theme-provider'
import { Toaster } from '~/components/ui/sonner'
import Script from 'next/script'
import FirstTimeVisitScript from '~/scripts/first-time-visit'
import { env } from '~/env'

export const metadata: Metadata = {
    description: 'Simple pomodoro timer',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html suppressHydrationWarning lang="es" className={`${GeistSans.variable}`}>
            <head>

                {env.NEXT_PUBLIC_ENV === 'dev' && (
                    <Script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" />
                )}
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
