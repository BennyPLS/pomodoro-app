import { useMemo } from 'react'
import { DateTime } from 'luxon'
import type { Session } from '@/lib/db'
import { getLocale, useLocale } from '@/lib/i18n'

export type HourBucket = {
  hour: number
  /** Clock label for the axis, e.g. "9 AM" or "9". */
  label: string
  /** The span this bucket covers, e.g. "9 AM – 10 AM". */
  rangeLabel: string
  /** Minutes, so the axis can be read. */
  work: number
  workSec: number
}

export type TimeOfDay = {
  /** All 24 hours, always — an empty night is part of the shape of your day. */
  hours: Array<HourBucket>
  peak: HourBucket | null
  hasData: boolean
}

function hourLabel(hour: number): string {
  const at = new Date()
  at.setHours(hour, 0, 0, 0)
  return new Intl.DateTimeFormat(getLocale(), { hour: 'numeric' }).format(at)
}

/**
 * Focus time by hour of day over the trailing `length` days.
 *
 * This is the one question a daily time series cannot answer: *when* you are
 * able to concentrate. It reads raw sessions rather than the daily rollup,
 * because the rollup has already thrown the clock times away.
 */
export function useTimeOfDay(sessions: Array<Session> | null | undefined, length: number): TimeOfDay {
  // Hour labels are localized (12- vs 24-hour clock), so they follow the locale.
  const locale = useLocale()

  return useMemo<TimeOfDay>(() => {
    void locale

    const seconds = new Array<number>(24).fill(0)
    const from = DateTime.local()
      .startOf('day')
      .minus({ days: length - 1 })

    for (const session of sessions ?? []) {
      if (session.type !== 'work' || session.duration <= 0) continue

      let cursor = DateTime.fromJSDate(session.startedAt)
      if (cursor < from) continue

      // Attribute each minute to the hour it was actually spent in: a 25-minute
      // Pomodoro begun at 09:50 is ten minutes of the 9 o'clock hour and fifteen
      // of the 10th, not twenty-five of the 9th.
      const end = cursor.plus({ seconds: session.duration })
      while (cursor < end) {
        const boundary = cursor.plus({ hours: 1 }).startOf('hour')
        const sliceEnd = boundary < end ? boundary : end
        seconds[cursor.hour] += sliceEnd.diff(cursor, 'seconds').seconds
        cursor = sliceEnd
      }
    }

    const hours = seconds.map<HourBucket>((workSec, hour) => ({
      hour,
      label: hourLabel(hour),
      rangeLabel: `${hourLabel(hour)} – ${hourLabel((hour + 1) % 24)}`,
      work: workSec / 60,
      workSec,
    }))

    const peak = hours.reduce<HourBucket | null>(
      (best, bucket) => (bucket.workSec > 0 && (best === null || bucket.workSec > best.workSec) ? bucket : best),
      null,
    )

    return { hours, peak, hasData: peak !== null }
  }, [sessions, length, locale])
}
