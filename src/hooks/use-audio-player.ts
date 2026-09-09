import { useEffect, useRef, useState } from 'react'

interface AudioPlayerControls {
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
}

export function useAudioPlayer(blob: Blob, volume = 1) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    audioRef.current ??= new Audio()

    const audio = audioRef.current
    const url = URL.createObjectURL(blob)
    audio.src = url

    // Previews only display play/pause state; progress stays on the audio element.
    const handlers = {
      loadstart: () => setIsPlaying(false),
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
      ended: () => setIsPlaying(false),
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

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = Math.min(1, Math.max(0, volume))
  }, [volume])

  const controls: AudioPlayerControls = {
    play: () => void audioRef.current?.play(),
    pause: () => audioRef.current?.pause(),
    toggle: () => {
      if (!audioRef.current) return
      if (!audioRef.current.paused) {
        audioRef.current.pause()
      } else {
        void audioRef.current.play()
      }
    },
    seek: (time: number) => {
      if (!audioRef.current) return
      audioRef.current.currentTime = time
    },
    setVolume: (nextVolume: number) => {
      if (!audioRef.current) return
      audioRef.current.volume = nextVolume
    },
    toggleMute: () => {
      if (!audioRef.current) return
      audioRef.current.muted = !audioRef.current.muted
    },
  }

  return {
    isPlaying,
    controls,
  }
}
