import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { AchievementsSection } from './-components/achievements-section'
import { ActivitySection } from './-components/activity-section'
import { EmptyState } from './-components/empty-state'
import { StreakHero } from './-components/streak-hero'
import { TopBar } from './-components/top-bar'
import { useAchievements } from './-lib/use-achievements'
import { useDaily } from './-lib/use-daily'
import { useInsights } from './-lib/use-insights'
import { isRangeLength, useRange } from './-lib/use-range'
import { useTimeOfDay } from './-lib/use-time-of-day'
import { Spinner } from '@/components/ui/spinner'
import { useLocalStorageJson } from '@/hooks/use-local-storage'
import db from '@/lib/db'

export const Route = createFileRoute('/stats')({
  component: Page,
})

function Page() {
  const sessions = useLiveQuery(() => db.sessions.orderBy('startedAt').toArray())

  const [storedLength, setStoredLength] = useLocalStorageJson<number>('stats-range-days', 14)
  const length = isRangeLength(storedLength) ? storedLength : 14

  const daily = useDaily(sessions)
  const insights = useInsights(daily)
  const range = useRange(daily, length)
  const timeOfDay = useTimeOfDay(sessions, length)
  const achievements = useAchievements(sessions, insights.streak)

  const isLoading = sessions === undefined

  return (
    <div className="flex h-svh w-screen flex-col [view-transition-name:main-content]">
      <TopBar />
      <main className="min-h-0 grow overflow-y-auto">
        <div className="container mx-auto flex flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <StreakHero insights={insights} achievements={achievements} />
              <ActivitySection range={range} timeOfDay={timeOfDay} length={length} onLengthChange={setStoredLength} />
              <AchievementsSection achievements={achievements} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
