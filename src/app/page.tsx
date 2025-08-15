'use client'
import { Timer } from '~/app/_components/timer'
import dynamic from 'next/dynamic'
import { Loader2, Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '~/components/ui/button'
import { useLiveQuery } from 'dexie-react-hooks'
import db, { type Music } from '~/lib/db'
import { Slider } from '~/components/ui/slider'
import { useMusicPlayerStore } from '~/store/music-player-store'
import { TopNavBar } from '~/app/_components/top-nav-bar'


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
        initializeWithMusic,
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
