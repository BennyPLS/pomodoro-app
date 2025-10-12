import { useMemo } from 'react'
import { DateTime } from 'luxon'
import type { Session } from '@/lib/db'

export type DailyStat = {
  // actual DateTime for the day (start of day)
  date: DateTime<true>
  // localized date (e.g. 'Jan 5')
  label: string
  // seconds (recorded work)
  work: number
  // seconds (recorded rest)
  rest: number
  // seconds (recorded total)
  recorded: number
  // Work as % of the recorded time
  workPercentage: number
  // Completed Work Pomodoros
  completed: number
}

/**
 * Calculate per-day aggregates from raw sessions.
 *
 * @param sessions Array of Session objects (maybe null/undefined)
 */
export function useDaily(sessions: Array<Session> | null | undefined) {
  return useMemo<Array<DailyStat>>(() => {
    if (!sessions || sessions.length === 0) return []

    const byDate = sessions.reduce<Map<string, { work: number; rest: number; completed: number }>>((map, session) => {
      const key = DateTime.fromJSDate(session.startedAt).toISODate()!
      const bucket = map.get(key) ?? { work: 0, rest: 0, completed: 0 }

      if (session.type === 'work') {
        bucket.work += session.duration
        if (session.completed) bucket.completed++
      } else {
        bucket.rest += session.duration
      }

      map.set(key, bucket)

      return map
    }, new Map())

    // Determine min and max dates from keys
    const keys = Array.from(byDate.keys())
    if (keys.length === 0) return []

    const dateTimes = keys.map((k) => DateTime.fromISO(k) as DateTime<true>)
    const min = DateTime.min(...dateTimes)!
    const max = DateTime.max(...dateTimes)!

    // Iterate from min to max inclusive and fill missing days with defaults
    const result: Array<DailyStat> = []
    for (let cursor = min; cursor <= max; cursor = cursor.plus({ days: 1 })) {
      const dateKey = cursor.toISODate()
      const bucket = byDate.get(dateKey) ?? { work: 0, rest: 0, completed: 0 }
      const work = bucket.work
      const rest = bucket.rest
      const recorded = work + rest
      const workPercentage = recorded === 0 ? 0 : (work / recorded) * 100

      const label = cursor.toLocaleString({ month: 'short', day: 'numeric' })

      result.push({
        date: cursor,
        label,
        work,
        rest,
        recorded,
        workPercentage,
        completed: bucket.completed,
      })
    }

    return result
  }, [sessions])
}
