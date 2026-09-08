import { ChartBar, Dumbbell, EyeClosed, Timer as TimerIcon } from 'lucide-react'
import { formatSeconds } from '@/routes/stats/-lib/utils'
import { m } from '@/lib/i18n'
import useTimer from '@/providers/timer-provider'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

export function SessionDrawerStatistics() {
  const [total, work, rest] = useTimer((store) => [
    store.browserSessionTotalSec,
    store.browserSessionWorkSec,
    store.browserSessionRestSec,
  ])

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          aria-label={m.session_stats()}
          variant="outline"
          size="icon"
          className="border-muted-foreground/20 shadow-sm"
        >
          <ChartBar />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{m.session_stats()}</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="from-card/70 to-muted/40 flex flex-col items-center gap-2 rounded-xl border bg-linear-to-br p-4 text-center shadow-sm">
                <TimerIcon className="text-chart-3 size-8" />
                <div className="text-muted-foreground text-sm">{m.total()}</div>
                <div className="text-xl font-semibold">{formatSeconds(total)}</div>
              </div>
              <div className="from-card/70 to-muted/40 flex flex-col items-center gap-2 rounded-xl border bg-linear-to-br p-4 text-center shadow-sm">
                <Dumbbell className="text-chart-1 size-8" />
                <div className="text-muted-foreground text-sm">{m.working()}</div>
                <div className="text-xl font-semibold">{formatSeconds(work)}</div>
              </div>
              <div className="from-card/70 to-muted/40 flex flex-col items-center gap-2 rounded-xl border bg-linear-to-br p-4 text-center shadow-sm">
                <EyeClosed className="text-chart-2 size-8" />
                <div className="text-muted-foreground text-sm">{m.resting()}</div>
                <div className="text-xl font-semibold">{formatSeconds(rest)}</div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
