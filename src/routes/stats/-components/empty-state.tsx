import { Link } from '@tanstack/react-router'
import { Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { m } from '@/lib/i18n'

/** Shown until the first session is recorded, instead of a page full of zeroes. */
export function EmptyState() {
  return (
    <div className="bg-card mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border p-8 text-center shadow-sm">
      <span className="text-4xl" aria-hidden>
        🍅
      </span>
      <h2 className="text-lg font-semibold">{m.no_stats_yet()}</h2>
      <p className="text-muted-foreground text-sm">{m.no_stats_yet_hint()}</p>
      <Button className="mt-2" asChild>
        <Link to="/" viewTransition={{ types: ['slide-left'] }}>
          <Timer aria-hidden />
          {m.start_focusing()}
        </Link>
      </Button>
    </div>
  )
}
