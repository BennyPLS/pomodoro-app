'use client'

import { useMemo } from 'react'
import { DailyStat } from '~/app/stats/_lib/use-daily'
import { fromDateKey, toDateKey } from '~/app/stats/_lib/utils'


/**
 * Insight aggregates derived from an ordered (chronological) array of DailyStat.
 */
export type Insights = {
    bestPctDay: DailyStat | null
    longestWorkDay: DailyStat | null
    avgWork7: number
    avgTotal7: number
    streak: number
    weekWork: number
    weekRest: number
    weekTotal: number
    weekIdle: number
    weekWorkPct: number
}

// Constants kept outside the hook to avoid re-allocation.
// 20 minutes (in seconds)
const MIN_TOTAL_FOR_PCT = 20 * 60
const WEEK_IN_SECONDS = 7 * 24 * 60 * 60

/**
 * Returns the Date (at 00:00) representing the Monday of the ISO week
 * containing the provided date.
 */
function startOfISOWeek(d: Date) {
    // ISO: Monday = 1, JS Date: Sunday = 0
    const dayOfWeek = (d.getDay() + 6) % 7 // 0..6 (0 => Monday)
    const monday = new Date(d)
    monday.setDate(d.getDate() - dayOfWeek)
    monday.setHours(0, 0, 0, 0)
    return monday
}

export function useInsights(daily: DailyStat[]) {
    return useMemo<Insights>(() => {
        if (daily.length === 0) {
            return EMPTY_INSIGHTS
        }

        // Best % day (only consider if recorded >= MIN_TOTAL_FOR_PCT)
        let bestPctDay: DailyStat | null = null
        // Longest work day
        let longestWorkDay: DailyStat | null = null

        for (const d of daily) {
            if (d.recorded >= MIN_TOTAL_FOR_PCT) {
                if (bestPctDay === null || d.workPercentage > bestPctDay.workPercentage) {
                    bestPctDay = d
                }
            }
            if (longestWorkDay === null || d.work > longestWorkDay.work) {
                longestWorkDay = d
            }
        }

        // Last 7 days averages (assumes input is chronological; preserve original ordering)
        const last7 = daily.slice(-7)
        let sumWork7 = 0
        let sumTotal7 = 0
        for (const d of last7) {
            sumWork7 += d.work
            sumTotal7 += d.recorded
        }
        const len7 = last7.length || 1 // avoid division by zero (handled by ternary previously)
        const avgWork7 = last7.length > 0 ? sumWork7 / len7 : 0
        const avgTotal7 = last7.length > 0 ? sumTotal7 / len7 : 0

        // Streak: consecutive days up to today with any work > 0
        const today = new Date()
        const todayKey = toDateKey(today)
        const workByDay = new Set<string>()
        for (const d of daily) {
            if (d.work > 0) workByDay.add(d.dateKey)
        }
        let streak = 0
        // Use a new Date derived from todayKey to avoid time-of-day drift
        const probe = fromDateKey(todayKey)
        // Upper bound to prevent infinite loop (10 years ~ 3650 days)
        while (streak < 3650) {
            const key = toDateKey(probe)
            if (!workByDay.has(key)) break
            streak += 1
            probe.setDate(probe.getDate() - 1)
            probe.setHours(0, 0, 0, 0)
        }

        // This ISO week totals (Mon-Sun)
        const monday = startOfISOWeek(today)
        const mondayTs = monday.getTime()

        let weekWork = 0
        let weekRest = 0
        for (const d of daily) {
            const dayTs = fromDateKey(d.dateKey).getTime()
            if (dayTs >= mondayTs) {
                weekWork += d.work
                weekRest += d.rest
            }
        }
        const weekTotal = weekWork + weekRest
        const weekWorkPct = (weekWork / WEEK_IN_SECONDS) * 100
        const weekIdle = WEEK_IN_SECONDS - weekTotal

        return {
            bestPctDay,
            longestWorkDay,
            avgWork7,
            avgTotal7,
            streak,
            weekWork,
            weekRest,
            weekTotal,
            weekWorkPct,
            weekIdle
        }
    }, [daily])
}

// Isolated empty result object (frozen to prevent accidental mutation)
const EMPTY_INSIGHTS: Insights = Object.freeze({
    bestPctDay: null,
    longestWorkDay: null,
    avgWork7: 0,
    avgTotal7: 0,
    streak: 0,
    weekWork: 0,
    weekRest: 0,
    weekTotal: 0,
    weekIdle: 0,
    weekWorkPct: 0
})