import { useMemo } from 'react'
import { DateTime } from 'luxon'
import type { DailyStat } from '@/routes/stats/-lib/use-daily'

const MAX_STREAK_LENGTH = 3_651 // 10 Years 1 day

/**
 * All-time, range-independent facts. Everything that depends on the selected
 * range lives in `useRange` instead, so the two never disagree.
 */
export type Insights = {
  /** Consecutive days with at least one completed Pomodoro, ending today or yesterday. */
  streak: number
  /** Longest such run anywhere in the history. */
  bestStreak: number
  /** Days with at least one completed Pomodoro. */
  activeDays: number
  /** Nothing done today yet, and there is a streak to lose. */
  streakAtRisk: boolean
}

export function useInsights(daily: Array<DailyStat>) {
  return useMemo<Insights>(() => {
    if (daily.length === 0) return EMPTY_INSIGHTS

    const workedDays = new Set<string>()
    for (const day of daily) if (day.completed > 0) workedDays.add(day.date.toISODate())

    const today = DateTime.local().startOf('day')

    // Include today in the streak only if you worked today (Duolingo-like behavior);
    // otherwise the streak still stands until the day is over.
    const workedToday = workedDays.has(today.toISODate())

    let streak = 0
    let cursor = workedToday ? today : today.minus({ days: 1 })
    while (streak < MAX_STREAK_LENGTH && workedDays.has(cursor.toISODate())) {
      streak += 1
      cursor = cursor.minus({ days: 1 })
    }

    // Longest run: walk the worked days in order and reset whenever a day is skipped.
    let bestStreak = 0
    let run = 0
    let previous: DateTime | null = null
    for (const day of daily) {
      if (day.completed === 0) {
        run = 0
        previous = null
        continue
      }
      run = previous && day.date.diff(previous, 'days').days === 1 ? run + 1 : 1
      previous = day.date
      if (run > bestStreak) bestStreak = run
    }

    return {
      streak,
      bestStreak: Math.max(bestStreak, streak),
      activeDays: workedDays.size,
      streakAtRisk: !workedToday && streak > 0,
    }
  }, [daily])
}

// Isolated empty result object (frozen to prevent accidental mutation)
const EMPTY_INSIGHTS: Insights = Object.freeze({
  streak: 0,
  bestStreak: 0,
  activeDays: 0,
  streakAtRisk: false,
})
