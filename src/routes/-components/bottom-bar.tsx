import { ClipboardList, Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { m } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useMusicPlayer } from '@/providers/music-provider'
import { SessionDrawerStatistics } from '@/routes/-components/session-drawer-statistics'

export function BottomBar() {
  const [oldVolume, setOldVolume] = useState(0)
  const [volume, setVolume] = useMusicPlayer((store) => [store.volume, store.setVolume])

  return (
    <BottomBarView
      volume={volume}
      setVolume={setVolume}
      toggleMute={() => {
        if (volume === 0) {
          setOldVolume(0)
          setVolume(oldVolume)
        } else {
          setOldVolume(volume)
          setVolume(0)
        }
      }}
      sessionAction={<SessionDrawerStatistics />}
      tasksAction={
        <Button
          variant="outline"
          size="icon"
          className="w-full rounded-none border-0 border-t"
          asChild
          aria-label={m.tasks()}
        >
          <Link to="/tasks" viewTransition={{ types: ['slide-drawer-up'] }}>
            <ClipboardList />
          </Link>
        </Button>
      }
    />
  )
}

export function BottomBarView({
  volume,
  setVolume,
  toggleMute,
  sessionAction,
  tasksAction,
}: {
  volume: number
  setVolume: (volume: number) => void
  toggleMute: () => void
  sessionAction: ReactNode
  tasksAction: ReactNode
}) {
  const VolumeIcon = volume > 0.66 ? Volume2 : volume > 0.33 ? Volume1 : volume !== 0 ? Volume : VolumeX
  return (
    <>
      <div className="bg-card/80 flex w-full flex-col items-center gap-4 border-t p-4">
        <div className="flex w-full gap-4">
          <div className="flex grow justify-center gap-2">
            <Button size="icon" onClick={toggleMute} aria-label={volume === 0 ? m.unmute() : m.mute()}>
              <VolumeIcon className="size-16" />
            </Button>
            <Slider
              aria-label={m.volume()}
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={(value) => setVolume(value[0])}
              className="@2xl:w-80"
            />
          </div>
          {sessionAction}
        </div>
      </div>
      {tasksAction}
    </>
  )
}
