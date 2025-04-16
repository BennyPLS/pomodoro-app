'use client'
import { Timer } from '~/app/_components/timer'
import dynamic from 'next/dynamic'
import { Loader2, Pause, Play, Settings, SkipForward, Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'
import Link from 'next/link'
import { useLiveQuery } from 'dexie-react-hooks'
import db, { type Music } from '~/lib/db'
import { Slider } from '~/components/ui/slider'

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
    const allMusic = useLiveQuery(() =>  db.music.toArray())

    const [music, setMusic] = useState<Music | undefined>(allMusic?.[0])
    const [currentMusicIndex, setCurrentMusicIndex] = useState(allMusic?.length ? 0 : -1)
    const [volume, setVolume] = useState(1)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const audio = useRef<HTMLAudioElement>(undefined)

    useEffect(() => {
        if (allMusic?.length) {
            setCurrentMusicIndex(0)
            setMusic(allMusic[0])
        }
    }, [allMusic])

    useEffect(() => {
        audio.current = new Audio()
        const audioElement = audio.current

        // Add event listeners
        const handleTimeUpdate = () => {
            setProgress(audioElement.currentTime)
        }

        const handleDurationChange = () => {
            setDuration(audioElement.duration)
        }

        const handleVolumeChange = () => {
            setVolume(audioElement.volume)
        }

        audioElement.addEventListener('timeupdate', handleTimeUpdate)
        audioElement.addEventListener('durationchange', handleDurationChange)
        audioElement.addEventListener('volumechange', handleVolumeChange)

        return () => {
            // Remove event listeners
            audioElement.removeEventListener('timeupdate', handleTimeUpdate)
            audioElement.removeEventListener('durationchange', handleDurationChange)
            audioElement.removeEventListener('volumechange', handleVolumeChange)

            audioElement.pause()
            audio.current = undefined
        }
    }, [])

    const nextMusic = useCallback(() => {
        let wasPlaying = false

        if (!allMusic?.length) return
        if (audio.current) {
            if (!audio.current.paused) {
                audio.current.pause()
                wasPlaying = true
            }

            audio.current.currentTime = 0
        }
        const nextIndex = (currentMusicIndex + 1) % allMusic.length
        setCurrentMusicIndex(nextIndex)
        setMusic(allMusic[nextIndex])
        if (audio.current && allMusic[nextIndex]) {
            audio.current.src = URL.createObjectURL(allMusic[nextIndex].blob)
            if (wasPlaying) void audio.current.play()
        }
    }, [allMusic, currentMusicIndex])

    const playMusic = useCallback(() => {
        if (!audio.current || !music) return
        if (!audio.current.src) {
            audio.current.src = URL.createObjectURL(music.blob)
        }
        void audio.current.play()
    }, [music])

    const pauseMusic = useCallback(() => {
        if (!audio.current) return
        audio.current.pause()
    }, [])

    const handleVolumeChange = useCallback((newVolume: number) => {
        if (!audio.current) return
        audio.current.volume = newVolume
    }, [])

    const handleSeek = useCallback((newTime: number) => {
        if (!audio.current) return
        audio.current.currentTime = newTime
    }, [])

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
