'use client'
import { Timer } from '~/app/_components/timer'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const ThemeSelector = dynamic(() => import('~/components/theme-selector'), {
    ssr: false,
    loading: () => <Loader2 className="animate-spin" />,
})

export default function Home() {
    return (
        <>
            <nav className="flex h-10 w-screen items-center justify-center gap-4">
                <ThemeSelector />
            </nav>
            <main className="flex h-screen w-screen items-center justify-center gap-4">
                <Timer />
            </main>
        </>
    )
}
