'use client'
import { z } from 'zod'
import db, { type Music } from '~/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowDown, ArrowUp, Pause, Play, Trash2, Undo2, Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Slider } from '~/components/ui/slider'
import { useAudioPlayer } from '~/hooks/use-audio-player'
import { useMemo } from 'react'
import { Spinner } from '~/components/ui/spinner'
import { AddMusicDialog } from '~/app/settings/add-music-dialog'

const MP3_FILE = z.custom<File>((file) => {
    const isFile = file instanceof File
    if (!isFile) return false

    return file.type == 'audio/mpeg'
})

type NewMusicForm = z.infer<typeof NEW_MUSIC_FORM>
const NEW_MUSIC_FORM = z.object({
    title: z.string().min(1).max(255),
    blob: MP3_FILE,
})

function TopNavBar() {
    return (
        <nav className="bg-background grid w-screen grid-cols-3 gap-4 p-4">
            <div className="flex justify-start gap-4">
                <Button size="icon" onClick={() => window.history.back()}>
                    <Undo2 />
                </Button>
            </div>

            <h1 className="flex items-center justify-center gap-4 text-xl">Configuración</h1>

            <div className="flex justify-end gap-4"></div>
        </nav>
    )
}

export default function MusicSettingsPage() {
    const music = useLiveQuery(() => {
        // First, ensure all music items have an order value
        return db.music.toArray().then((items) => {
            // Check if any items don't have an order
            const hasUndefinedOrder = items.some((item) => item.order === undefined)

            if (hasUndefinedOrder) {
                // If there are items without order, assign them one
                const itemsWithOrder = items.map((item) => ({
                    ...item,
                    order: item.order ?? 0,
                }))

                // Sort manually by order
                return itemsWithOrder.sort((a, b) => a.order - b.order)
            } else {
                // If all items have an order, use the index
                return db.music.orderBy('order').toArray()
            }
        })
    })

    const isLoading = useMemo(() => music === undefined, [music])

    return (
        <div className="flex h-svh flex-col gap-4">
            <TopNavBar />
            <main className="flex flex-col items-center justify-center gap-4">
                <AddMusicDialog />
                {isLoading ? (
                    <div className="flex">
                        <Spinner />
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 overflow-y-scroll">
                        <h1 className="text-center text-2xl font-bold">Tu Musica</h1>
                        <div className="flex flex-col gap-4 overflow-y-scroll p-2 lg:max-h-194">
                            {music?.map((item, index) => (
                                <MusicItem
                                    music={item}
                                    key={item.title}
                                    isFirst={index === 0}
                                    isLast={index === music.length - 1}
                                    allMusic={music}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

interface MusicItemProps {
    music: Music
    isFirst: boolean
    isLast: boolean
    allMusic: Music[]
}

function MusicItem({ music: { blob, title, order }, isFirst, isLast, allMusic }: MusicItemProps) {
    const { controls, duration, isMuted, volume, isPlaying, currentTime } = useAudioPlayer(blob)

    const VolumeStatus = useMemo(
        () => (isMuted ? VolumeX : volume < 0.3 ? Volume : volume < 0.6 ? Volume1 : Volume2),
        [volume, isMuted]
    )

    const PlayPauseIcon = useMemo(() => (isPlaying ? Pause : Play), [isPlaying])

    const moveUp = async () => {
        if (isFirst || order === undefined) return

        // Find the item above this one
        const itemAbove = allMusic.find((m) => m.order !== undefined && m.order === order - 1)
        if (!itemAbove) return

        // Swap the orders
        await db.music.update(title, { order: order - 1 })
        await db.music.update(itemAbove.title, { order: order })
    }

    const moveDown = async () => {
        if (isLast || order === undefined) return

        // Find the item below this one
        const itemBelow = allMusic.find((m) => m.order !== undefined && m.order === order + 1)
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
                            // Get the order of the item to be deleted
                            const itemOrder = order

                            // Delete the item
                            await db.music.delete(title)

                            // Update the order of items after this one
                            if (itemOrder !== undefined) {
                                const itemsAfter = allMusic.filter((m) => m.order !== undefined && m.order > itemOrder)
                                for (const item of itemsAfter) {
                                    await db.music.update(item.title, { order: (item.order ?? 0) - 1 })
                                }
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
                    onValueChange={(value) => controls.seek(value[0]!)}
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
                    onValueChange={(value) => controls.setVolume(value[0]!)}
                />
            </div>
        </div>
    )
}
