import { getLocale } from '@/lib/i18n'

function formatUnit(value: number, unit: 'day' | 'hour' | 'minute' | 'second'): string {
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

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat(getLocale(), { style: 'percent', maximumFractionDigits: 1 }).format(value / 100)
}
