import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { Sparkline } from '@/routes/stats/-components/sparkline'
import { cn } from '@/lib/utils'

export type Delta = {
  /** Already-formatted, signed text, e.g. "+42 min". */
  text: string
  direction: 'up' | 'down' | 'flat'
  /** What the change is measured against, e.g. "vs previous 14 days". */
  caption?: ReactNode
}

const DELTA_ICONS = { up: TrendingUp, down: TrendingDown, flat: Minus } as const

/**
 * label · value · optional delta · optional sparkline.
 *
 * The delta stays in text tokens and leans on its arrow and sign for direction:
 * this theme has no reserved status ramp, and borrowing a categorical series
 * colour here would tie "went up" to whichever series wears that hue.
 */
export function StatTile({
  label,
  value,
  hint,
  delta,
  trend,
  className,
}: {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  delta?: Delta
  trend?: Array<number>
  className?: string
}) {
  const DeltaIcon = delta ? DELTA_ICONS[delta.direction] : null

  return (
    <div className={cn('bg-muted/30 flex flex-col gap-1 rounded-lg border p-3', className)}>
      <div className="text-muted-foreground text-xs">{label}</div>

      <div className="flex items-end justify-between gap-3">
        <div className="text-lg leading-tight font-semibold sm:text-xl">{value}</div>
        {/* Decorative, and the first thing to go when the column is phone-narrow. */}
        {trend ? <Sparkline values={trend} className="mb-0.5 hidden sm:block" /> : null}
      </div>

      {delta && DeltaIcon ? (
        <div
          className={cn(
            'mt-0.5 flex flex-wrap items-center gap-x-1 text-xs',
            delta.direction === 'up' ? 'text-foreground font-medium' : 'text-muted-foreground',
          )}
        >
          <DeltaIcon className="size-3.5 shrink-0" aria-hidden />
          <span className="tabular-nums">{delta.text}</span>
          {/* Hidden on phones, where it wrapped to a third line; the section
              heading already says which range is in view. */}
          {delta.caption ? (
            <span className="text-muted-foreground hidden font-normal sm:inline">{delta.caption}</span>
          ) : null}
        </div>
      ) : null}

      {hint ? <div className="text-muted-foreground truncate text-xs">{hint}</div> : null}
    </div>
  )
}
