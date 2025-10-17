import { createFileRoute } from '@tanstack/react-router'
import { BottomBar } from '@/routes/-components/bottom-bar'
import { Timer } from '@/routes/-components/timer'
import { TopBar } from '@/routes/-components/top-bar'
import FirstTimeVisitScript from '@/scripts/first-time-visit'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="flex h-svh w-screen flex-col [view-transition-name:main-content]">
      <FirstTimeVisitScript />
      <TopBar />
      <main className="flex grow items-center justify-center gap-4 py-4">
        <Timer />
      </main>
      <BottomBar />
    </div>
  )
}
