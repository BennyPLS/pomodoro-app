import type { PomodoroMilestone } from '@/routes/stats/-lib/use-achievements'
import { Progress } from '@/components/ui/progress'

export function PomodoroMilestones({
  milestones,
  completedPomodoros,
}: {
  milestones: Array<PomodoroMilestone>
  completedPomodoros: number
}) {
  return (
    <div className="flex flex-col gap-4">
      {milestones.map((m) => (
        <div key={m.id} className="rounded-md border p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="text-2xl" aria-hidden>
                {m.emoji}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{m.title}</div>
                <div className="text-muted-foreground text-xs">Hito: {m.thresholdCount} pomodoros</div>
              </div>
            </div>
            <div className="text-right text-xs">
              {m.earned ? (
                <span className="bg-chart-4/15 text-chart-4 rounded px-2 py-0.5 font-medium">Adquirido</span>
              ) : (
                <span className="text-muted-foreground">{m.remainingCount} left</span>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="bg-foreground/10 relative h-2 w-full overflow-hidden rounded">
              <Progress value={m.progressPct} />
            </div>
            <div className="text-muted-foreground w-24 text-center text-xs tabular-nums">
              {Math.min(completedPomodoros, m.thresholdCount)} / {m.thresholdCount}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
