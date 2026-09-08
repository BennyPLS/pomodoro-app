import { Link } from '@tanstack/react-router'
import { Undo2 } from 'lucide-react'
import { m } from '@/lib/i18n'
import { Button } from '@/components/ui/button'

export function TopBar() {
  return (
    <nav className="bg-card/80 supports-[backdrop-filter]:bg-card/60 sticky top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b p-4 backdrop-blur">
      <div />

      <h1 className="text-center text-2xl">{m.stats()}</h1>

      <div className="flex justify-end">
        {/* asChild — the other top bars do the same; without it this renders an <a> inside a <button>. */}
        <Button size="icon" asChild>
          <Link aria-label={m.back()} to="/" viewTransition={{ types: ['slide-left'] }}>
            <Undo2 className="-scale-x-100" />
          </Link>
        </Button>
      </div>
    </nav>
  )
}
