'use client'

import { useMemo } from 'react'
import db from '~/lib/db'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLiveQuery } from 'dexie-react-hooks'
import { TopNavBar } from '~/app/stats/_components/top-nav-bar'
import { format, fromDateKey, toDateKey } from '~/app/stats/_components/utils'

type DailyStat = {
    dateKey: string // yyyy-mm-dd
    label: string // localized date
    // seconds
    work: number
    // seconds
    rest: number
    // seconds
    total: number
    workPercentage: number // 0..100
}

export default function Page() {
    const sessions = useLiveQuery(() => db.sessions.orderBy('startedAt').toArray())

    const daily = useMemo<DailyStat[]>(() => {
        if (!sessions) return []

        const map = new Map<string, { work: number; rest: number }>()

        for (const session of sessions) {
            const key = toDateKey(new Date(session.startedAt))
            const bucket = map.get(key) ?? { work: 0, rest: 0 }

            if (session.type === 'work') {
                bucket.work += session.duration
            } else {
                bucket.rest += session.duration
            }

            map.set(key, bucket)
        }

        // Sort by date ascending
        const sortedKeys = Array.from(map.keys()).sort((a, b) => fromDateKey(a).getTime() - fromDateKey(b).getTime())

        return sortedKeys.map((key) => {
            const { work, rest } = map.get(key)!
            const total = work + rest
            const workPercentage = total > 0 ? (work / total) * 100 : 0
            const label = fromDateKey(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            return { dateKey: key, label, work, rest, total, workPercentage }
        })
    }, [sessions])

    const last14 = useMemo(() => daily.slice(-14), [daily])

    const insights = useMemo(() => {
        if (daily.length === 0) {
            return {
                bestPctDay: null,
                longestWorkDay: null,
                avgWork7: 0,
                avgTotal7: 0,
                streakDays: 0,
                weekWork: 0,
                weekRest: 0,
                weekTotal: 0,
            }
        }

        // Best % day with minimum total 20 minutes to avoid noise
        const MIN_TOTAL_FOR_PCT = 20 * 60
        const bestPctDay =
            daily
                .filter((d) => d.total >= MIN_TOTAL_FOR_PCT)
                .reduce<DailyStat | null>(
                    (best, cur) => (best === null || cur.workPercentage > best.workPercentage ? cur : best),
                    null
                ) ?? null

        // Longest work day
        const longestWorkDay =
            daily.reduce<DailyStat | null>((best, cur) => (best === null || cur.work > best.work ? cur : best), null) ??
            null

        // Last 7 days averages (fill with 0 for missing days by considering only available)
        const last7 = daily.slice(-7)
        const sumWork7 = last7.reduce((acc, d) => acc + d.work, 0)
        const sumTotal7 = last7.reduce((acc, d) => acc + d.total, 0)
        const avgWork7 = last7.length > 0 ? sumWork7 / last7.length : 0
        const avgTotal7 = last7.length > 0 ? sumTotal7 / last7.length : 0

        // Streak: consecutive days up to today with any work
        const todayKey = toDateKey(new Date())
        // Build a Set for quick lookup of days with any work
        const workByDay = new Set(daily.filter((d) => d.work > 0).map((d) => d.dateKey))
        let streak = 0
        let probe = fromDateKey(todayKey)
        while (streak < 3650) {
            const key = toDateKey(probe)
            if (!workByDay.has(key)) break
            streak += 1
            // move to previous day
            probe.setDate(probe.getDate() - 1)
        }

        // This week totals (Mon-Sun based on locale start? We'll use ISO: Mon=1)
        const now = new Date()
        const dayOfWeek = (now.getDay() + 6) % 7 // 0..6, 0 => Monday
        const monday = new Date(now)
        monday.setDate(now.getDate() - dayOfWeek)
        monday.setHours(0, 0, 0, 0)
        const weekWork = daily
            .filter((d) => fromDateKey(d.dateKey).getTime() >= monday.getTime())
            .reduce((acc, d) => acc + d.work, 0)
        const weekRest = daily
            .filter((d) => fromDateKey(d.dateKey).getTime() >= monday.getTime())
            .reduce((acc, d) => acc + d.rest, 0)
        const weekTotal = weekWork + weekRest

        return { bestPctDay, longestWorkDay, avgWork7, avgTotal7, streakDays: streak, weekWork, weekRest, weekTotal }
    }, [daily])

    return (
        <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
            <TopNavBar />

            {/* Insights */}
            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InsightCard
                    title="Racha de días con trabajo"
                    value={insights.streakDays.toString()}
                    hint="Consecutivos"
                />
                <InsightCard
                    title="Mejor día por % de trabajo"
                    value={
                        insights.bestPctDay
                            ? `${insights.bestPctDay.label} • ${insights.bestPctDay.workPercentage.toFixed(0)}%`
                            : '—'
                    }
                    hint={insights.bestPctDay ? `Total ${format(insights.bestPctDay.total)}` : undefined}
                />
                <InsightCard
                    title="Día con más trabajo"
                    value={
                        insights.longestWorkDay
                            ? `${insights.longestWorkDay.label} • ${format(insights.longestWorkDay.work)}`
                            : '—'
                    }
                    hint={insights.longestWorkDay ? `Descanso ${format(insights.longestWorkDay.rest)}` : undefined}
                />
                <InsightCard
                    title="Promedio últimos 7 días"
                    value={`${format(insights.avgWork7)} trabajo`}
                    hint={`${format(insights.avgTotal7)} total`}
                />
            </section>

            {/* This week summary */}
            <section className="bg-card/50 mb-8 rounded-lg border p-4">
                <h2 className="mb-2 text-lg font-medium">Esta semana</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <BadgeStat
                        label="Trabajo"
                        value={format(insights.weekWork)}
                        className="bg-emerald-500/15 text-emerald-500"
                    />
                    <BadgeStat
                        label="Descanso"
                        value={format(insights.weekRest)}
                        className="bg-sky-500/15 text-sky-500"
                    />
                    <BadgeStat
                        label="Total"
                        value={format(insights.weekTotal)}
                        className="bg-foreground/10 text-foreground"
                    />
                    {insights.weekTotal > 0 && (
                        <BadgeStat
                            label="% Trabajo"
                            value={`${((insights.weekWork / insights.weekTotal) * 100).toFixed(2)}%`}
                            className="bg-amber-500/15 text-amber-600"
                        />
                    )}
                </div>
            </section>

            {/* Charts */}
            <section className="bg-card/50 mb-8 rounded-lg border p-4">
                <h2 className="mb-4 text-lg font-medium">Últimos 14 días</h2>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={last14.map((d) => ({ ...d, workMin: d.work / 60, restMin: d.rest / 60 }))}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis dataKey="label" />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                tickFormatter={(v) => `${v}m`}
                                width={40}
                                allowDecimals
                                domain={[
                                    0,
                                    (max: number) => {
                                        return Math.ceil((max ?? 0) * 1.2)
                                    },
                                ]}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tickFormatter={(v) => `${v}%`}
                                width={40}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                formatter={(value: any, name: any) => {
                                    if (name === '% Trabajo') return [`${Number(value).toFixed(2)}%`, name]
                                    // minutes -> readable
                                    const sec = Math.round(Number(value) * 60)
                                    return [format(sec), name === 'Trabajo' ? 'Trabajo' : 'Descanso']
                                }}
                            />
                            <Legend />
                            <Bar
                                yAxisId="left"
                                name="Trabajo"
                                dataKey="workMin"
                                stackId="a"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                yAxisId="left"
                                name="Descanso"
                                dataKey="restMin"
                                stackId="a"
                                fill="#0ea5e9"
                                radius={[4, 4, 0, 0]}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                name="% Trabajo"
                                dataKey="workPct"
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
                            {sessions === null && (
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
                                            <tr
                                                key={s.id ?? `${start.getTime()}-${idx}`}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-2 pr-4">{start.toLocaleString()}</td>
                                                <td className="py-2 pr-4">{end.toLocaleString()}</td>
                                                <td className="py-2 pr-4 capitalize">
                                                    {s.type === 'work'
                                                        ? 'Trabajo'
                                                        : s.type === 'break'
                                                          ? 'Descanso'
                                                          : 'Descanso largo'}
                                                </td>
                                                <td className="py-2 pr-4">{format(s.duration)}</td>
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
                                <th className="py-2 pr-4">% Trabajo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {daily.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-muted-foreground py-8 text-center">
                                        {sessions === null ? 'Cargando…' : 'Sin datos aún'}
                                    </td>
                                </tr>
                            )}
                            {daily
                                .slice()
                                .reverse()
                                .map((d) => (
                                    <tr key={d.dateKey} className="border-b last:border-0">
                                        <td className="py-2 pr-4">{new Date(d.dateKey).toLocaleDateString()}</td>
                                        <td className="py-2 pr-4">{format(d.work)}</td>
                                        <td className="py-2 pr-4">{format(d.rest)}</td>
                                        <td className="py-2 pr-4">{format(d.total)}</td>
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

function InsightCard(props: { title: string; value: string; hint?: string }) {
    const { title, value, hint } = props
    return (
        <div className="bg-card/50 rounded-lg border p-4">
            <div className="text-muted-foreground text-sm">{title}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
            {hint ? <div className="text-muted-foreground mt-1 text-xs">{hint}</div> : null}
        </div>
    )
}

function BadgeStat(props: { label: string; value: string; className?: string }) {
    const { label, value, className } = props
    return (
        <div
            className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 ${className ?? 'bg-foreground/10 text-foreground'}`}
        >
            <span className="text-xs">{label}</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    )
}
