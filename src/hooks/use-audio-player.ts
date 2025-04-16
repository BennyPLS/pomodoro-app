import 'client-only'
import { useEffect, useRef, useState } from 'react'

interface AudioPlayerState {
    isPlaying: boolean
    currentTime: number
    duration: number
    volume: number
    isMuted: boolean
}

interface AudioPlayerControls {
    play: () => void
    pause: () => void
    toggle: () => void
    seek: (time: number) => void
    setVolume: (volume: number) => void
    toggleMute: () => void
}

export function useAudioPlayer(blob: Blob) {
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const [playerState, setPlayerState] = useState<AudioPlayerState>({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        isMuted: false,
    })

    useEffect(() => {
        audioRef.current ??= new Audio();

        const audio = audioRef.current
        const url = URL.createObjectURL(blob)
        audio.src = url

        const handlers = {
            timeupdate: () => setPlayerState((prev) => ({ ...prev, currentTime: audio.currentTime })),
            loadedmetadata: () => setPlayerState((prev) => ({ ...prev, duration: audio.duration })),
            play: () => setPlayerState((prev) => ({ ...prev, isPlaying: true })),
            pause: () => setPlayerState((prev) => ({ ...prev, isPlaying: false })),
            ended: () => setPlayerState((prev) => ({ ...prev, isPlaying: false })),
            volumechange: () =>
                setPlayerState((prev) => ({
                    ...prev,
                    volume: audio.volume,
                    isMuted: audio.muted,
                })),
        }

        // Add all event listeners
        Object.entries(handlers).forEach(([event, handler]) => {
            audio.addEventListener(event, handler)
        })

        return () => {
            // Remove all event listeners
            Object.entries(handlers).forEach(([event, handler]) => {
                audio.removeEventListener(event, handler)
            })
            URL.revokeObjectURL(url)
            void audio.pause()
            void audio.remove()
        }
    }, [blob])

    const controls: AudioPlayerControls = {
        play: () => void audioRef.current?.play(),
        pause: () => audioRef.current?.pause(),
        toggle: () => {
            if (!audioRef.current) return
            if (playerState.isPlaying) {
                audioRef.current.pause()
            } else {
                void audioRef.current.play()
            }
        },
        seek: (time: number) => {
            if (!audioRef.current) return
            audioRef.current.currentTime = time
        },
        setVolume: (volume: number) => {
            if (!audioRef.current) return
            audioRef.current.volume = volume
        },
        toggleMute: () => {
            if (!audioRef.current) return
            audioRef.current.muted = !audioRef.current.muted
        },
    }

    return {
        ...playerState,
        controls,
    }
}
