'use client'
import { Timer } from '~/app/_components/timer'
import dynamic from 'next/dynamic'
import { Loader2, Pause, Play, Settings, SkipForward } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import Link from 'next/link'

const MUSIC = [
    'a-cozy-day.mp3',
    'cafe-theme.mp3',
    'chill-lofi.mp3',
    'mental-drive-lofi.mp3',
    'night-coffee-shop.mp3',
    'sunrise-meditation.mp3',
] as const

type Music = (typeof MUSIC)[number]

const ThemeSelector = dynamic(() => import('~/components/theme-selector'), {
    ssr: false,
    loading: () => <Loader2 className="animate-spin" />,
})

export interface TopNavBarProps {
    nextMusic: () => void
    playMusic: () => void
    pauseMusic: () => void
}

function TopNavBar({ nextMusic, playMusic, pauseMusic }: TopNavBarProps) {
    return (
        <nav className="flex gap-4 border-b p-4">
            <div className="flex justify-start gap-4">
                <ThemeSelector />
            </div>
            <div className="flex grow justify-center gap-4">
                <Button size="icon" onClick={playMusic}>
                    <Play />
                </Button>
                <Button size="icon" onClick={pauseMusic}>
                    <Pause />
                </Button>
                <Button size="icon" onClick={nextMusic}>
                    <SkipForward />
                </Button>
            </div>
            <div className="flex justify-end gap-4">
                <Button size="icon" asChild>
                    <Link href="/settings">
                        <Settings />
                    </Link>
                </Button>
            </div>
        </nav>
    )
}

export default function Home() {
    const [music, setMusic] = useState<Music>('a-cozy-day.mp3')

    const audio = useRef<HTMLAudioElement>(undefined)

    useEffect(() => {
        audio.current ??= new Audio()
        audio.current.preload = 'auto'
    }, [])

    const playMusic = useCallback(() => {
        if (audio.current) {
            audio.current.src = `/music/${music}`
            void audio.current.play()
        }
    }, [music])

    const pauseMusic = useCallback(() => {
        void audio.current?.pause()
    }, [])

    const nextMusic = useCallback(() => {
        const nextMusic = MUSIC[(MUSIC.indexOf(music) + 1) % MUSIC.length]!
        if (audio.current) {
            setMusic(nextMusic)
            playMusic()
        }
    }, [music, playMusic])

    useEffect(() => {
        const currAudio = audio.current
        currAudio?.addEventListener('ended', nextMusic)

        return () => {
            currAudio?.removeEventListener('ended', nextMusic)
            audio.current?.pause()
            audio.current = undefined
        }
    }, [music, nextMusic])

    return (
        <div className="flex h-svh w-screen flex-col">
            <TopNavBar nextMusic={nextMusic} playMusic={playMusic} pauseMusic={pauseMusic} />
            <main className="flex grow items-center justify-center gap-4">
                <Timer />
            </main>
        </div>
    )
}
