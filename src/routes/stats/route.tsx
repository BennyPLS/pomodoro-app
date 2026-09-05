import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DateTime } from 'luxon'
import { BadgeStat } from './-components/badge-stat'
import { InsightCard } from './-components/insight-card'
import { TopBar } from './-components/top-bar'
import { useDaily } from './-lib/use-daily'
import { useInsights } from './-lib/use-insights'
import { formatMinutes, formatPercentage, formatSeconds } from './-lib/utils'
import { FocusMilestones } from './-components/focus-milestones'
import { PomodoroMilestones } from './-components/pomodoro-milestones'
import { useAchievements } from './-lib/use-achievements'
import { getLocale, m } from '@/lib/i18n'
import db from '@/lib/db'

export const Route = createFileRoute('/stats')({
  component: Page,
})

function Page() {
  const sessions = useLiveQuery(() => db.sessions.orderBy('startedAt').toArray())

  const daily = useDaily(sessions)
  const insights = useInsights(daily)
  const last14 = daily.slice(-14)

  const achievements = useAchievements(sessions, insights.streak)

  const next = achievements.nextStreak
  const streakProgressPct = next?.progressPct

  const streakProgressLabel = next
    ? m.streak_progress({ current: achievements.totals.streakDays, target: next.thresholdDays, title: next.title })
    : m.all_streaks_unlocked()

  return (
    <div className="flex h-svh w-screen flex-col [view-transition-name:main-content]">
      <TopBar />
      <main className="container mx-auto grid grow grid-cols-1 gap-4 px-4 py-4 sm:px-6">
        {/* Insights */}
        <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InsightCard
            title={m.streak_days_with_work()}
            value={insights.streak.toString()}
            hint={insights.streakAtRisk ? m.streak_at_risk() : next?.title}
            progressPct={streakProgressPct}
            progressLabel={streakProgressPct !== undefined ? streakProgressLabel : undefined}
          />
          <InsightCard
            title={m.weekly_trend()}
            value={`${insights.weekWorkChange >= 0 ? '+' : '-'}${formatSeconds(Math.abs(insights.weekWorkChange))}`}
            hint={m.percent_vs_last_week({ percent: formatPercentage(insights.weekWorkChangePct) })}
          />

          <InsightCard title={m.previous_week()} value={formatSeconds(insights.prevWeekWork)} hint={m.work()} />

          <InsightCard
            title={m.most_pomodoros_day_week()}
            value={insights.bestDayCompleted.toString()}
            hint={insights.bestDay ? insights.bestDay.setLocale(getLocale()).toLocaleString(DateTime.DATE_MED) : '—'}
          />
        </section>

        {/* This week summary */}
        <section className="bg-card/50 flex w-full flex-wrap items-center gap-4 rounded-lg border p-4 shadow-sm">
          <h2 className="mr-2 text-lg font-medium">{m.this_week()}</h2>
          <BadgeStat label={m.work()} value={formatSeconds(insights.weekWork)} className="bg-chart-1/15 text-chart-1" />
          <BadgeStat
            label={m.break()}
            value={formatSeconds(insights.weekRest)}
            className="bg-chart-2/15 text-chart-2"
          />
          <BadgeStat
            label={m.total()}
            value={formatSeconds(insights.weekTotal)}
            className="bg-chart-3/10 text-chart-3"
          />
          {insights.weekTotal > 0 && (
            <BadgeStat
              label={m.work_percentage()}
              value={formatPercentage(insights.weekWorkPct)}
              className="bg-chart-4/15 text-chart-4"
            />
          )}
        </section>

        {/* Charts */}
        <section className="bg-card/50 w-full rounded-lg border p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-medium">{m.last_14_days()}</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={last14.map((d) => ({
                  ...d,
                  workMin: d.work / 60,
                  restMin: d.rest / 60,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" />
                <YAxis yAxisId="left" orientation="left" tickFormatter={formatMinutes} domain={[0, 'dataMax']} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={formatPercentage} domain={[0, 100]} />
                <Tooltip
                  formatter={(value, name) => {
                    // recharts 3 types `value` as ValueType | undefined; this chart's
                    // series are all numeric, so anything else passes through as-is.
                    if (typeof value !== 'number') return [String(value ?? ''), name ?? '']
                    if (name === m.work_percentage()) return [formatPercentage(value), name]
                    return [formatMinutes(value), name ?? '']
                  }}
                />
                <Legend />
                <Bar yAxisId="left" name={m.work()} dataKey="workMin" stackId="1" fill="var(--chart-1)" />
                <Bar yAxisId="left" name={m.break()} dataKey="restMin" stackId="1" fill="var(--chart-2)" />
                <Line
                  yAxisId="right"
                  type="natural"
                  name={m.work_percentage()}
                  dataKey="workPercentage"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Focus Time Milestones */}
        <section className="bg-card/50 rounded-lg border p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">{m.focus_time_milestones()}</h2>
            <div className="text-muted-foreground text-sm">
              {m.total_focused_value({ value: formatSeconds(achievements.totals.totalWorkSec) })}
            </div>
          </div>
          <FocusMilestones milestones={achievements.focus} totalWorkSec={achievements.totals.totalWorkSec} />
        </section>

        {/* Pomodoro Count Milestones */}
        <section className="bg-card/50 rounded-lg border p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">{m.pomodoro_quantity_milestones()}</h2>
            <div className="text-muted-foreground text-sm">
              {m.completed_value({ count: achievements.totals.completedPomodoros })}
            </div>
          </div>
          <PomodoroMilestones
            milestones={achievements.pomodoro}
            completedPomodoros={achievements.totals.completedPomodoros}
          />
        </section>
      </main>
    </div>
  )
}
