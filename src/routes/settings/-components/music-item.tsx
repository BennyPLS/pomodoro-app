import { ArrowDown, ArrowUp, Pause, Play, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Music } from '@/lib/db'
import { m } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { useAudioPlayer } from '@/hooks/use-audio-player'
import db from '@/lib/db'
import { useMusicPlayer } from '@/providers/music-provider'

interface MusicItemProps {
  music: Music
  isFirst: boolean
  isLast: boolean
  allMusic: Array<Music>
}

export function MusicItem({ music: { blob, title }, isFirst, isLast, allMusic }: MusicItemProps) {
  const volume = useMusicPlayer((store) => store.volume)
  const { controls, isPlaying } = useAudioPlayer(blob, volume)
  const [pending, setPending] = useState(false)
  const index = allMusic.findIndex((item) => item.title === title)

  const updateMusic = async (direction: -1 | 1 | 'remove') => {
    setPending(true)
    try {
      await db.transaction('rw', db.music, async () => {
        const items = await db.music.orderBy('order').toArray()
        const current = items.findIndex((item) => item.title === title)
        if (current < 0) return
        if (direction === 'remove') {
          await db.music.delete(title)
          items.splice(current, 1)
        } else {
          const next = current + direction
          if (next < 0 || next >= items.length) return
          ;[items[current], items[next]] = [items[next], items[current]]
        }
        await Promise.all(items.map((item, position) => db.music.update(item.title, { order: position + 1 })))
      })
    } catch {
      toast.error(m.music_update_error())
    } finally {
      setPending(false)
    }
  }

  return (
    <li
      className={`flex items-center gap-3 p-3 transition-colors sm:gap-4 sm:p-4 ${isPlaying ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
    >
      <span className="text-muted-foreground hidden w-5 shrink-0 text-center text-xs tabular-nums sm:block">
        {String(index + 1).padStart(2, '0')}
      </span>
      <Button
        size="icon"
        variant={isPlaying ? 'default' : 'secondary'}
        className="size-10 shrink-0 rounded-full"
        aria-label={`${isPlaying ? m.pause_music() : m.play_music()}: ${title}`}
        onClick={controls.toggle}
      >
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={title}>
          {title}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          {isPlaying ? m.music_preview() : 'MP3'} · {(blob.size / 1024 / 1024).toFixed(1)} MB
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <div className="flex flex-col sm:flex-row">
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label={`${m.move_up()}: ${title}`}
            onClick={() => void updateMusic(-1)}
            disabled={isFirst || pending}
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label={`${m.move_down()}: ${title}`}
            onClick={() => void updateMusic(1)}
            disabled={isLast || pending}
          >
            <ArrowDown className="size-4" />
          </Button>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="text-muted-foreground hover:text-destructive size-8"
          aria-label={m.music_remove({ title })}
          onClick={() => void updateMusic('remove')}
          disabled={pending}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  )
}
