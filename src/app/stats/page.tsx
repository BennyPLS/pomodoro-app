'use client'

import { useMemo } from 'react'
import db from '~/lib/db'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useLiveQuery } from 'dexie-react-hooks'
import { Button } from '~/components/ui/button'
import Link from 'next/link'
import { Home } from 'lucide-react'

type DailyStat = {
    dateKey: string // yyyy-mm-dd
    label: string // localized date
    workSec: number
    restSec: number
    totalSec: number
    workPct: number // 0..100
}

function toDateKey(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function fromDateKey(key: string): Date {
    const [y, m, d] = key.split('-').map(Number)
    return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

function formatDurationShort(totalSec: number): string {
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = Math.floor(totalSec % 60)
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
}

export default function Page() {
    const sessions = useLiveQuery(() => db.timerSessions.orderBy('startedAt').toArray())

    const daily = useMemo<DailyStat[]>(() => {
        const map = new Map<string, { workSec: number; restSec: number }>()
        if (!sessions) return []
        for (const s of sessions) {
            const key = toDateKey(new Date(s.startedAt))
            const bucket = map.get(key) ?? { workSec: 0, restSec: 0 }
            if (s.type === 'work') {
                bucket.workSec += s.durationSec
            } else {
                bucket.restSec += s.durationSec
            }
            map.set(key, bucket)
        }

        // Sort by date ascending
        const sortedKeys = Array.from(map.keys()).sort((a, b) => fromDateKey(a).getTime() - fromDateKey(b).getTime())

        return sortedKeys.map((key) => {
            const { workSec, restSec } = map.get(key)!
            const totalSec = workSec + restSec
            const workPct = totalSec > 0 ? (workSec / totalSec) * 100 : 0
            const d = fromDateKey(key)
            const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            return { dateKey: key, label, workSec, restSec, totalSec, workPct }
        })
    }, [sessions])

    const last14 = useMemo(() => {
        const N = 14
        return daily.slice(-N)
    }, [daily])

    const insights = useMemo(() => {
        if (daily.length === 0) {
            return {
                bestPctDay: null as DailyStat | null,
                longestWorkDay: null as DailyStat | null,
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
                .filter((d) => d.totalSec >= MIN_TOTAL_FOR_PCT)
                .reduce<DailyStat | null>(
                    (best, cur) => (best === null || cur.workPct > best.workPct ? cur : best),
                    null
                ) ?? null

        // Longest work day
        const longestWorkDay =
            daily.reduce<DailyStat | null>(
                (best, cur) => (best === null || cur.workSec > best.workSec ? cur : best),
                null
            ) ?? null

        // Last 7 days averages (fill with 0 for missing days by considering only available)
        const last7 = daily.slice(-7)
        const sumWork7 = last7.reduce((acc, d) => acc + d.workSec, 0)
        const sumTotal7 = last7.reduce((acc, d) => acc + d.totalSec, 0)
        const avgWork7 = last7.length > 0 ? sumWork7 / last7.length : 0
        const avgTotal7 = last7.length > 0 ? sumTotal7 / last7.length : 0

        // Streak: consecutive days up to today with any work
        const todayKey = toDateKey(new Date())
        // Build a Set for quick lookup of days with any work
        const workByDay = new Set(daily.filter((d) => d.workSec > 0).map((d) => d.dateKey))
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
            .reduce((acc, d) => acc + d.workSec, 0)
        const weekRest = daily
            .filter((d) => fromDateKey(d.dateKey).getTime() >= monday.getTime())
            .reduce((acc, d) => acc + d.restSec, 0)
        const weekTotal = weekWork + weekRest

        return { bestPctDay, longestWorkDay, avgWork7, avgTotal7, streakDays: streak, weekWork, weekRest, weekTotal }
    }, [daily])

    return (
        <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
            <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Estadísticas</h1>
                    <p className="text-muted-foreground">Trabajo, descanso, total por día y porcentaje de enfoque.</p>
                </div>
                <Button size="icon" asChild>
                    <Link href="/">
                        <Home />
                    </Link>
                </Button>
            </header>

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
                            ? `${insights.bestPctDay.label} • ${insights.bestPctDay.workPct.toFixed(0)}%`
                            : '—'
                    }
                    hint={
                        insights.bestPctDay ? `Total ${formatDurationShort(insights.bestPctDay.totalSec)}` : undefined
                    }
                />
                <InsightCard
                    title="Día con más trabajo"
                    value={
                        insights.longestWorkDay
                            ? `${insights.longestWorkDay.label} • ${formatDurationShort(insights.longestWorkDay.workSec)}`
                            : '—'
                    }
                    hint={
                        insights.longestWorkDay
                            ? `Descanso ${formatDurationShort(insights.longestWorkDay.restSec)}`
                            : undefined
                    }
                />
                <InsightCard
                    title="Promedio últimos 7 días"
                    value={`${formatDurationShort(insights.avgWork7)} trabajo`}
                    hint={`${formatDurationShort(insights.avgTotal7)} total`}
                />
            </section>

            {/* This week summary */}
            <section className="bg-card/50 mb-8 rounded-lg border p-4">
                <h2 className="mb-2 text-lg font-medium">Esta semana</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <BadgeStat
                        label="Trabajo"
                        value={formatDurationShort(insights.weekWork)}
                        className="bg-emerald-500/15 text-emerald-500"
                    />
                    <BadgeStat
                        label="Descanso"
                        value={formatDurationShort(insights.weekRest)}
                        className="bg-sky-500/15 text-sky-500"
                    />
                    <BadgeStat
                        label="Total"
                        value={formatDurationShort(insights.weekTotal)}
                        className="bg-foreground/10 text-foreground"
                    />
                    {insights.weekTotal > 0 && (
                        <BadgeStat
                            label="% Trabajo"
                            value={`${Math.round((insights.weekWork / insights.weekTotal) * 100)}%`}
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
                        <ComposedChart
                            data={last14.map((d) => ({ ...d, workMin: d.workSec / 60, restMin: d.restSec / 60 }))}
                        >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis dataKey="label" />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                tickFormatter={(v) => `${v}m`}
                                width={40}
                                allowDecimals={false}
                                domain={[0, (_dataMin: number, dataMax: number) => Math.ceil((dataMax ?? 0) * 1.2)]}
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
                                    if (name === '% Trabajo') return [`${Math.round(value)}%`, name]
                                    // minutes -> readable
                                    const sec = Math.round(Number(value) * 60)
                                    return [formatDurationShort(sec), name === 'Trabajo' ? 'Trabajo' : 'Descanso']
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
                                                <td className="py-2 pr-4">{formatDurationShort(s.durationSec)}</td>
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
                                        <td className="py-2 pr-4">{formatDurationShort(d.workSec)}</td>
                                        <td className="py-2 pr-4">{formatDurationShort(d.restSec)}</td>
                                        <td className="py-2 pr-4">{formatDurationShort(d.totalSec)}</td>
                                        <td className="py-2 pr-4">{Math.round(d.workPct)}%</td>
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
