import '~/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'

import { TRPCReactProvider } from '~/trpc/react'
import { type ReactNode } from 'react'
import ThemeProvider from '~/providers/theme-provider'

export const metadata: Metadata = {
    title: 'Pomodoro Timer',
    description: 'Simple pomodoro timer',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html suppressHydrationWarning lang="en" className={`${GeistSans.variable}`}>
            <body>
                <TRPCReactProvider>
                    <ThemeProvider>{children}</ThemeProvider>
                </TRPCReactProvider>
            </body>
        </html>
    )
}
