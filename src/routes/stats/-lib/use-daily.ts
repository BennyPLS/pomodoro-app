import { useMemo } from 'react'
import type { Session } from '@/lib/db'
import { fromDateKey, toDateKey } from '@/routes/stats/-lib/utils'

export type DailyStat = {
  // yyyy-mm-dd
  dateKey: string
  // localized date (e.g. 'Jan 5')
  label: string
  // seconds (recorded work)
  work: number
  // seconds (recorded rest)
  rest: number
  // seconds (recorded total)
  recorded: number
  // seconds (not recorded)
  idle: number
  // Work as % of the full day (0..100).
  workPercentage: number
}

export const DAY_IN_SECONDS = 24 * 60 * 60

// Type guard for future extensibility
function isWorkSession(s: Session): boolean {
  return s.type === 'work'
}

/**
 * Calculate per-day aggregates from raw sessions.
 *
 * @param sessions Array of Session objects (maybe null/undefined)
 */
export function useDaily(sessions: Array<Session> | null | undefined) {
  return useMemo<Array<DailyStat>>(() => {
    if (!sessions || sessions.length === 0) return []

    // Aggregate by dateKey
    const byDate = sessions.reduce<Map<string, { work: number; rest: number }>>((map, session) => {
      const key = toDateKey(new Date(session.startedAt))
      const bucket = map.get(key) ?? { work: 0, rest: 0 }

      if (isWorkSession(session)) {
        bucket.work += session.duration
      } else {
        bucket.rest += session.duration
      }

      map.set(key, bucket)

      return map
    }, new Map())

    // Sort keys chronologically
    const sorted = Array.from(byDate.keys())
      .map((k) => ({ key: k, time: fromDateKey(k).getTime() }))
      .sort((a, b) => a.time - b.time)

    return sorted.map(({ key: dateKey }) => {
      const { work, rest } = byDate.get(dateKey)!

      const recorded = work + rest
      const idle = Math.max(0, DAY_IN_SECONDS - recorded)
      const workPercentage = (work / DAY_IN_SECONDS) * 100

      const label = fromDateKey(dateKey).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })

      return {
        dateKey,
        label,
        work,
        rest,
        recorded,
        idle,
        workPercentage,
      }
    })
  }, [sessions])
}
