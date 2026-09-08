import { useMemo } from 'react'
import { DateTime } from 'luxon'
import type { DailyStat } from '@/routes/stats/-lib/use-daily'
import { emptyDay } from '@/routes/stats/-lib/use-daily'

/** Range presets offered by the filter row. */
export const RANGE_LENGTHS = [7, 14, 30] as const
export type RangeLength = (typeof RANGE_LENGTHS)[number]

export function isRangeLength(value: unknown): value is RangeLength {
  return RANGE_LENGTHS.includes(value as RangeLength)
}

export type Range = {
  /** Exactly `length` days, oldest first, ending today. Gaps filled with zeroes. */
  days: Array<DailyStat>
  length: number
  /** Seconds of work, including time spent on Pomodoros that were abandoned. */
  work: number
  rest: number
  total: number
  /** Work Pomodoros begun. */
  started: number
  /** Work Pomodoros finished. */
  completed: number
  /** Begun but not finished. */
  abandoned: number
  /** Finished as a % of begun. Unlike a work/rest split, up is unambiguously better. */
  completionRate: number
  /** Days with at least one finished Pomodoro — the same bar the streak uses. */
  activeDays: number
  /** Work seconds averaged over active days only, so ranges of different lengths compare. */
  perActiveDay: number
  /** Same-length window immediately before this one, for like-for-like deltas. */
  prevWork: number
  workChange: number
  workChangePct: number
  prevCompleted: number
  completedChange: number
  bestDay: DailyStat | null
  hasData: boolean
}

/**
 * Aggregate a trailing window of `length` days ending today, plus the window
 * right before it so the UI can show a like-for-like delta.
 *
 * A trailing window is deliberately anchored to today rather than to the last
 * recorded session: a quiet week should read as a quiet week, not disappear.
 */
export function useRange(daily: Array<DailyStat>, length: number): Range {
  return useMemo<Range>(() => {
    const byIso = new Map(daily.map((day) => [day.date.toISODate(), day]))
    const today = DateTime.local().startOf('day')

    const window = (daysAgo: number) =>
      Array.from({ length }, (_, index) => {
        const date = today.minus({ days: daysAgo + length - 1 - index })
        return byIso.get(date.toISODate()) ?? emptyDay(date)
      })

    const days = window(0)

    let work = 0
    let rest = 0
    let started = 0
    let completed = 0
    let activeDays = 0
    let bestDay: DailyStat | null = null

    for (const day of days) {
      work += day.work
      rest += day.rest
      started += day.started
      completed += day.completed
      if (day.completed > 0) activeDays++

      const isBetter =
        bestDay === null ||
        day.completed > bestDay.completed ||
        (day.completed === bestDay.completed && day.work > bestDay.work)
      if (isBetter && day.recorded > 0) bestDay = day
    }

    const previous = window(length)
    const prevWork = previous.reduce((acc, day) => acc + day.work, 0)
    const prevCompleted = previous.reduce((acc, day) => acc + day.completed, 0)

    const total = work + rest
    const workChange = work - prevWork

    return {
      days,
      length,
      work,
      rest,
      total,
      started,
      completed,
      abandoned: started - completed,
      completionRate: started > 0 ? (completed / started) * 100 : 0,
      activeDays,
      perActiveDay: activeDays > 0 ? work / activeDays : 0,
      prevWork,
      workChange,
      workChangePct: prevWork > 0 ? (workChange / prevWork) * 100 : work > 0 ? 100 : 0,
      prevCompleted,
      completedChange: completed - prevCompleted,
      bestDay,
      hasData: total > 0,
    }
  }, [daily, length])
}
