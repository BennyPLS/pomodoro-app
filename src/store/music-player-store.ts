import { create } from 'zustand'
import 'client-only'
import db, { Music } from '~/lib/db'

interface MusicPlayerState {
    music: Music | undefined
    currentMusicIndex: number
    volume: number
    progress: number
    duration: number
    isPlaying: boolean
    audioElement: HTMLAudioElement | null
}

interface MusicPlayerActions {
    setMusic: (music: Music | undefined) => void
    setCurrentMusicIndex: (index: number) => void
    setVolume: (volume: number) => void
    setProgress: (progress: number) => void
    setDuration: (duration: number) => void
    setIsPlaying: (isPlaying: boolean) => void
    setAudioElement: (audioElement: HTMLAudioElement | null) => void
    nextMusic: (allMusic: Music[]) => void
    playMusic: () => void
    pauseMusic: () => void
    handleVolumeChange: (volume: number) => void
    handleSeek: (time: number) => void
    initializeWithMusic: (allMusic: Music[] | undefined) => void
}

export const useMusicPlayerStore = create<MusicPlayerState & MusicPlayerActions>((set, get) => ({
    // Initial state
    music: undefined,
    currentMusicIndex: -1,
    volume: 1,
    progress: 0,
    duration: 0,
    isPlaying: false,
    audioElement: null,

    // Actions
    setMusic: (music) => set({ music }),
    setCurrentMusicIndex: (currentMusicIndex) => set({ currentMusicIndex }),
    setVolume: (volume) => set({ volume }),
    setProgress: (progress) => set({ progress }),
    setDuration: (duration) => set({ duration }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    
    setAudioElement: (audioElement) => {
        const { audioElement: prevAudioElement } = get()
        
        // Clean up previous audio element
        if (prevAudioElement) {
            prevAudioElement.pause()
            prevAudioElement.src = ''
            prevAudioElement.load()
        }
        
        set({ audioElement })
        
        if (audioElement) {
            // Set up event listeners for the new audio element
            const handleTimeUpdate = () => {
                set({ progress: audioElement.currentTime })
            }

            const handleDurationChange = () => {
                set({ duration: audioElement.duration })
            }

            const handleVolumeChange = () => {
                set({ volume: audioElement.volume })
            }

            const handleEnded = () => {
                const { nextMusic } = get()
                const allMusic = db.music.toArray()
                void allMusic.then((music) => {
                    if (music?.length) nextMusic(music)
                })
            }

            // Add event listeners
            audioElement.addEventListener('timeupdate', handleTimeUpdate)
            audioElement.addEventListener('durationchange', handleDurationChange)
            audioElement.addEventListener('volumechange', handleVolumeChange)
            audioElement.addEventListener('ended', handleEnded)

            // Store event listeners for cleanup
            // @ts-ignore - Adding custom property for cleanup
            audioElement._eventListeners = {
                timeupdate: handleTimeUpdate,
                durationchange: handleDurationChange,
                volumechange: handleVolumeChange,
                ended: handleEnded,
            }
        }
    },
    
    nextMusic: (allMusic) => {
        const { audioElement, currentMusicIndex, isPlaying } = get()
        
        if (!allMusic?.length) return
        
        let wasPlaying = isPlaying
        
        if (audioElement) {
            if (!audioElement.paused) {
                audioElement.pause()
            }
            
            audioElement.currentTime = 0
        }
        
        const nextIndex = (currentMusicIndex + 1) % allMusic.length
        
        set({ 
            currentMusicIndex: nextIndex,
            music: allMusic[nextIndex]
        })
        
        if (audioElement && allMusic[nextIndex]) {
            audioElement.src = URL.createObjectURL(allMusic[nextIndex].blob)
            if (wasPlaying) void audioElement.play()
        }
    },
    
    playMusic: () => {
        const { audioElement, music } = get()
        
        if (!audioElement || !music) return
        
        if (!audioElement.src) {
            audioElement.src = URL.createObjectURL(music.blob)
        }
        
        void audioElement.play()
        set({ isPlaying: true })
    },
    
    pauseMusic: () => {
        const { audioElement } = get()
        
        if (!audioElement) return
        
        audioElement.pause()
        set({ isPlaying: false })
    },
    
    handleVolumeChange: (volume) => {
        const { audioElement } = get()
        
        if (!audioElement) return
        
        audioElement.volume = volume
    },
    
    handleSeek: (time) => {
        const { audioElement } = get()
        
        if (!audioElement) return
        
        audioElement.currentTime = time
    },
    
    initializeWithMusic: (allMusic) => {
        if (!allMusic?.length) return
        
        set({
            currentMusicIndex: 0,
            music: allMusic[0]
        })
        
        // Initialize audio element if it doesn't exist
        if (!get().audioElement) {
            const audioElement = new Audio()
            get().setAudioElement(audioElement)
        }
    }
}))