import { ChartBar, Dumbbell, EyeClosed, Timer as TimerIcon } from 'lucide-react'
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
