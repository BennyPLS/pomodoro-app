import { ArrowDown, ArrowUp, Pause, Play, Trash2, Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useMemo } from 'react'
import type { Music } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useAudioPlayer } from '@/hooks/use-audio-player'
import db from '@/lib/db'

interface MusicItemProps {
  music: Music
  isFirst: boolean
  isLast: boolean
  allMusic: Array<Music>
}

export function MusicItem({ music: { blob, title, order }, isFirst, isLast, allMusic }: MusicItemProps) {
  const { controls, duration, isMuted, volume, isPlaying, currentTime } = useAudioPlayer(blob)

  const VolumeStatus = useMemo(
    () => (isMuted ? VolumeX : volume < 0.3 ? Volume : volume < 0.6 ? Volume1 : Volume2),
    [volume, isMuted],
  )

  const PlayPauseIcon = useMemo(() => (isPlaying ? Pause : Play), [isPlaying])

  const moveUp = async () => {
    if (isFirst) return

    // Find the item above this one
    const itemAbove = allMusic.find((m) => m.order === order - 1)
    if (!itemAbove) return

    // Swap the orders
    await db.music.update(title, { order: order - 1 })
    await db.music.update(itemAbove.title, { order: order })
  }

  const moveDown = async () => {
    console.log('click')
    if (isLast) return

    // Find the item below this one
    const itemBelow = allMusic.find((m) => m.order === order + 1)
    if (!itemBelow) return

    // Swap the orders
    await db.music.update(title, { order: order + 1 })
    await db.music.update(itemBelow.title, { order: order })
  }

  return (
    <div className="bg-card flex flex-col gap-4 rounded border p-4">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="ml-auto flex gap-2">
          <Button size="icon" variant="outline" onClick={moveUp} disabled={isFirst}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={moveDown} disabled={isLast}>
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={async () => {
              // Delete the item
              await db.music.delete(title)

              // Update the order of items after this one
              const itemsAfter = allMusic.filter((m) => m.order > order)
              for (const item of itemsAfter) {
                await db.music.update(item.title, {
                  order: item.order - 1,
                })
              }
            }}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button size="icon" variant="outline" onClick={() => controls.toggle()}>
          <PlayPauseIcon />
        </Button>
        <Slider
          className="w-56 shrink-0"
          value={[currentTime]}
          max={duration}
          onValueChange={(value) => controls.seek(value[0])}
        />
      </div>
      <div className="flex items-center gap-4">
        <Button size="icon" variant="outline" onClick={() => controls.toggleMute()}>
          <VolumeStatus />
        </Button>
        <Slider
          className="w-56 shrink-0"
          value={[volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(value) => controls.setVolume(value[0])}
        />
      </div>
    </div>
  )
}
