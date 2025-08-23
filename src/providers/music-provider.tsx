'use client'

import { createContext, type ReactNode, RefObject, useContext, useEffect, useMemo, useRef } from 'react'
import { createStore, type StoreApi } from 'zustand/vanilla'
import { useStore } from 'zustand'
import { useLiveQuery } from 'dexie-react-hooks'
import db, { type Music } from '~/lib/db'
import { subscribeWithSelector } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

interface MusicPlayerState {
    music: Music | undefined
    musics: Music[]
    volume: number
    progress: number
    duration: number
    isPlaying: boolean
}

interface MusicPlayerActions {
    play: () => void
    pause: () => void
    next: () => void
    setVolume: (v: number) => void
    seek: (time: number) => void
    setMusic: (m: Music | undefined) => void
    setMusics: (list: Music[]) => void
}

type MusicPlayerStore = MusicPlayerState & MusicPlayerActions

function createMusicPlayerStore(deps: {
    audioRef: RefObject<HTMLAudioElement | null>
    selectedTitleRef: RefObject<string | undefined>
}) {
    const { audioRef, selectedTitleRef } = deps

    return createStore(
        subscribeWithSelector<MusicPlayerStore>((set, get) => ({
            // State
            music: undefined,
            musics: [],
            volume: 1,
            progress: 0,
            duration: 0,
            isPlaying: false,

            // Actions
            setMusic: (m) => {
                set({ music: m })
            },
            setMusics: (list) => {
                set({ musics: list })
            },

            play: () => {
                const audio = audioRef.current
                const state = get()
                if (!audio) return

                // If no current track but we have a list, pick the first one
                if (!state.music && state.musics.length > 0) {
                    set({ music: state.musics[0] })
                }

                // Drive playback via isPlaying subscription
                set({ isPlaying: true })
            },

            pause: () => {
                // Drive pause via isPlaying subscription
                set({ isPlaying: false })
            },

            setVolume: (v: number) => {
                const audio = audioRef.current
                if (!audio) return
                const clamped = Math.min(1, Math.max(0, v))
                if (audio.volume !== clamped) {
                    audio.volume = clamped
                }
                set({ volume: clamped })
            },

            seek: (time: number) => {
                const audio = audioRef.current
                if (!audio) return
                audio.currentTime = time
                set({ progress: time })
            },

            next: () => {
                const list = get().musics
                if (!list?.length) return

                const audio = audioRef.current
                const wasPlaying = get().isPlaying
                if (audio && !audio.paused) audio.pause()

                const currentTitle = selectedTitleRef.current
                const currentIndex = currentTitle ? list.findIndex((m) => m.title === currentTitle) : -1
                const safeIndex = currentIndex >= 0 ? currentIndex : -1
                const nextIndex = (safeIndex + 1) % list.length

                set({ music: list[nextIndex] })
                if (!wasPlaying) set({ isPlaying: false })
            },
        }))
    )
}

// Context that confines the store instance
const MusicPlayerStoreContext = createContext<StoreApi<MusicPlayerStore> | null>(null)

const VOLUME_KEY = 'mp:volume'

