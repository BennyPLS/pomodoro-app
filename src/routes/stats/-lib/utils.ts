import { Duration } from 'luxon'

export function formatSeconds(sec: number): string {
  const dur = Duration.fromObject({ seconds: sec }).shiftTo('days', 'hours', 'minutes', 'seconds').toObject()

  const d = Math.floor(dur.days ?? 0)
  const h = Math.floor(dur.hours ?? 0)
  const m = Math.floor(dur.minutes ?? 0)
  const s = Math.floor(dur.seconds ?? 0)

  if (d > 0) return `${d}d ${h}h ${m > 0 ? `${m}m` : ''}`
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function formatMinutes(min: number): string {
  const dur = Duration.fromObject({ minutes: min }).shiftTo('days', 'hours', 'minutes').toObject()

  const d = Math.floor(dur.days ?? 0)
  const h = Math.floor(dur.hours ?? 0)
  const m = Math.floor(dur.minutes ?? 0)

  if (d > 0) return `${d}d ${h}h ${m > 0 ? `${m}m` : ''}`
  if (h > 0) return `${h}h ${m > 0 ? `${m}m` : ''}`
  if (m > 0) return `${m}m`
  return `0m`
}

export function formatPercentage(value: number): string {
  // Round to 1 decimal place for readability
  const rounded = Math.round(value * 10) / 10

  // Remove unnecessary decimal if it's a whole number
  const formatted = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1)

  return `${formatted} %`
}
