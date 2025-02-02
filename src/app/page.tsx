'use client'
import { Timer } from '~/app/_components/timer'
import dynamic from 'next/dynamic'
import { Loader2, Pause, Play, SkipForward } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'


const BACKGROUNDS = ['autumn.jpg', 'waterfall.jpg', 'mountains.jpg', 'bow-river.jpg'] as const
type Background = (typeof BACKGROUNDS)[number]

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

export default function Home() {
    const [background, setBackground] = useState<Background>('autumn.jpg')
    const [music, setMusic] = useState<Music>('a-cozy-day.mp3')

    const audio = useRef<HTMLAudioElement>(new Audio(`/music/${music}`))

    const nextBackground = useCallback(() => {
        const nextBackground = BACKGROUNDS[(BACKGROUNDS.indexOf(background) + 1) % BACKGROUNDS.length]!
        setBackground(nextBackground)
    }, [background])

    const nextMusic = useCallback(() => {
        const nextMusic = MUSIC[(MUSIC.indexOf(music) + 1) % MUSIC.length]!
        audio.current.src = `/music/${nextMusic}`
        playMusic()
        setMusic(nextMusic)
    }, [music])

    const playMusic = () => {
        void audio.current.play()
    }

    const pauseMusic = () => {
        void audio.current.pause()
    }

    useEffect(() => {
        const currAudio = audio.current
        currAudio.addEventListener('ended', nextMusic)

        return () => {
            currAudio.removeEventListener('ended', nextMusic)
        }
    }, [music, nextMusic])

    useEffect(() => {
        const timeout = setTimeout(() => {
            nextBackground()
        }, 1200000)

        return () => clearTimeout(timeout)
    }, [nextBackground])

    return (
        <div
            className="background-transition h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(/backgrounds/${background})` }}
        >
            <nav className="bg-background flex h-14 w-screen items-center justify-between gap-4 p-4">
                <div>
                    <Button onClick={nextBackground}>Siguiente Fondo</Button>
                </div>
                <div className="flex gap-4">
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
                <div>
                    <ThemeSelector />
                </div>
            </nav>
            <main className="flex h-screen w-screen items-center justify-center gap-4">
                <Timer />
            </main>
        </div>
    )
}
