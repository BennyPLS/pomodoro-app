'use client'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form } from '~/components/ui/form'
import SimpleFormTextInput from '~/components/form/simple-form-text-input'
import SubmitButton from '~/components/form/submit-button'
import SimpleFormField from '~/components/form/simple-form-field'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '~/components/ui/dialog'
import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import db from '~/lib/db'

const MP3_FILE = z.custom<File>((file) => {
    const isFile = file instanceof File
    if (!isFile) return false

    return file.type == 'audio/mpeg'
}, 'Requerido')

type NewMusicForm = z.infer<typeof NEW_MUSIC_FORM>
const NEW_MUSIC_FORM = z.object({
    title: z.string().min(1, 'Requerido').max(255, 'Demasiado Largo'),
    blob: MP3_FILE,
})

export function AddMusicDialog({ isLoading }: { isLoading: boolean }) {
    const [open, setOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<NewMusicForm>({
        resolver: zodResolver(NEW_MUSIC_FORM),
        defaultValues: {
            title: '',
        },
    })

    useEffect(() => {
        if (!open) {
            form.reset({ title: '' })
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }, [form, open])

    const onSubmit = async (data: NewMusicForm) => {
        try {
            // Get the highest order value
            const allMusic = await db.music.toArray()
            const highestOrder = allMusic.length > 0 ? Math.max(...allMusic.map((m) => m.order ?? 0)) : -1

            // Add the new music with the next order value
            const musicData = {
                ...data,
                order: highestOrder + 1,
            }
            const title = await db.music.add(musicData)

            toast.success(`Se ha subido la musica: ${title}`)
            form.reset()
            fileInputRef.current!.value = ''
            setOpen(false)
        } catch {
            form.setError('title', {
                type: 'duplicate',
                message: 'Titulo ya existe',
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2" disabled={isLoading}>
                    <Plus className="h-4 w-4" />
                    Añadir Musica
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold">Añadir Musica</DialogTitle>
                    <DialogDescription>Sube archivos MP3 para tu colección de música.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <SimpleFormTextInput control={form.control} name="title" label="Titulo" />
                        <SimpleFormField
                            control={form.control}
                            name="blob"
                            label="Archivo"
                            render={({ field }) => (
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="audio/mpeg"
                                    onChange={(event) => {
                                        field.onChange(event?.target?.files?.item(0))
                                    }}
                                />
                            )}
                        />
                        <DialogFooter>
                            <SubmitButton isLoading={form.formState.isSubmitting} />
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
