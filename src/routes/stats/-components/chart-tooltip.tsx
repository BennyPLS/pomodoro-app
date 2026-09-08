import type { ReactNode } from 'react'
import type * as Recharts from 'recharts'
import type { DayPoint } from '@/routes/stats/-lib/chart-data'
import type { HourBucket } from '@/routes/stats/-lib/use-time-of-day'
import { formatDurationShort } from '@/routes/stats/-lib/utils'
import { m } from '@/lib/i18n'

// recharts 3 reads `active`/`payload`/`label` from context, so they live on
// TooltipContentProps rather than on the Tooltip props themselves.
type TooltipProps = Partial<Recharts.TooltipContentProps<number, string>>

function payload<T>(props: TooltipProps): T | undefined {
  return props.payload?.[0]?.payload as T | undefined
}

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-border/50 bg-background grid min-w-40 gap-1.5 rounded-lg border px-2.5 py-2 text-xs shadow-xl">
      <div className="text-muted-foreground font-medium">{title}</div>
      <div className="grid gap-1">{children}</div>
    </div>
  )
}

/**
 * One row per series. The value leads and the series name follows — in a
 * tooltip the reader already knows the series and wants the number.
 */
function Row({ color, name, value }: { color?: string; name: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-1.5">
        {/* Line key rather than a filled box: at this density a box is data-weight ink. */}
        <span aria-hidden className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-muted-foreground truncate">{name}</span>
      </span>
      <span className="text-foreground font-medium tabular-nums">{value}</span>
    </div>
  )
}

/** Lists every series at the hovered day, so the pointer never has to find a mark. */
export function ActivityTooltip(props: TooltipProps) {
  const day = payload<DayPoint>(props)
  if (!props.active || !day) return null

  const abandoned = day.started - day.completed

  return (
    <Shell title={day.longLabel}>
      <Row color="var(--color-work)" name={m.work()} value={formatDurationShort(day.workSec)} />
      <Row color="var(--color-rest)" name={m.break()} value={formatDurationShort(day.restSec)} />
      <Row name={m.total()} value={formatDurationShort(day.recordedSec)} />
      <Row name={m.pomodoros()} value={day.completed.toLocaleString()} />
      {/* Only when there is something to admit to — an all-clear day stays quiet. */}
      {abandoned > 0 ? <Row name={m.abandoned()} value={abandoned.toLocaleString()} /> : null}
    </Shell>
  )
}

export function HourTooltip(props: TooltipProps) {
  const hour = payload<HourBucket>(props)
  if (!props.active || !hour) return null

  return (
    <Shell title={hour.rangeLabel}>
      <Row color="var(--color-work)" name={m.focus_time()} value={formatDurationShort(hour.workSec)} />
    </Shell>
  )
}
