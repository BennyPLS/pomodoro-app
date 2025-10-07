import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import db from '@/lib/db'
import { Spinner } from '@/components/ui/spinner'
import { AddMusicDialog } from '@/routes/settings/-components/add-music-dialog'
import { TopNavBar } from '@/routes/settings/-components/top-nav-bar'
import { MusicItem } from '@/routes/settings/-components/music-item'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useLocalStorage } from '@/hooks/use-local-storage'

export const Route = createFileRoute('/settings/')({
  component: Page,
})
function Page() {
  const [automaticReproduction, setAutomaticReproduction] = useLocalStorage('pomodoro-smart-music', true)
  const music = useLiveQuery(() => db.music.toArray().then((items) => items.sort((a, b) => a.order - b.order)))

  const isLoading = useMemo(() => music === undefined, [music])

  return (
    <div className="flex h-svh flex-col gap-4">
      <TopNavBar />
      <main className="flex flex-col items-center justify-center gap-4">
        <div className="flex gap-4">
          <Label>Música inteligente Pomodoro</Label>
          <Switch checked={automaticReproduction} onCheckedChange={setAutomaticReproduction} />
        </div>
        <div className="flex flex-col gap-4 overflow-y-scroll">
          <div className="flex items-center justify-between gap-4 p-2">
            <h1 className="text-center text-xl font-bold">Tu Musica</h1>
            <AddMusicDialog isLoading={isLoading} />
          </div>
          <div className="flex flex-col gap-4 overflow-y-scroll p-2 lg:max-h-194">
            {isLoading ? (
              <div className="flex justify-center">
                <Spinner />
              </div>
            ) : (
              music?.map((item, index) => (
                <MusicItem
                  music={item}
                  key={item.title}
                  isFirst={index === 0}
                  isLast={index === music.length - 1}
                  allMusic={music}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
