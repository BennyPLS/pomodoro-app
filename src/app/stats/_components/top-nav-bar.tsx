import { Button } from '~/components/ui/button'
import { Undo2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function TopNavBar() {
    const router = useRouter()

    return (
        <nav className="bg-background grid grid-cols-3 gap-4 p-4">
            <div className="flex justify-start gap-4">
                <Button size="icon" onClick={() => router.back()}>
                    <Undo2 />
                </Button>
            </div>

            <h1 className="flex items-center justify-center gap-4 text-2xl">Estadísticas</h1>

            <div className="flex justify-end gap-4"></div>
        </nav>
    )
}
