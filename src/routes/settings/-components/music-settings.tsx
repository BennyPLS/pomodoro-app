import { useLiveQuery } from 'dexie-react-hooks'
import { useRef } from 'react'
import { Headphones, ListMusic, Music2, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { AddMusicDialog } from './add-music-dialog'
import { MusicItem } from './music-item'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useMusicPlayer } from '@/providers/music-provider'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { useLocalStorageJson } from '@/hooks/use-local-storage'
import db from '@/lib/db'
import { m } from '@/lib/i18n'

export function MusicSettings() {
  const [automaticReproduction, setAutomaticReproduction] = useLocalStorageJson('pomodoro-smart-music', true)
  const music = useLiveQuery(() => db.music.orderBy('order').toArray())

  return (
    <section aria-labelledby="music-heading" className="bg-card overflow-hidden rounded-2xl border">
      <div className="flex items-start gap-3 p-5 sm:p-7">
        <div className="bg-primary/10 text-primary rounded-xl p-2.5">
          <Headphones className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h2 id="music-heading" className="text-xl font-semibold">
            {m.music_heading()}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">{m.music_description()}</p>
        </div>
      </div>

      <div className="bg-muted/30 mx-5 mb-6 flex items-center gap-3 rounded-xl border p-4 sm:mx-7">
        <Sparkles className="text-primary hidden size-5 shrink-0 sm:block" aria-hidden="true" />
        <div className="flex-1">
          <Label htmlFor="smart-music" className="text-sm font-medium">
            {m.smart_music()}
          </Label>
          <p id="smart-music-description" className="text-muted-foreground mt-1 text-sm leading-relaxed">
            {m.smart_music_description()}
          </p>
        </div>
        <Switch
          id="smart-music"
          aria-describedby="smart-music-description"
          checked={automaticReproduction}
          onCheckedChange={setAutomaticReproduction}
        />
      </div>

      <MusicVolume />

      <div className="border-t p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ListMusic className="text-muted-foreground size-4" aria-hidden="true" />
              <h3 className="text-sm font-semibold">{m.your_music()}</h3>
              {music && (
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs tabular-nums">
                  {music.length}
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1.5 text-xs">{m.music_library_description()}</p>
          </div>
          {music && music.length > 0 && <AddMusicDialog isLoading={false} />}
        </div>
        {music === undefined ? (
          <div className="flex justify-center py-12" role="status" aria-label={m.music_loading()}>
            <Spinner />
          </div>
        ) : music.length === 0 ? (
          <div className="bg-muted/20 flex flex-col items-center rounded-xl border border-dashed px-5 py-10 text-center">
            <div className="bg-background text-primary mb-4 rounded-2xl border p-4">
              <Music2 className="size-6" aria-hidden="true" />
            </div>
            <h4 className="font-medium">{m.music_empty_title()}</h4>
            <p className="text-muted-foreground mt-2 mb-5 max-w-xs text-sm leading-relaxed">
              {m.music_empty_description()}
            </p>
            <AddMusicDialog isLoading={false} />
          </div>
        ) : (
          <ol className="divide-y overflow-hidden rounded-xl border">
            {music.map((item, index) => (
              <MusicItem
                key={item.title}
                music={item}
                isFirst={index === 0}
                isLast={index === music.length - 1}
                allMusic={music}
              />
            ))}
          </ol>
        )}
        <p className="text-muted-foreground mt-4 text-xs leading-relaxed">{m.music_local_note()}</p>
      </div>
    </section>
  )
}

function MusicVolume() {
  const [volume, setVolume] = useMusicPlayer((store) => [store.volume, store.setVolume])
  const previousVolume = useRef(1)

  return (
    <div className="mx-5 mb-6 flex flex-wrap items-center justify-between gap-3 sm:mx-7">
      <span id="music-volume-label" className="text-sm font-medium">
        {m.volume()}
      </span>
      <div className="flex w-full items-center gap-3 sm:w-72">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label={volume === 0 ? m.unmute() : m.mute()}
          onClick={() => {
            if (volume === 0) {
              setVolume(previousVolume.current)
            } else {
              previousVolume.current = volume
              setVolume(0)
            }
          }}
        >
          {volume === 0 ? <VolumeX /> : <Volume2 />}
        </Button>
        <Slider
          aria-labelledby="music-volume-label"
          value={[volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={([value]) => setVolume(value)}
        />
        <span className="text-muted-foreground w-10 shrink-0 text-right text-xs tabular-nums">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  )
}
