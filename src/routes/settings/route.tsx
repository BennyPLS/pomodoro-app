import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useLocalStorageJson } from '@/hooks/use-local-storage'
import db from '@/lib/db'
import { AddMusicDialog } from '@/routes/settings/-components/add-music-dialog'
import { MusicItem } from '@/routes/settings/-components/music-item'
import { TopBar } from '@/routes/settings/-components/top-bar'

export const Route = createFileRoute('/settings')({
  component: Page,
})
function Page() {
  const [automaticReproduction, setAutomaticReproduction] = useLocalStorageJson('pomodoro-smart-music', true)
  const music = useLiveQuery(() => db.music.toArray().then((items) => items.sort((a, b) => a.order - b.order)))

  const isLoading = music === undefined

  return (
    <div className="flex h-svh flex-col gap-4 [view-transition-name:main-content]">
      <TopBar />
      <main className="relative mx-auto flex w-full max-w-xl flex-col gap-4 py-4">
        <div className="flex gap-4 px-4">
          <Label>Música inteligente Pomodoro</Label>
          <Switch checked={automaticReproduction} onCheckedChange={setAutomaticReproduction} />
        </div>
        <div className="flex flex-col gap-4 overflow-y-scroll">
          <div className="flex items-center justify-between gap-4 p-4">
            <h1 className="text-center text-xl font-bold">Tu Musica</h1>
            <AddMusicDialog isLoading={isLoading} />
          </div>
          <div className="relative flex flex-col gap-4 overflow-x-hidden overflow-y-scroll p-4 lg:max-h-194">
            <div
              aria-hidden
              className="to-background pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-4 bg-gradient-to-l from-transparent"
            />
            <div
              aria-hidden
              className="to-background pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-4 bg-gradient-to-r from-transparent"
            />
            {isLoading ? (
              <div className="flex justify-center">
                <Spinner />
              </div>
            ) : (
              music.map((item, index) => (
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
