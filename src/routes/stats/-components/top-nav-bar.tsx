import { useRouter } from '@tanstack/react-router'
import { Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ThemeSelector from '@/components/theme-selector'

export function TopNavBar() {
  const router = useRouter()

  return (
    <nav className="bg-card/80 grid grid-cols-3 gap-4 rounded-xl border p-4">
      <div className="flex justify-start gap-4">
        <Button size="icon" onClick={() => router.history.back()}>
          <Undo2 />
        </Button>
      </div>

      <h1 className="flex items-center justify-center gap-4 text-2xl">Estadísticas</h1>

      <div className="flex justify-end gap-4">
        <ThemeSelector />
      </div>
    </nav>
  )
}
