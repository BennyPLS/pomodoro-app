import { createFileRoute } from '@tanstack/react-router'
import { BottomBar } from '@/routes/-components/bottom-bar.tsx'
import { Timer } from '@/routes/-components/timer.tsx'
import { TopBar } from '@/routes/-components/top-bar.tsx'
import FirstTimeVisitScript from '@/scripts/first-time-visit.tsx'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="flex h-svh w-screen flex-col">
      <FirstTimeVisitScript />
      <TopBar />
      <main className="flex grow items-center justify-center gap-4">
        <Timer />
      </main>
      <BottomBar />
    </div>
  )
}
