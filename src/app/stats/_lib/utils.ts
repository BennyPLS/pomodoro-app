export function toDateKey(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

export function fromDateKey(key: string): Date {
    const [y, m, d] = key.split('-').map(Number)
    return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

export function formatSeconds(sec: number): string {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = Math.floor(sec % 60)
    const d = Math.floor(h / 24)

    if (d > 0) return `${d}d ${h}h ${m > 0 ? `${m}m` : ''}`
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
}

export function formatMinutes(min: number): string {
    const h = Math.floor(min / 60)
    const m = Math.floor(min % 60)
    const d = Math.floor(h / 24)

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
