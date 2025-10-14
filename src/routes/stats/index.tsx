import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useMemo } from 'react'
import { DateTime } from 'luxon'
import { BadgeStat } from './-components/badge-stat'
import { InsightCard } from './-components/insight-card'
import { TopNavBar } from './-components/top-nav-bar'
import { useDaily } from './-lib/use-daily'
import { useInsights } from './-lib/use-insights'
import { formatMinutes, formatPercentage, formatSeconds } from './-lib/utils'
import { FocusMilestones } from './-components/focus-milestones'
import { PomodoroMilestones } from './-components/pomodoro-milestones'
import { useAchievements } from './-lib/use-achievements'
import db from '@/lib/db'

export const Route = createFileRoute('/stats/')({
  component: Page,
})

function Page() {
  const sessions = useLiveQuery(() => db.sessions.orderBy('startedAt').toArray())

  const daily = useDaily(sessions)
  const insights = useInsights(daily)
  const last14 = useMemo(() => daily.slice(-14), [daily])

  const achievements = useAchievements(sessions, insights.streak)

  const next = achievements.nextStreak
  const streakProgressPct = next?.progressPct

  const streakProgressLabel = next
    ? `${achievements.totals.streakDays} / ${next.thresholdDays} días | Siguiente: ${next.title}`
    : '¡Has desbloqueado todos los hitos de racha!'

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 sm:p-6">
      <TopNavBar />

      {/* Insights */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard
          title={`Racha de días con trabajo`}
          value={insights.streak.toString()}
          hint={insights.streakAtRisk ? '⚠️ Si no trabajas hoy, perderás tu racha' : next?.title}
          progressPct={streakProgressPct}
          progressLabel={streakProgressPct !== undefined ? streakProgressLabel : undefined}
        />
        <InsightCard
          title="Tendencia semanal"
          value={`${insights.weekWorkChange >= 0 ? '+' : '-'}${formatSeconds(Math.abs(insights.weekWorkChange))}`}
          hint={`${formatPercentage(insights.weekWorkChangePct)} vs semana anterior`}
        />

        <InsightCard title="Semana anterior" value={formatSeconds(insights.prevWeekWork)} hint="Trabajo" />

        <InsightCard
          title="Día con más Pomodoros (semana)"
          value={insights.bestDayCompleted.toString()}
          hint={insights.bestDay ? insights.bestDay.toLocaleString(DateTime.DATE_MED) : '—'}
        />
      </section>

      {/* This week summary */}
      <section className="bg-card/50 flex flex-wrap items-center gap-4 rounded-lg border p-4 shadow-sm">
        <h2 className="mr-2 text-lg font-medium">Esta semana</h2>
        <BadgeStat label="Trabajo" value={formatSeconds(insights.weekWork)} className="bg-chart-1/15 text-chart-1" />
        <BadgeStat label="Descanso" value={formatSeconds(insights.weekRest)} className="bg-chart-2/15 text-chart-2" />
        <BadgeStat label="Total" value={formatSeconds(insights.weekTotal)} className="bg-chart-3/10 text-chart-3" />
        {insights.weekTotal > 0 && (
          <BadgeStat
            label="% Trabajo"
            value={formatPercentage(insights.weekWorkPct)}
            className="bg-chart-4/15 text-chart-4"
          />
        )}
      </section>

      {/* Charts */}
      <section className="bg-card/50 rounded-lg border p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-medium">Últimos 14 días</h2>
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
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip
                formatter={(value: number, name: any) => {
                  if (name === '% Trabajo') return [formatPercentage(value), name]
                  return [formatMinutes(value), name === 'Trabajo' ? 'Trabajo' : 'Descanso']
                }}
              />
              <Legend />
              <Bar yAxisId="left" name="Trabajo" dataKey="workMin" stackId="1" fill="var(--chart-1)" />
              <Bar yAxisId="left" name="Descanso" dataKey="restMin" stackId="1" fill="var(--chart-2)" />
              <Line
                yAxisId="right"
                type="natural"
                name="% Trabajo"
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
          <h2 className="text-lg font-medium">Hitos de tiempo de enfoque</h2>
          <div className="text-muted-foreground text-sm">
            Total enfocado: {formatSeconds(achievements.totals.totalWorkSec)}
          </div>
        </div>
        <FocusMilestones milestones={achievements.focus} totalWorkSec={achievements.totals.totalWorkSec} />
      </section>

      {/* Pomodoro Count Milestones */}
      <section className="bg-card/50 rounded-lg border p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Hitos de cantidad de Pomodoros</h2>
          <div className="text-muted-foreground text-sm">Completados: {achievements.totals.completedPomodoros}</div>
        </div>
        <PomodoroMilestones
          milestones={achievements.pomodoro}
          completedPomodoros={achievements.totals.completedPomodoros}
        />
      </section>
    </div>
  )
}
