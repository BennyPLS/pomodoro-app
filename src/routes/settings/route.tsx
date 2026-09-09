import { createFileRoute } from '@tanstack/react-router'
import { getLocale, m, setLocale } from '@/lib/i18n'
import { isLocale } from '@/paraglide/runtime'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { AppearanceSettings } from '@/routes/settings/-components/appearance-settings'
import { MusicSettings } from '@/routes/settings/-components/music-settings'
import { TopBar } from '@/routes/settings/-components/top-bar'

export const Route = createFileRoute('/settings')({ component: Page })

function Page() {
  return (
    <div className="min-h-svh [view-transition-name:main-content]">
      <TopBar />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
        <section
          className="bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 sm:p-7"
          aria-label={m.language()}
        >
          <Label htmlFor="language">{m.language()}</Label>
          <Select
            value={getLocale()}
            onValueChange={(locale) => {
              if (isLocale(locale)) void setLocale(locale)
            }}
          >
            <SelectTrigger id="language" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en" lang="en">
                English
              </SelectItem>
              <SelectItem value="es" lang="es">
                Español
              </SelectItem>
            </SelectContent>
          </Select>
        </section>
        <AppearanceSettings />
        <MusicSettings />
      </main>
    </div>
  )
}
