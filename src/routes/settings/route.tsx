import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { Music2 } from 'lucide-react'
import { AppUpdate } from '@/components/app-update'
import { getLocale, m, setLocale } from '@/lib/i18n'
import { isLocale } from '@/paraglide/runtime'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useLocalStorageJson } from '@/hooks/use-local-storage'
import db from '@/lib/db'
import { AddMusicDialog } from '@/routes/settings/-components/add-music-dialog'
import { AppearanceSettings } from '@/routes/settings/-components/appearance-settings'
import { MusicItem } from '@/routes/settings/-components/music-item'
import { TopBar } from '@/routes/settings/-components/top-bar'

export const Route = createFileRoute('/settings')({ component: Page })

function Page() {
  const [automaticReproduction, setAutomaticReproduction] = useLocalStorageJson('pomodoro-smart-music', true)
  const music = useLiveQuery(() => db.music.toArray().then((items) => items.sort((a, b) => a.order - b.order)))
  const isLoading = music === undefined

  return (
    <div className="min-h-svh [view-transition-name:main-content]">
      <TopBar />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
        <section
          className="bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 sm:p-7"
          aria-label={m.language()}
        >
          <Label htmlFor="language">{m.language()}</Label>
          <Select
            value={getLocale()}
            onValueChange={(locale) => {
              if (isLocale(locale)) void setLocale(locale)
            }}
          >
            <SelectTrigger id="language" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en" lang="en">
                English
              </SelectItem>
              <SelectItem value="es" lang="es">
                Español
              </SelectItem>
            </SelectContent>
          </Select>
        </section>
        <AppearanceSettings />
        <AppUpdate settings />
        <section aria-labelledby="music-heading" className="bg-card overflow-hidden rounded-2xl border p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-xl p-2.5">
              <Music2 className="size-5" />
            </div>
            <div>
              <h2 id="music-heading" className="text-xl font-semibold">
                {m.music()}
              </h2>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 border-b pb-6">
            <div>
              <Label htmlFor="smart-music">{m.smart_music()}</Label>
            </div>
            <Switch id="smart-music" checked={automaticReproduction} onCheckedChange={setAutomaticReproduction} />
          </div>
          <div className="flex items-center justify-between gap-4 py-5">
            <h3 className="text-sm font-medium">{m.your_music()}</h3>
            <AddMusicDialog isLoading={isLoading} />
          </div>
          <div className="flex flex-col gap-3 overflow-x-hidden">
            {isLoading ? (
              <div className="flex justify-center py-6" role="status" aria-label={m.loading_music()}>
                <Spinner />
              </div>
            ) : music.length === 0 ? (
              <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
                {m.no_music_hint()}
              </p>
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
        </section>
      </main>
    </div>
  )
}
