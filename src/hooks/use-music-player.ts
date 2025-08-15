'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import db, { type Music } from '~/lib/db'

export default function useMusicPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    // Keep the latest nextMusic function for stable event handlers
    const nextMusicRef = useRef<(() => void) | null>(null)

    const [music, setMusic] = useState<Music | undefined>(undefined)
    const [volume, setVolume] = useState<number>(1)
    const [progress, setProgress] = useState<number>(0)
    const [duration, setDuration] = useState<number>(0)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)

    // Fetch all music ordered by 'order' (reactive to DB changes)
    const allMusic = useLiveQuery(() => db.music.orderBy('order').toArray())

    // Keep a ref to the current list to avoid stale closures in event handlers
    const listRef = useRef<Music[] | undefined>(undefined)
    useEffect(() => {
        listRef.current = allMusic
    }, [allMusic])

    // Track the currently selected title to preserve selection across reorders/removals
    const selectedTitleRef = useRef<string | undefined>(undefined)
    useEffect(() => {
        selectedTitleRef.current = music?.title
    }, [music])

    // Initialize the audio element and attach listeners
    useEffect(() => {
        const audio = new Audio()
        audio.preload = 'metadata'
        audio.volume = volume
        audioRef.current = audio

        const handleTimeUpdate = () => {
            setProgress(audio.currentTime)
        }
        const handleDurationChange = () => setDuration(audio.duration || 0)
        const handleVolumeChange = () => setVolume(audio.volume)
        const handleEnded = () => {
            const invokeNext = nextMusicRef.current
            if (invokeNext) {
                invokeNext()
            } else {
                setIsPlaying(false)
            }
        }

        audio.addEventListener('timeupdate', handleTimeUpdate)
        audio.addEventListener('durationchange', handleDurationChange)
        audio.addEventListener('volumechange', handleVolumeChange)
        audio.addEventListener('ended', handleEnded)

        return () => {
            audio.pause()
            audio.src = ''
            audio.load()
            audio.removeEventListener('timeupdate', handleTimeUpdate)
            audio.removeEventListener('durationchange', handleDurationChange)
            audio.removeEventListener('volumechange', handleVolumeChange)
            audio.removeEventListener('ended', handleEnded)
        }
        // It's ok that allMusic isn't a dependency here; we read the latest via refs
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // When the list arrives/changes, ensure there is a selected track (preserve by title if possible)
    useEffect(() => {
        if (!allMusic?.length) {
            setMusic(undefined)
            return
        }

        const desiredTitle = selectedTitleRef.current
        if (desiredTitle) {
            const idx = allMusic.findIndex((m) => m.title === desiredTitle)
            if (idx >= 0) {
                setMusic(allMusic[idx])
                return
            }
        }

        // Fallback to first item
        setMusic(allMusic[0])
    }, [allMusic])

    // Keep Audio.src in sync when the current track changes
    useEffect(() => {
        const audio = audioRef.current
        if (!audio || !music) return
        const blobUrl = URL.createObjectURL(music.blob)
        audio.src = blobUrl
        audio.currentTime = 0
        // play if previously playing
        if (isPlaying) {
            void audio.play().catch(() => {
                setIsPlaying(false)
            })
        }
        return () => {
            // Revoke URL when switching tracks
            URL.revokeObjectURL(blobUrl)
        }
    }, [music])

    const playMusic = useCallback(() => {
        const audio = audioRef.current
        if (!audio || !music) return
        void audio
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false))
    }, [music])

    const pauseMusic = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return
        audio.pause()
        setIsPlaying(false)
    }, [])

    const handleVolumeChange = useCallback((v: number) => {
        const audio = audioRef.current
        if (!audio) return
        audio.volume = v
        // setVolume is updated from event listener too, but keep local state in sync eagerly
        setVolume(v)
    }, [])

    const handleSeek = useCallback((time: number) => {
        const audio = audioRef.current
        if (!audio) return
        audio.currentTime = time
        setProgress(time)
    }, [])

    const nextMusic = useCallback(() => {
        const list = listRef.current
        if (!list?.length) return

        const audio = audioRef.current
        const wasPlaying = isPlaying
        if (audio && !audio.paused) audio.pause()

        const currentTitle = selectedTitleRef.current
        const currentIndex = currentTitle ? list.findIndex((m) => m.title === currentTitle) : -1
        const safeIndex = currentIndex >= 0 ? currentIndex : -1
        const nextIndex = ((safeIndex) + 1) % list.length

        setMusic(list[nextIndex])

        // playback resumes in the effect that syncs src if wasPlaying stays true
        if (!wasPlaying) setIsPlaying(false)
    }, [isPlaying])

    // Keep nextMusicRef always pointing to the latest implementation
    useEffect(() => {
        nextMusicRef.current = nextMusic
    }, [nextMusic])

    return {
        // state
        music,
        volume,
        progress,
        duration,
        isPlaying,
        // actions
        nextMusic,
        playMusic,
        pauseMusic,
        handleVolumeChange,
        handleSeek,
    }
}
