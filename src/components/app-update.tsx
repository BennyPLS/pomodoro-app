import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { m, useLocale } from '@/lib/i18n'
import { useAppUpdate } from '@/providers/app-update-provider'
import useTimer from '@/providers/timer-provider'

export function AppUpdate({ settings = false }: { settings?: boolean }) {
  useLocale()
  const { available, supported, status, updating, check, update } = useAppUpdate()
  const isRunning = useTimer((state) => state.isRunning)
  if (!settings && !available) return null

  return (
    <section
      aria-label={m.app_updates()}
      className={
        settings
          ? 'bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 sm:p-7'
          : 'bg-card fixed inset-x-4 top-4 z-50 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 shadow-lg'
      }
    >
      <div className="min-w-0 flex-1" role="status">
        <h2 className="font-semibold">{available ? m.update_available() : m.app_updates()}</h2>
        <p className="text-muted-foreground text-sm">
          {status === 'error'
            ? m.update_error()
            : available
              ? isRunning
                ? m.update_pause_timer()
                : m.update_reload_hint()
              : !supported
                ? m.update_unavailable()
                : status === 'checking'
                  ? m.update_checking()
                  : status === 'current'
                    ? m.update_current()
                    : m.update_auto_hint()}
        </p>
      </div>
      <Button
        variant={available ? 'default' : 'outline'}
        disabled={!supported || updating || (available ? isRunning : status === 'checking')}
        onClick={() => void (available ? update() : check())}
      >
        <RefreshCw className={status === 'checking' || updating ? 'animate-spin' : undefined} />
        {updating ? m.update_installing() : available ? m.update_now() : m.check_updates()}
      </Button>
    </section>
  )
}
