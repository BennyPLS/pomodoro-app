import { CalendarOff, Table2 } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Range, RangeLength } from '@/routes/stats/-lib/use-range'
import type { TimeOfDay } from '@/routes/stats/-lib/use-time-of-day'
import { RANGE_LENGTHS } from '@/routes/stats/-lib/use-range'
import { ActivityChart } from '@/routes/stats/-components/activity-chart'
import { ActivityTable } from '@/routes/stats/-components/activity-table'
import { HoursChart } from '@/routes/stats/-components/hours-chart'
import { HoursTable } from '@/routes/stats/-components/hours-table'
import { StatTile } from '@/routes/stats/-components/stat-tile'
import { toDayPoints } from '@/routes/stats/-lib/chart-data'
import {
  formatCountDelta,
  formatDurationShort,
  formatPercentage,
  formatPercentageDelta,
} from '@/routes/stats/-lib/utils'
import { useLocalStorageJson } from '@/hooks/use-local-storage'
import { Button } from '@/components/ui/button'
import { m } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * Everything that depends on the selected date range, with the range control in
 * a single row at the top: the summary, both charts and the tables all describe
 * the same slice, so their numbers can never disagree.
 */
export function ActivitySection({
  range,
  timeOfDay,
  length,
  onLengthChange,
}: {
  range: Range
  timeOfDay: TimeOfDay
  length: RangeLength
  onLengthChange: (length: RangeLength) => void
}) {
  const [showTable, setShowTable] = useLocalStorageJson('stats-show-table', false)
  const data = toDayPoints(range.days)

  return (
    <section className="flex flex-col gap-4">
      {/* Filter row: above everything it scopes, never inside a chart card. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">
          {m.activity()} <span className="text-muted-foreground font-normal">· {m.last_n_days({ days: length })}</span>
        </h2>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label={m.range()}
            className="bg-muted/40 flex items-center gap-1 rounded-md border p-0.5"
          >
            {RANGE_LENGTHS.map((preset) => (
              <Button
                key={preset}
                size="sm"
                variant={preset === length ? 'default' : 'ghost'}
                aria-pressed={preset === length}
                className={cn('h-7 px-2.5', preset !== length && 'text-muted-foreground')}
                onClick={() => onLengthChange(preset)}
              >
                {m.days_short({ days: preset })}
              </Button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-8"
            aria-pressed={showTable}
            onClick={() => setShowTable(!showTable)}
          >
            <Table2 aria-hidden />
            {showTable ? m.show_chart() : m.show_table()}
          </Button>
        </div>
      </div>

      <RangeSummary range={range} />

      {!range.hasData ? (
        <div className="bg-card text-muted-foreground flex flex-col items-center gap-2 rounded-xl border p-10 text-center text-sm shadow-sm">
          <CalendarOff className="size-6" aria-hidden />
          {m.no_data_in_range()}
        </div>
      ) : (
        <>
          <Panel title={m.work_and_break_per_day()}>
            {showTable ? <ActivityTable data={data} /> : <ActivityChart data={data} />}
          </Panel>

          {/* The question a daily time series cannot answer: when you focus. */}
          {timeOfDay.hasData ? (
            <Panel
              title={m.focus_by_hour()}
              aside={timeOfDay.peak ? m.peak_hours({ hours: timeOfDay.peak.rangeLabel }) : undefined}
            >
              {showTable ? <HoursTable data={timeOfDay.hours} /> : <HoursChart data={timeOfDay.hours} />}
            </Panel>
          ) : null}
        </>
      )}
    </section>
  )
}

function Panel({ title, aside, children }: { title: string; aside?: string; children: ReactNode }) {
  return (
    <div className="bg-card rounded-xl border p-4 shadow-sm sm:p-5">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-sm font-medium">{title}</h3>
        {aside ? <span className="text-muted-foreground text-xs">{aside}</span> : null}
      </header>
      {children}
    </div>
  )
}

/**
 * Four tiles, four independent facts.
 *
 * The old set spent two of its four slots on numbers derivable from the others
 * (break = total − work, and a work/rest share that the fixed 25/5/30 cycle
 * pins near 83% no matter what you do — and which goes *up* when you skip your
 * breaks). Break minutes now live in the chart, tooltip and table, where they
 * are context rather than a headline. What replaces them are the two things the
 * page could measure but never did: whether you finish what you start, and how
 * often you turn up at all.
 */
function RangeSummary({ range }: { range: Range }) {
  // ASCII '-' to match the hyphen Intl puts in front of the signed percentage.
  const sign = range.workChange < 0 ? '-' : '+'

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        label={m.focus_time()}
        value={formatDurationShort(range.work)}
        trend={range.days.map((day) => day.work)}
        delta={{
          text: `${sign}${formatDurationShort(Math.abs(range.workChange))}`,
          direction: range.workChange > 0 ? 'up' : range.workChange < 0 ? 'down' : 'flat',
          caption: `· ${m.vs_previous_period({ percent: formatPercentageDelta(range.workChangePct), days: range.length })}`,
        }}
        hint={range.activeDays > 0 ? m.per_active_day({ value: formatDurationShort(range.perActiveDay) }) : undefined}
      />

      <StatTile
        label={m.pomodoros()}
        value={range.completed.toLocaleString()}
        trend={range.days.map((day) => day.completed)}
        delta={{
          text: formatCountDelta(range.completedChange),
          direction: range.completedChange > 0 ? 'up' : range.completedChange < 0 ? 'down' : 'flat',
          caption: `· ${m.vs_previous_days({ days: range.length })}`,
        }}
        hint={
          range.bestDay ? `${m.best_day()}: ${range.bestDay.label} (${range.bestDay.completed})` : m.no_data_in_range()
        }
      />

      {/* The only quality signal in the schema: `Session.completed` was stored
          from the start and read by nothing but the Pomodoro count. */}
      <StatTile
        label={m.completion_rate()}
        value={range.started > 0 ? formatPercentage(range.completionRate) : '—'}
        hint={
          range.started === 0
            ? undefined
            : range.abandoned > 0
              ? m.abandoned_count({ count: range.abandoned })
              : m.all_finished()
        }
      />

      {/* Named for the concept, not "days active": the all-time band above
          already has an "Active days" tile, and two labels that close together
          on one screen invite reading a 30-day figure as a lifetime one. A
          fraction rather than a bare count, too — "10" answers nothing without
          the window. */}
      <StatTile
        label={m.consistency()}
        value={`${range.activeDays}/${range.length}`}
        hint={formatPercentage((range.activeDays / range.length) * 100)}
      />
    </div>
  )
}
