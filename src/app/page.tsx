'use client'
import { Timer } from '~/app/_components/timer'
import dynamic from 'next/dynamic'
import { Loader2, Pause, Play, Settings, SkipForward, Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '~/components/ui/button'
import Link from 'next/link'
import { useLiveQuery } from 'dexie-react-hooks'
import db, { type Music } from '~/lib/db'
import { Slider } from '~/components/ui/slider'
import { useMusicPlayerStore } from '~/store/music-player-store'

const ThemeSelector = dynamic(() => import('~/components/theme-selector'), {
    ssr: false,
    loading: () => <Loader2 className="animate-spin" />,
})

export interface TopNavBarProps {
    actualMusic: Music | undefined
    nextMusic: () => void
    playMusic: () => void
    pauseMusic: () => void
    progress: number
    duration: number
    seek: (value: number) => void
}

function TopNavBar({ nextMusic, playMusic, pauseMusic, actualMusic, progress, duration, seek }: TopNavBarProps) {
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
                {/* Progress slider */}
                <div className="w-full px-4 flex sm:justify-center">
                    <Slider
                        value={[progress]}
                        max={duration}
                        step={0.1}
                        onValueChange={(value) => seek(value[0]!)}
                        className="sm:w-56"
                    />
                </div>
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

    // Get state and actions from the music player store
    const {
        music,
        volume,
        progress,
        duration,
        nextMusic: nextMusicAction,
        playMusic,
        pauseMusic,
        handleVolumeChange,
        handleSeek,
        initializeWithMusic
    } = useMusicPlayerStore()

    // Initialize the music player with the music from the database
    useEffect(() => {
        initializeWithMusic(allMusic)
    }, [allMusic, initializeWithMusic])

    // Create a wrapper for nextMusic that passes the allMusic array
    const nextMusic = () => {
        if (allMusic?.length) {
            nextMusicAction(allMusic)
        }
    }

    return (
        <div className="flex h-svh w-screen flex-col">
            <TopNavBar
                nextMusic={nextMusic}
                playMusic={playMusic}
                pauseMusic={pauseMusic}
                actualMusic={music}
                progress={progress}
                duration={duration}
                seek={handleSeek}
            />
            <main className="flex grow items-center justify-center gap-4">
                <Timer />
            </main>
            <div className="flex items-center gap-2 border-t p-4 sm:justify-center">
                <Button size="icon">
                    {volume > 0.66 ? (
                        <Volume2 />
                    ) : volume > 0.33 ? (
                        <Volume1 />
                    ) : volume !== 0 ? (
                        <Volume />
                    ) : (
                        <VolumeX />
                    )}
                </Button>
                <Slider
                    value={[volume]}
                    max={1}
                    step={0.01}
                    onValueChange={(value) => handleVolumeChange(value[0]!)}
                    className="sm:w-56"
                />
            </div>
        </div>
    )
}
