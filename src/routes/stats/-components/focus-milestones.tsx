import type { FocusMilestone } from '@/routes/stats/-lib/use-achievements'
import { formatSeconds } from '@/routes/stats/-lib/utils'
import { Progress } from '@/components/ui/progress'

export function FocusMilestones({
  milestones,
  totalWorkSec,
}: {
  milestones: Array<FocusMilestone>
  totalWorkSec: number
}) {
  return (
    <div className="flex flex-col gap-4">
      {milestones.map((m) => (
        <div
          key={m.id}
          className="from-card/70 to-muted/40 rounded-xl border bg-gradient-to-br p-3 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="text-2xl" aria-hidden>
                {m.emoji}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{m.title}</div>
                <div className="text-muted-foreground text-xs">{m.badge}</div>
              </div>
            </div>
            <div className="text-right text-xs">
              {m.earned ? (
                <span className="bg-chart-4/15 text-chart-4 rounded px-2 py-0.5 font-medium shadow">Adquirido</span>
              ) : (
                <span className="text-muted-foreground">{formatSeconds(m.remainingSec)} left</span>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="bg-foreground/10 relative h-2 w-full overflow-hidden rounded-full">
              <Progress value={m.progressPct} className="h-2 rounded-full" />
            </div>
            <div className="text-muted-foreground w-20 text-center text-xs tabular-nums">
              {formatSeconds(Math.min(totalWorkSec, m.thresholdSec))} / {formatSeconds(m.thresholdSec)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
