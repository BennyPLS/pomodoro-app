import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

/**
 * A single ratio against a limit.
 *
 * Deliberately wears `--primary` rather than a `--chart-*` slot: those slots are
 * series identity (work / break) and reusing one here would tie "progress" to
 * whichever series happens to own that hue. The unfilled track is a lighter step
 * of the same ramp, so the state reads across the whole bar instead of only
 * where the fill stops.
 */
export function Meter({
  value,
  label,
  valueText,
  className,
}: {
  value: number
  /** Accessible name — a meter is often the only unlabelled element in a row. */
  label: string
  /** Spoken in place of the raw percentage, e.g. "4 hr 12 min of 10 hr". */
  valueText?: string
  className?: string
}) {
  return (
    <Progress
      value={Math.max(0, Math.min(100, value))}
      aria-label={label}
      getValueLabel={valueText ? () => valueText : undefined}
      className={cn('h-2', className)}
    />
  )
}
