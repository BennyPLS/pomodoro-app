'use client'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form } from '~/components/ui/form'
import SimpleFormTextInput from '~/components/form/simple-form-text-input'
import SubmitButton from '~/components/form/submit-button'
import SimpleFormField from '~/components/form/simple-form-field'
import { Input } from '~/components/ui/input'
import db, { type Music } from '~/lib/db'
import { toast } from 'sonner'
import { useLiveQuery } from 'dexie-react-hooks'
import { Pause, Play, Trash2, Undo2, Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Slider } from '~/components/ui/slider'
import { useAudioPlayer } from '~/hooks/use-audio-player'
import { useMemo, useRef } from 'react'
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

            <h1 className="flex items-center text-xl  justify-center gap-4">Configuración</h1>

            <div className="flex justify-end gap-4"></div>
        </nav>
    )
}

export default function MusicSettingsPage() {
    const music = useLiveQuery(() => db.music.toArray())
    const isLoading = useMemo(() => music === undefined, [music])

    return (
        <div className="flex h-svh flex-col gap-4">
            <TopNavBar />
            <main className="flex flex-col items-center justify-center gap-4">
                <AddMusicDialog/>
                {isLoading ? (
                    <div className="flex">
                        <Spinner />
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 overflow-y-scroll">
                        <h1 className="text-center text-2xl font-bold">Tu Musica</h1>
                        <div className="flex flex-col gap-4 overflow-y-scroll pr-4 lg:max-h-194">
                            {music?.map((music) => <MusicItem music={music} key={music.title} />)}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

function MusicItem({ music: { blob, title } }: { music: Music }) {
    const { controls, duration, isMuted, volume, isPlaying, currentTime } = useAudioPlayer(blob)

    const VolumeStatus = useMemo(
        () => (isMuted ? VolumeX : volume < 0.3 ? Volume : volume < 0.6 ? Volume1 : Volume2),
        [volume, isMuted]
    )

    const PlayPauseIcon = useMemo(() => (isPlaying ? Pause : Play), [isPlaying])

    return (
        <div className="bg-card flex flex-col gap-4 rounded border p-4">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <Button className="ml-auto" size="icon" variant="destructive" onClick={() => db.music.delete(title)}>
                    <Trash2 />
                </Button>
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
