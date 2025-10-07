import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { TopNavBar } from './-components/top-nav-bar'
import { formatMinutes, formatPercentage, formatSeconds } from './-lib/utils'
import { BadgeStat } from './-components/badge-stat'
import { InsightCard } from './-components/insight-card'
import { useInsights } from './-lib/use-insights'
import { useDaily } from './-lib/use-daily'
import db from '@/lib/db'

export const Route = createFileRoute('/stats/')({
  component: Page,
})

function Page() {
  const sessions = useLiveQuery(() => db.sessions.orderBy('startedAt').toArray())

  const daily = useDaily(sessions)
  const last14 = useMemo(() => daily.slice(-14), [daily])
  const insights = useInsights(daily)

  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <TopNavBar />

      {/* Insights */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard title="Racha de días con trabajo" value={insights.streak.toString()} hint="Consecutivos" />
        <InsightCard
          title="Mejor día por % de trabajo"
          value={
            insights.bestPctDay
              ? `${insights.bestPctDay.label} • ${insights.bestPctDay.workPercentage.toFixed(0)}%`
              : '—'
          }
          hint={insights.bestPctDay ? `Total ${formatSeconds(insights.bestPctDay.recorded)}` : undefined}
        />
        <InsightCard
          title="Día con más trabajo"
          value={
            insights.longestWorkDay
              ? `${insights.longestWorkDay.label} • ${formatSeconds(insights.longestWorkDay.work)}`
              : '—'
          }
          hint={insights.longestWorkDay ? `Descanso ${formatSeconds(insights.longestWorkDay.rest)}` : undefined}
        />
        <InsightCard
          title="Promedio últimos 7 días"
          value={`${formatSeconds(insights.avgWork7)} trabajo`}
          hint={`${formatSeconds(insights.avgTotal7)} total`}
        />
      </section>

      {/* This week summary */}
      <section className="bg-card/50 mb-8 flex flex-wrap items-center gap-4 rounded-lg border p-4">
        <h2 className="mr-2 text-lg font-medium">Esta semana</h2>
        <BadgeStat
          label="Trabajo"
          value={formatSeconds(insights.weekWork)}
          className="bg-emerald-500/15 text-emerald-500"
        />
        <BadgeStat label="Descanso" value={formatSeconds(insights.weekRest)} className="bg-sky-500/15 text-sky-500" />
        <BadgeStat
          label="Total"
          value={formatSeconds(insights.weekTotal)}
          className="bg-foreground/10 text-foreground"
        />
        <BadgeStat
          label="Otros"
          value={formatSeconds(insights.weekIdle)}
          className="bg-foreground/10 text-foreground"
        />
        {insights.weekTotal > 0 && (
          <BadgeStat
            label="% Trabajo"
            value={formatPercentage(insights.weekWorkPct)}
            className="bg-amber-500/15 text-amber-600"
          />
        )}
      </section>

      {/* Charts */}
      <section className="bg-card/50 mb-8 rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-medium">Últimos 14 días</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={last14.map((d) => ({
                ...d,
                workMin: d.work / 60,
                restMin: d.rest / 60,
                idleMin: d.idle / 60,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" />
              <YAxis
                yAxisId="left"
                orientation="left"
                tickFormatter={(v: number) => formatMinutes(v)}
                domain={[0, 'dataMax']}
              />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip
                formatter={(value: number, name: any) => {
                  if (name === '% Trabajo') return [formatPercentage(value), name]
                  return [formatMinutes(value), name === 'Trabajo' ? 'Trabajo' : 'Descanso']
                }}
              />
              <Legend />
              <Bar yAxisId="left" name="Trabajo" dataKey="workMin" stackId="1" fill="#10b981" />
              <Bar yAxisId="left" name="Descanso" dataKey="restMin" stackId="1" fill="#0ea5e9" />
              <Bar yAxisId="left" name="Descanso" dataKey="idleMin" stackId="1" fill="#464d5a" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                name="% Trabajo"
                dataKey="workPercentage"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Entradas (todos los registros) */}
      <section className="bg-card/50 mb-8 rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-medium">Entradas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-4">Inicio</th>
                <th className="py-2 pr-4">Fin</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Duración</th>
              </tr>
            </thead>
            <tbody>
              {sessions && (
                <tr>
                  <td colSpan={4} className="text-muted-foreground py-8 text-center">
                    Cargando…
                  </td>
                </tr>
              )}
              {sessions && sessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-muted-foreground py-8 text-center">
                    Sin datos aún
                  </td>
                </tr>
              )}
              {sessions &&
                sessions
                  .slice()
                  .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
                  .map((s, idx) => {
                    const start = new Date(s.startedAt)
                    const end = new Date(s.endedAt)
                    return (
                      <tr key={s.id ?? `${start.getTime()}-${idx}`} className="border-b last:border-0">
                        <td className="py-2 pr-4">{start.toLocaleString()}</td>
                        <td className="py-2 pr-4">{end.toLocaleString()}</td>
                        <td className="py-2 pr-4 capitalize">
                          {s.type === 'work' ? 'Trabajo' : s.type === 'break' ? 'Descanso' : 'Descanso largo'}
                        </td>
                        <td className="py-2 pr-4">{formatSeconds(s.duration)}</td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Table */}
      <section className="bg-card/50 rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-medium">Detalle por día</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Trabajo</th>
                <th className="py-2 pr-4">Descanso</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Otros</th>
                <th className="py-2 pr-4">% Trabajo</th>
              </tr>
            </thead>
            <tbody>
              {daily.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted-foreground py-8 text-center">
                    {sessions ? 'Cargando…' : 'Sin datos aún'}
                  </td>
                </tr>
              )}
              {daily
                .slice()
                .reverse()
                .map((d) => (
                  <tr key={d.dateKey} className="border-b last:border-0">
                    <td className="py-2 pr-4">{new Date(d.dateKey).toLocaleDateString()}</td>
                    <td className="py-2 pr-4">{formatSeconds(d.work)}</td>
                    <td className="py-2 pr-4">{formatSeconds(d.rest)}</td>
                    <td className="py-2 pr-4">{formatSeconds(d.recorded)}</td>
                    <td className="py-2 pr-4">{formatSeconds(d.idle)}</td>
                    <td className="py-2 pr-4">{Math.round(d.workPercentage)}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
