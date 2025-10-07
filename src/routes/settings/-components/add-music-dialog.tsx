import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Form } from '@/components/form/form.tsx'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAppForm } from '@/hooks/form.ts'
import db from '@/lib/db'

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

  const form = useAppForm({
    defaultValues: {
      title: '',
    } as NewMusicForm,
    validators: {
      onChange: NEW_MUSIC_FORM,
    },
    onSubmit: async ({ value }) => {
      const last = await db.music.orderBy('order').last()

      const next = last ? last.order + 1 : 1

      // Add the new music with the next order value
      const musicData = {
        ...value,
        order: next,
      }

      const title = await db.music.add(musicData)
      toast.success(`Se ha guardado la musica: ${title}`)

      form.reset()
      fileInputRef.current!.value = ''
      setOpen(false)
    },
  })

  useEffect(() => {
    if (!open) {
      form.reset()
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [form, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={isLoading}>
          <Plus className="h-4 w-4" />
          Añadir Musica
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Añadir Musica</DialogTitle>
          <DialogDescription>Sube archivos MP3 para tu colección de música.</DialogDescription>
        </DialogHeader>

        <Form form={form}>
          <form.AppField
            validators={{
              onBlurAsync: async ({ value }) => {
                const music = await db.music.get(value)
                return music ? 'Titulo ya existe' : null
              },
            }}
            name="title"
          >
            {(field) => <field.Input label="Titulo" />}
          </form.AppField>

          <form.AppField name="blob">{(field) => <field.FileInput label="Archivo" ref={fileInputRef} />}</form.AppField>

          <DialogFooter>
            <form.SubmitButton label="Add Music" />
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
