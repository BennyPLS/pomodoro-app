import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useMusicPlayer } from '@/providers/music-provider'
import { TaskDrawer } from '@/routes/-components/task-drawer'
import { SessionDrawerStatistics } from '@/routes/-components/session-drawer-statistics'

export function BottomBar() {
  const [oldVolume, setOldVolume] = useState(0)
  const [volume, setVolume] = useMusicPlayer((store) => [store.volume, store.setVolume])
  return (
    <div className="bg-card/80 z-30 flex w-full items-center gap-2 border-t p-4 shadow-lg backdrop-blur sm:justify-center">
      {/* Session Statistics */}
      <SessionDrawerStatistics />
      {/* Volume Control */}
      <div className="flex grow justify-center gap-2">
        <Button
          size="icon"
          onClick={() => {
            if (volume === 0) {
              setOldVolume(0)
              setVolume(oldVolume)
            } else {
              setOldVolume(volume)
              setVolume(0)
            }
          }}
        >
          {volume > 0.66 ? <Volume2 /> : volume > 0.33 ? <Volume1 /> : volume !== 0 ? <Volume /> : <VolumeX />}
        </Button>
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={(value) => setVolume(value[0])}
          className="sm:w-80"
        />
      </div>
      <TaskDrawer />
    </div>
  )
}
