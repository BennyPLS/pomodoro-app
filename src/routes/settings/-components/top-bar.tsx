import { Link } from '@tanstack/react-router'
import { Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ThemeSelector from '@/components/theme-selector'

export function TopBar() {
  return (
    <nav className="bg-card/80 grid grid-cols-[1fr_1fr_1fr] gap-4 border-b p-4">
      <div className="flex justify-start gap-4">
        <Button size="icon" asChild>
          <Link to="/" viewTransition={{ types: ['slide-right'] }}>
            <Undo2 />
          </Link>
        </Button>
      </div>

      <h1 className="flex items-center justify-center gap-4 text-2xl">Configuración</h1>

      <div className="flex justify-end gap-4">
        <ThemeSelector />
      </div>
    </nav>
  )
}
