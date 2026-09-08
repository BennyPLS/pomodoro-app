import { Link } from '@tanstack/react-router'
import { BarChart, Pause, Play, Settings, SkipForward } from 'lucide-react'
import type { ReactNode } from 'react'
import { m } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useMusicPlayer } from '@/providers/music-provider'

export function TopBar() {
  const [next, play, pause, music, progress, duration, isPlaying, seek] = useMusicPlayer((store) => [
    store.next,
    store.play,
    store.pause,
    store.music,
    store.progress,
    store.duration,
    store.isPlaying,
    store.seek,
  ])

  return (
    <TopBarView
      title={music?.title ?? m.no_music_selected()}
      progress={progress}
      duration={duration}
      isPlaying={isPlaying}
      play={play}
      pause={pause}
      next={next}
      seek={seek}
      statsAction={
        <Button size="icon" asChild aria-label={m.stats()}>
          <Link to="/stats" viewTransition={{ types: ['slide-right'] }}>
            <BarChart />
          </Link>
        </Button>
      }
      settingsAction={
        <Button size="icon" asChild aria-label={m.settings()}>
          <Link to="/settings" viewTransition={{ types: ['slide-left'] }}>
            <Settings />
          </Link>
        </Button>
      }
    />
  )
}

export function TopBarView({
  title,
  progress,
  duration,
  isPlaying,
  play,
  pause,
  next,
  seek,
  statsAction,
  settingsAction,
}: {
  title: string
  progress: number
  duration: number
  isPlaying: boolean
  play: () => void
  pause: () => void
  next: () => void
  seek: (value: number) => void
  statsAction: ReactNode
  settingsAction: ReactNode
}) {
  return (
    <>
      <nav
        aria-label="Controles de música y navegación"
        className="bg-card/80 grid grid-cols-[1fr_1fr_1fr] gap-4 border-b p-4"
      >
        <div className="flex justify-start gap-4">{statsAction}</div>
        <div className="flex justify-center gap-4">
          <Button size="icon" onClick={play} disabled={isPlaying} aria-label={m.play_music()}>
            <Play />
          </Button>
          <Button size="icon" onClick={pause} disabled={!isPlaying} aria-label={m.pause_music()}>
            <Pause />
          </Button>
          <Button size="icon" onClick={next} aria-label={m.next_track()}>
            <SkipForward />
          </Button>
        </div>
        <div className="flex justify-end gap-4">{settingsAction}</div>
      </nav>
      <div className="flex flex-col justify-center gap-4 p-4">
        <div className="text-center">{title}</div>
        {/* Progress slider */}
        <div className="flex w-full px-4 @2xl:justify-center">
          <Slider
            aria-label={m.music_progress()}
            value={[progress]}
            max={duration}
            step={0.1}
            onValueChange={(value) => seek(value[0])}
            className="@2xl:w-80"
          />
        </div>
      </div>
    </>
  )
}
