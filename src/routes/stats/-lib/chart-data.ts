import type { ChartConfig } from '@/components/ui/chart'
import type { DailyStat } from '@/routes/stats/-lib/use-daily'
import { formatDayLabelLong } from '@/routes/stats/-lib/utils'
import { m } from '@/lib/i18n'

/** One column / one point. Durations are in minutes so the axis can be read. */
export type DayPoint = {
  label: string
  longLabel: string
  work: number
  rest: number
  workSec: number
  restSec: number
  recordedSec: number
  started: number
  completed: number
}

export function toDayPoints(days: Array<DailyStat>): Array<DayPoint> {
  return days.map((day) => ({
    label: day.label,
    longLabel: formatDayLabelLong(day.date),
    work: day.work / 60,
    rest: day.rest / 60,
    workSec: day.work,
    restSec: day.rest,
    recordedSec: day.recorded,
    started: day.started,
    completed: day.completed,
  }))
}

/** Series identity: slot 1 for work, slot 2 for break. Fixed, never by rank. */
export const activityConfig = () =>
  ({
    work: { label: m.work(), color: 'var(--chart-1)' },
    rest: { label: m.break(), color: 'var(--chart-2)' },
  }) satisfies ChartConfig

/** Work keeps slot 1 here too: same entity, same hue, across both charts. */
export const hoursConfig = () =>
  ({
    work: { label: m.focus_time(), color: 'var(--chart-1)' },
  }) satisfies ChartConfig
