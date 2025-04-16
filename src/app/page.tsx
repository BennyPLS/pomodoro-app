'use client'
import { Timer } from '~/app/_components/timer'
import dynamic from 'next/dynamic'
import { Loader2, Pause, Play, Settings, SkipForward } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import Link from 'next/link'
import { useLiveQuery } from 'dexie-react-hooks'
import db, { type Music } from '~/lib/db'

const ThemeSelector = dynamic(() => import('~/components/theme-selector'), {
    ssr: false,
    loading: () => <Loader2 className="animate-spin" />,
})

export interface TopNavBarProps {
    actualMusic: Music | undefined
    nextMusic: () => void
    playMusic: () => void
    pauseMusic: () => void
}

function TopNavBar({ nextMusic, playMusic, pauseMusic, actualMusic }: TopNavBarProps) {
    return (
        <nav className="flex gap-4 border-b p-4">
            <div className="flex justify-start gap-4">
                <ThemeSelector />
            </div>
            <div className="flex grow flex-col justify-center gap-4">
                <div className="flex justify-center gap-4">
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
                <div className="text-center">{actualMusic?.title ?? 'No Selected'}</div>
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
    const allMusic = useLiveQuery(() => db.music.toArray())

    const [music, setMusic] = useState<Music | undefined>(allMusic?.[0])
    const [currentMusicIndex, setCurrentMusicIndex] = useState(allMusic?.length ? 0 : -1)
    const audio = useRef<HTMLAudioElement>(undefined)

    useEffect(() => {
        if (allMusic?.length) {
            setCurrentMusicIndex(0)
            setMusic(allMusic[0])
        }
    }, [allMusic])

    useEffect(() => {
        audio.current = new Audio()

        return () => {
            audio.current?.pause()
            audio.current = undefined
        }
    }, [])

    const nextMusic = useCallback(() => {
        if (!allMusic?.length) return
        if (audio.current) {
            audio.current.pause()
            audio.current.currentTime = 0
        }
        const nextIndex = (currentMusicIndex + 1) % allMusic.length
        setCurrentMusicIndex(nextIndex)
        setMusic(allMusic[nextIndex])
        if (audio.current && allMusic[nextIndex]) {
            audio.current.src = URL.createObjectURL(allMusic[nextIndex].blob)
            audio.current.play().catch(console.error)
        }
    }, [allMusic, currentMusicIndex])

    const playMusic = useCallback(() => {
        if (!audio.current || !music) return
        if (!audio.current.src) {
            audio.current.src = URL.createObjectURL(music.blob)
        }
        audio.current.play().catch(console.error)
    }, [music])

    const pauseMusic = useCallback(() => {
        if (!audio.current) return
        audio.current.pause()
    }, [])

    return (
        <div className="flex h-svh w-screen flex-col">
            <TopNavBar nextMusic={nextMusic} playMusic={playMusic} pauseMusic={pauseMusic} actualMusic={music} />
            <main className="flex grow items-center justify-center gap-4">
                <Timer />
            </main>
        </div>
    )
}
