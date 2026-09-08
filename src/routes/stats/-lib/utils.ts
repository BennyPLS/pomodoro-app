import type { DateTime } from 'luxon'
import { getLocale } from '@/lib/i18n'

export function formatUnit(value: number, unit: 'day' | 'hour' | 'minute' | 'second'): string {
  return new Intl.NumberFormat(getLocale(), { style: 'unit', unit, unitDisplay: 'short' }).format(value)
}

export function formatSeconds(sec: number): string {
  const days = Math.floor(sec / 86400)
  const hours = Math.floor((sec % 86400) / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  const seconds = Math.floor(sec % 60)

  if (days > 0)
    return [
      formatUnit(days, 'day'),
      formatUnit(hours, 'hour'),
      ...(minutes > 0 ? [formatUnit(minutes, 'minute')] : []),
    ].join(' ')
  if (hours > 0)
    return [formatUnit(hours, 'hour'), formatUnit(minutes, 'minute'), formatUnit(seconds, 'second')].join(' ')
  if (minutes > 0) return [formatUnit(minutes, 'minute'), formatUnit(seconds, 'second')].join(' ')
  return formatUnit(seconds, 'second')
}

/**
 * Shorter than {@link formatSeconds}: at most two units and no seconds once
 * there is at least a minute to show. Meant for stat tiles and table cells,
 * where "1 hr 4 min" reads better than "1 hr 4 min 37 sec".
 */
export function formatDurationShort(sec: number): string {
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec % 3600) / 60)

  if (hours > 0) return [formatUnit(hours, 'hour'), ...(minutes > 0 ? [formatUnit(minutes, 'minute')] : [])].join(' ')
  if (minutes > 0) return formatUnit(minutes, 'minute')
  return formatUnit(Math.floor(sec % 60), 'second')
}

export function formatMinutes(min: number): string {
  const days = Math.floor(min / 1440)
  const hours = Math.floor((min % 1440) / 60)
  const minutes = Math.floor(min % 60)

  if (days > 0)
    return [
      formatUnit(days, 'day'),
      formatUnit(hours, 'hour'),
      ...(minutes > 0 ? [formatUnit(minutes, 'minute')] : []),
    ].join(' ')
  if (hours > 0) return [formatUnit(hours, 'hour'), ...(minutes > 0 ? [formatUnit(minutes, 'minute')] : [])].join(' ')
  return formatUnit(minutes, 'minute')
}

/**
 * Steps that stay round once they are read as hours, since the data is in
 * minutes but the axis is labelled in hours.
 */
const MINUTE_STEPS = [5, 10, 15, 20, 30, 60, 90, 120, 180, 240, 300, 360, 480, 600, 720, 960, 1200, 1440]

/**
 * A y-axis in minutes whose labels are round in hours.
 *
 * Left to itself recharts picks ticks that are tidy minute counts and therefore
 * ragged hour counts — 0, 1.1, 2.2, 3.3 hr. This walks up to the first step
 * that covers the data in five intervals or fewer.
 */
export function minuteAxis(maxMinutes: number): { domain: [number, number]; ticks: Array<number> } {
  if (!(maxMinutes > 0)) return { domain: [0, 60], ticks: [0, 30, 60] }

  const step = MINUTE_STEPS.find((candidate) => Math.ceil(maxMinutes / candidate) <= 5) ?? MINUTE_STEPS.at(-1)!
  const top = Math.ceil(maxMinutes / step) * step

  return {
    domain: [0, top],
    ticks: Array.from({ length: top / step + 1 }, (_, index) => index * step),
  }
}

/** Y-axis ticks: one unit only, so the axis gutter stays narrow. */
export function formatAxisMinutes(min: number): string {
  if (min <= 0) return '0'
  if (min < 60) return formatUnit(Math.round(min), 'minute')
  return formatUnit(Math.round((min / 60) * 10) / 10, 'hour')
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat(getLocale(), { style: 'percent', maximumFractionDigits: 1 }).format(value / 100)
}

/** Signed percentage, for deltas against a previous period. */
export function formatPercentageDelta(value: number): string {
  return new Intl.NumberFormat(getLocale(), {
    style: 'percent',
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
  }).format(value / 100)
}

/** Signed whole number, for count deltas against a previous period. */
export function formatCountDelta(value: number): string {
  return new Intl.NumberFormat(getLocale(), { signDisplay: 'exceptZero' }).format(value)
}

/** Axis / table day label, e.g. "Jan 5". */
export function formatDayLabel(date: DateTime): string {
  return date.setLocale(getLocale()).toLocaleString({ month: 'short', day: 'numeric' })
}

/** Full day label for tooltips and screen readers, e.g. "Mon, Jan 5". */
export function formatDayLabelLong(date: DateTime): string {
  return date.setLocale(getLocale()).toLocaleString({ weekday: 'short', month: 'short', day: 'numeric' })
}
