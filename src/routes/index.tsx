import { createFileRoute } from '@tanstack/react-router'
import { HomeLayout } from '@/routes/-components/home-layout'
import { BottomBar } from '@/routes/-components/bottom-bar'
import { Timer } from '@/routes/-components/timer'
import { TopBar } from '@/routes/-components/top-bar'
import FirstTimeVisitScript from '@/scripts/first-time-visit'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <>
      <FirstTimeVisitScript />
      <HomeLayout
        className="h-svh w-screen [view-transition-name:main-content]"
        topBar={<TopBar />}
        timer={<Timer />}
        bottomBar={<BottomBar />}
      />
    </>
  )
}
