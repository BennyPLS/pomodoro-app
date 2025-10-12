import { ChartBar, Dumbbell, EyeClosed, Timer as TimerIcon, Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Slider } from '@/components/ui/slider'
import { useMusicPlayer } from '@/providers/music-provider'
import useTimer from '@/providers/timer-provider'

export function BottomBar() {
  const [oldVolume, setOldVolume] = useState(0)
  const [volume, setVolume] = useMusicPlayer((store) => [store.volume, store.setVolume])
  return (
    <div className="bg-card/80 fixed bottom-0 left-0 z-30 flex w-full items-center gap-2 border-t p-4 shadow-lg backdrop-blur sm:justify-center">
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
      {/* Session Statistics */}
      <SessionDrawerStatistics />
    </div>
  )
}

function SessionDrawerStatistics() {
  const [total, work, rest] = useTimer((store) => [
    store.browserSessionTotalSec,
    store.browserSessionWorkSec,
    store.browserSessionRestSec,
  ])

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="border-muted-foreground/20 shadow-sm">
          <ChartBar />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Estadísticas de la sesión</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="from-card/70 to-muted/40 flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-br p-4 text-center shadow-sm">
                <TimerIcon className="text-chart-3 size-8" />
                <div className="text-muted-foreground text-sm">Total</div>
                <div className="text-xl font-semibold">
                  {Math.floor(total / 60)} min <br />
                  {Math.floor(total % 60)} sec
                </div>
              </div>
              <div className="from-card/70 to-muted/40 flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-br p-4 text-center shadow-sm">
                <Dumbbell className="text-chart-1 size-8" />
                <div className="text-muted-foreground text-sm">Trabajando</div>
                <div className="text-xl font-semibold">
                  {Math.floor(work / 60)} min <br />
                  {Math.floor(work % 60)} sec
                </div>
              </div>
              <div className="from-card/70 to-muted/40 flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-br p-4 text-center shadow-sm">
                <EyeClosed className="text-chart-2 size-8" />
                <div className="text-muted-foreground text-sm">Descansando</div>
                <div className="text-xl font-semibold">
                  {Math.floor(rest / 60)} min <br />
                  {Math.floor(rest % 60)} sec
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
