import { Link } from '@tanstack/react-router'
import { Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TopBar() {
  return (
    <nav className="bg-card/80 grid grid-cols-[1fr_1fr_1fr] gap-4 border-b p-4">
      <div className="flex justify-start gap-4"></div>

      <h1 className="flex items-center justify-center gap-4 text-2xl">Estadísticas</h1>

      <div className="flex justify-end gap-4">
        <Button size="icon">
          <Link to="/" viewTransition={{ types: ['slide-left'] }}>
            <Undo2 className="-scale-x-100" />
          </Link>
        </Button>
      </div>
    </nav>
  )
}
