import { BarChart, Pause, Play, Settings, SkipForward } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import useMusicPlayer from '@/providers/music-provider'
import ThemeSelector from '@/components/theme-selector'

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
    <nav className="flex gap-4 border-b p-4">
      <div className="flex justify-start gap-4">
        <ThemeSelector />
      </div>
      <div className="flex grow flex-col justify-center gap-4">
        <div className="flex justify-center gap-4">
          <Button size="icon" onClick={play} disabled={isPlaying}>
            <Play />
          </Button>
          <Button size="icon" onClick={pause} disabled={!isPlaying}>
            <Pause />
          </Button>
          <Button size="icon" onClick={next}>
            <SkipForward />
          </Button>
        </div>
        <div className="text-center">{music?.title ?? 'No Selected'}</div>
        {/* Progress slider */}
        <div className="flex w-full px-4 sm:justify-center">
          <Slider
            value={[progress]}
            max={duration}
            step={0.1}
            onValueChange={(value) => seek(value[0])}
            className="sm:w-56"
          />
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <Button size="icon" asChild>
          <Link to="/stats">
            <BarChart />
          </Link>
        </Button>
        <Button size="icon" asChild>
          <Link to="/settings">
            <Settings />
          </Link>
        </Button>
      </div>
    </nav>
  )
}
