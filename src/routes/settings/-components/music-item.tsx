import { ArrowDown, ArrowUp, Pause, Play } from 'lucide-react'
import { useMemo } from 'react'
import { motion, useAnimate } from 'motion/react'
import type { Music } from '@/lib/db'
import type { PanInfo } from 'motion'
import { Button } from '@/components/ui/button'
import { useAudioPlayer } from '@/hooks/use-audio-player'
import db from '@/lib/db'

interface MusicItemProps {
  music: Music
  isFirst: boolean
  isLast: boolean
  allMusic: Array<Music>
}

export function MusicItem({ music: { blob, title, order }, isFirst, isLast, allMusic }: MusicItemProps) {
  const { controls, isPlaying } = useAudioPlayer(blob)
  const [scope, animate] = useAnimate()

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

  const removeItem = async () => {
    await db.music.delete(title)

    // Update the order of items after this one
    const itemsAfter = allMusic.filter((m) => m.order > order)
    for (const item of itemsAfter) {
      await db.music.update(item.title, {
        order: item.order - 1,
      })
    }
  }

  const handleDragEnd = (_event: never, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (offset > 100 || velocity > 500) {
      // swipe right to delete
      animate(scope.current, { x: '100%' }, { duration: 0.2 })
      setTimeout(async () => await removeItem(), 200)
    } else {
      animate(scope.current, { x: 0, opacity: 1 }, { duration: 0.5 })
    }
  }

  return (
    <motion.div layout transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
      <motion.div
        className="bg-card flex items-center gap-3 rounded border p-3"
        drag="x"
        ref={scope}
        dragConstraints={{ top: 0, bottom: 0, left: 0 }}
        whileDrag={{ cursor: 'grabbing' }}
        onDragEnd={handleDragEnd}
      >
        <Button size="icon" variant="outline" onClick={() => controls.toggle()}>
          <PlayPauseIcon />
        </Button>

        <h2 className="truncate text-base font-semibold">{title}</h2>

        <div className="ml-auto flex gap-2">
          <Button size="icon" variant="outline" onClick={moveUp} disabled={isFirst}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={moveDown} disabled={isLast}>
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
