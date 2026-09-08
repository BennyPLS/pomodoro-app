import { useMemo } from 'react'
import { DateTime } from 'luxon'
import type { Session } from '@/lib/db'
import { useLocale } from '@/lib/i18n'
import { formatDayLabel } from '@/routes/stats/-lib/utils'

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
  // Distinct work phases, counted on the completion day or last recorded day
  started: number
  // Work Pomodoros seen through to the end
  completed: number
}

/** A day with nothing recorded — used to fill gaps in a range. */
export function emptyDay(date: DateTime<true>): DailyStat {
  return { date, label: formatDayLabel(date), work: 0, rest: 0, recorded: 0, started: 0, completed: 0 }
}

/**
 * Calculate per-day aggregates from raw sessions.
 *
 * @param sessions Array of Session objects (maybe null/undefined)
 */
export function useDaily(sessions: Array<Session> | null | undefined) {
  // Labels are localized, so they have to be rebuilt when the locale changes.
  const locale = useLocale()

  return useMemo<Array<DailyStat>>(() => {
    void locale

    if (!sessions || sessions.length === 0) return []

    // Pausing persists a chunk; resuming keeps the same uuid. Track one
    // representative chunk per phase, preferring the completed chunk.
    const phases = new Map<string, Session>()
    const byDate = sessions.reduce<Map<string, { work: number; rest: number; started: number; completed: number }>>(
      (map, session) => {
        const key = DateTime.fromJSDate(session.startedAt).toISODate()!
        const bucket = map.get(key) ?? { work: 0, rest: 0, started: 0, completed: 0 }

        if (session.type === 'work') {
          bucket.work += session.duration
          const phase = phases.get(session.uuid)
          if (
            !phase ||
            (session.completed && !phase.completed) ||
            (session.completed === phase.completed && session.startedAt > phase.startedAt)
          ) {
            phases.set(session.uuid, session)
          }
        } else {
          bucket.rest += session.duration
        }

        map.set(key, bucket)

        return map
      },
      new Map(),
    )

    // Keep both counts on the same day even when a pause spans midnight.
    // Durations above still belong to the days their chunks were recorded.
    for (const phase of phases.values()) {
      const key = DateTime.fromJSDate(phase.startedAt).toISODate()!
      const bucket = byDate.get(key)!
      bucket.started++
      if (phase.completed) bucket.completed++
    }

    // Determine min and max dates from keys
    const keys = Array.from(byDate.keys())
    if (keys.length === 0) return []

    const dateTimes = keys.map((k) => DateTime.fromISO(k) as DateTime<true>)
    const min = DateTime.min(...dateTimes)!
    const max = DateTime.max(...dateTimes)!

    // Iterate from min to max inclusive and fill missing days with defaults
    const result: Array<DailyStat> = []
    for (let cursor = min; cursor <= max; cursor = cursor.plus({ days: 1 })) {
      const bucket = byDate.get(cursor.toISODate())
      if (!bucket) {
        result.push(emptyDay(cursor))
        continue
      }

      result.push({
        date: cursor,
        label: formatDayLabel(cursor),
        work: bucket.work,
        rest: bucket.rest,
        recorded: bucket.work + bucket.rest,
        started: bucket.started,
        completed: bucket.completed,
      })
    }

    return result
  }, [sessions, locale])
}
