import type { ReactNode } from 'react'
import { Progress } from '@/components/ui/progress'

export function InsightCard({
  title,
  value,
  hint,
  progressPct,
  progressLabel,
}: {
  title: ReactNode
  value: ReactNode
  hint?: ReactNode
  progressPct?: number
  progressLabel?: ReactNode
}) {
  return (
    <div className="bg-card/50 hover:border-primary/30 rounded-xl border p-4 shadow-sm transition-all hover:shadow-lg">
      <div className="text-muted-foreground text-sm">{title}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
      {hint ? <div className="text-muted-foreground mt-1 text-xs">{hint}</div> : null}
      {progressPct !== undefined && (
        <div className="mt-3">
          <Progress value={progressPct} />
          {progressLabel ? <div className="text-muted-foreground mt-1 text-xs">{progressLabel}</div> : null}
        </div>
      )}
    </div>
  )
}
