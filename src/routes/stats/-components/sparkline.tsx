import { cn } from '@/lib/utils'

const WIDTH = 96
const HEIGHT = 26
const PAD = 3

/**
 * Trend line for a stat tile: the run in the de-emphasis hue with the current
 * period picked out in the accent.
 *
 * Decorative by design — every value it draws is also in the activity chart and
 * the table below, so it is hidden from assistive tech instead of narrated.
 */
export function Sparkline({ values, className }: { values: Array<number>; className?: string }) {
  if (values.length < 2) return null

  const max = Math.max(...values, 1)
  const step = (WIDTH - PAD * 2) / (values.length - 1)
  const points = values.map((value, index) => {
    const x = PAD + index * step
    const y = HEIGHT - PAD - (value / max) * (HEIGHT - PAD * 2)
    return [x, y] as const
  })

  const path = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const [lastX, lastY] = points[points.length - 1]

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      aria-hidden
      focusable="false"
      className={cn('text-muted-foreground/50 shrink-0 overflow-visible', className)}
    >
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2.5} className="fill-chart-1 stroke-card" strokeWidth={2} />
    </svg>
  )
}
