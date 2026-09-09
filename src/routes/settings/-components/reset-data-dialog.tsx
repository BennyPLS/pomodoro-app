import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { m, useLocale } from '@/lib/i18n'
import { resetLocalData } from '@/lib/reset-local-data'
import useTimer from '@/providers/timer-provider'

export function ResetDataDialog() {
  useLocale()
  const [open, setOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [failed, setFailed] = useState(false)
  const discard = useTimer((state) => state.discard)

  const reset = async () => {
    setFailed(false)
    setResetting(true)
    try {
      discard()
      await resetLocalData()
      window.location.reload()
    } catch {
      setFailed(true)
      setResetting(false)
      setOpen(false)
    }
  }

  return (
    <section
      aria-labelledby="reset-data-heading"
      className="bg-card border-destructive/40 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 sm:p-7"
    >
      <div>
        <h2 id="reset-data-heading" className="font-semibold">
          {m.reset_data()}
        </h2>
        <p className="text-muted-foreground text-sm">{m.reset_data_description()}</p>
        {failed && (
          <p role="alert" className="text-destructive mt-2 text-sm">
            {m.reset_data_error()}
          </p>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline-destructive">
            <Trash2 aria-hidden="true" />
            {m.reset_data()}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{m.reset_data_confirm_title()}</DialogTitle>
            <DialogDescription>{m.reset_data_confirm_description()}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={resetting}>
                {m.cancel()}
              </Button>
            </DialogClose>
            <Button variant="destructive" disabled={resetting} onClick={() => void reset()}>
              <Trash2 aria-hidden="true" />
              {resetting ? m.reset_data_working() : m.reset_data_confirm()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
