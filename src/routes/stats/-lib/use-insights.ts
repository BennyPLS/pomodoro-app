import { useMemo } from 'react'
import { DateTime } from 'luxon'
import type { DailyStat } from '@/routes/stats/-lib/use-daily'

const MAX_STREAK_LENGTH = 3_651 // 10 Years 1 day

/**
 * Insight aggregates derived from an ordered (chronological) array of DailyStat.
 */
export type Insights = {
  streak: number
  weekWork: number
  weekRest: number
  weekTotal: number
  weekWorkPct: number
  weekWorkChange: number
  weekWorkChangePct: number
  prevWeekWork: number
  bestDay: DateTime | null
  bestDayCompleted: number
}

/**
 * Compute UI-facing insights from an array of DailyStat.
 * This implementation focuses on: weekly aggregates (current ISO week) and streak (history).
 */
export function useInsights(daily: Array<DailyStat>) {
  return useMemo<Insights>(() => {
    if (daily.length === 0) return EMPTY_INSIGHTS

    const today = DateTime.local().startOf('day')
    const weekStart = today.startOf('week')
    const weekEnd = today.endOf('week')
    const prevWeekStart = weekStart.minus({ weeks: 1 })
    const prevWeekEnd = weekEnd.minus({ weeks: 1 })

    const workByDay = new Set<DateTime<true>>()

    let weekWork = 0
    let weekRest = 0
    let prevWeekWork = 0
    let bestDay: DateTime | null = null
    let bestDayCompleted = 0

    for (const d of daily) {
      if (d.completed > 0) workByDay.add(d.date)

      if (weekStart <= d.date && d.date <= weekEnd) {
        if (d.completed > bestDayCompleted) {
          bestDayCompleted = d.completed
          bestDay = d.date
        }
        weekWork += d.work
        weekRest += d.rest
      } else if (prevWeekStart <= d.date && d.date <= prevWeekEnd) {
        prevWeekWork += d.work
      }
    }

    let streak = 0
    let cursor = today
    while (streak < MAX_STREAK_LENGTH) {
      if (!workByDay.has(cursor)) break
      streak += 1
      cursor = cursor.minus({ days: 1 })
    }

    const weekTotal = weekWork + weekRest
    const weekWorkPct = weekTotal > 0 ? (weekWork / weekTotal) * 100 : 0

    const weekWorkChange = weekWork - prevWeekWork
    const weekWorkChangePct = prevWeekWork > 0 ? (weekWorkChange / prevWeekWork) * 100 : weekWork > 0 ? 100 : 0

    return {
      streak,
      weekWork,
      weekRest,
      weekTotal,
      weekWorkPct,
      weekWorkChange,
      weekWorkChangePct,
      prevWeekWork,
      bestDay,
      bestDayCompleted,
    }
  }, [daily])
}

// Isolated empty result object (frozen to prevent accidental mutation)
const EMPTY_INSIGHTS: Insights = Object.freeze({
  streak: 0,
  weekWork: 0,
  weekRest: 0,
  weekTotal: 0,
  weekWorkPct: 0,
  weekWorkChange: 0,
  weekWorkChangePct: 0,
  prevWeekWork: 0,
  bestDay: null,
  bestDayCompleted: 0,
})