export function MusicPlayerProvider({ children }: { children: ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const selectedTitleRef = useRef<string | undefined>(undefined)
    const lastUrlRef = useRef<string | null>(null)

    const store = useMemo(() => createMusicPlayerStore({ audioRef, selectedTitleRef }), [])

    const allMusic = useLiveQuery(() => db.music.orderBy('order').toArray())

    useEffect(() => {
        store.setState({ musics: allMusic ?? [] })

        if (!allMusic?.length) {
            store.setState({ music: undefined })
            return
        }

        const desiredTitle = selectedTitleRef.current
        if (desiredTitle) {
            const idx = allMusic.findIndex((m) => m.title === desiredTitle)
            if (idx >= 0) {
                store.setState({ music: allMusic[idx] })
                return
            }
        }
        store.setState({ music: allMusic[0] })
    }, [allMusic, store])

    const music = useStore(store, (s) => s.music)
    useEffect(() => {
        selectedTitleRef.current = music?.title
    }, [music])

    // Initialize the audio element and attach listeners
    useEffect(() => {
        const audio = new Audio()
        audio.preload = 'metadata'
        audioRef.current = audio

        try {
            const raw = localStorage.getItem(VOLUME_KEY)
            const parsed = raw !== null ? Number(raw) : NaN
            const clamped = Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : NaN
            if (!Number.isNaN(clamped)) {
                audio.volume = clamped
                store.setState({ volume: clamped })
            } else {
                audio.volume = store.getState().volume
            }
        } catch {
            audio.volume = store.getState().volume
        }

        const handleTimeUpdate = () => store.setState({ progress: audio.currentTime })
        const handleDurationChange = () => store.setState({ duration: audio.duration || 0 })
        const handleEnded = () => store.getState().next()

        audio.addEventListener('timeupdate', handleTimeUpdate)
        audio.addEventListener('durationchange', handleDurationChange)
        audio.addEventListener('ended', handleEnded)

        return () => {
            audio.pause()
            audio.src = ''
            audio.load()
            audio.removeEventListener('timeupdate', handleTimeUpdate)
            audio.removeEventListener('durationchange', handleDurationChange)
            audio.removeEventListener('ended', handleEnded)
        }
    }, [store])

    // Update Audio.src only when the current track changes
    useEffect(() => {
        const unsubscribeMusic = store.subscribe(
            (s) => s.music,
            (newMusic) => {
                const audio = audioRef.current
                if (!audio || !newMusic) return

                // Revoke previous URL if present
                if (lastUrlRef.current) {
                    URL.revokeObjectURL(lastUrlRef.current)
                    lastUrlRef.current = null
                }

                const blobUrl = URL.createObjectURL(newMusic.blob)
                lastUrlRef.current = blobUrl

                const wasTime = audio.currentTime || 0
                const shouldKeepTime = wasTime > 0 && store.getState().isPlaying // if switching mid-play, reset; otherwise keep 0
                audio.src = blobUrl
                audio.currentTime = shouldKeepTime ? wasTime : 0

                // Auto-play if currently in playing state
                if (store.getState().isPlaying) {
                    void audio.play().catch(() => {
                        store.setState({ isPlaying: false })
                    })
                }
            }
        )

        // Drive play/pause when isPlaying changes (without touching src)
        const unsubscribeIsPlaying = store.subscribe(
            (s) => s.isPlaying,
            (playing) => {
                const audio = audioRef.current
                const currentMusic = store.getState().music
                if (!audio || !currentMusic) return

                if (playing) {
                    // Ensure we have a src; if not, trigger the music subscriber by re-setting the same music
                    if (!audio.src) {
                        const m = store.getState().music
                        if (m) {
                            // Re-trigger music subscriber
                            store.setState({ music: m })
                        }
                    }
                    void audio.play().catch(() => {
                        store.setState({ isPlaying: false })
                    })
                } else {
                    audio.pause()
                }
            }
        )

        return () => {
            unsubscribeMusic()
            unsubscribeIsPlaying()
            if (lastUrlRef.current) {
                URL.revokeObjectURL(lastUrlRef.current)
                lastUrlRef.current = null
            }
        }
    }, [store])

    // Persist volume changes to localStorage
    useEffect(() => {
        return store.subscribe(
            (s) => s.volume,
            (v) => {
                try {
                    if (typeof window !== 'undefined') {
                        window.localStorage.setItem('mp:volume', String(v))
                    }
                } catch {
                    // ignore persistence errors
                }
            }
        )
    }, [store])

    return <MusicPlayerStoreContext.Provider value={store}>{children}</MusicPlayerStoreContext.Provider>
}

export default function useMusicPlayer<T>(selector: (s: MusicPlayerStore) => T): T {
    const store = useContext(MusicPlayerStoreContext)
    if (!store) throw new Error('useMusicPlayerSelector must be used within a MusicPlayerProvider')
    return useStore(store, useShallow(selector))
}
