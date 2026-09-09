import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { AppUpdate } from '@/components/app-update'
import { Button } from '@/components/ui/button'
import { getLocale, m, setLocale } from '@/lib/i18n'
import { isLocale } from '@/paraglide/runtime'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { AppearanceSettings } from '@/routes/settings/-components/appearance-settings'
import { MusicSettings } from '@/routes/settings/-components/music-settings'
import { ResetDataDialog } from '@/routes/settings/-components/reset-data-dialog'
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
        <AppUpdate settings />
        <section
          aria-labelledby="report-issue-heading"
          className="bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 sm:p-7"
        >
          <div>
            <h2 id="report-issue-heading" className="font-semibold">
              {m.report_issue()}
            </h2>
            <p className="text-muted-foreground text-sm">{m.report_issue_description()}</p>
          </div>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/BennyPLS/pomodoro-app/issues/new?template=bug_report.yml"
              target="_blank"
              rel="noopener noreferrer"
            >
              {m.report_issue()}
              <ExternalLink aria-hidden="true" />
            </a>
          </Button>
        </section>
        <section
          aria-labelledby="suggest-feature-heading"
          className="bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 sm:p-7"
        >
          <div>
            <h2 id="suggest-feature-heading" className="font-semibold">
              {m.suggest_feature()}
            </h2>
            <p className="text-muted-foreground text-sm">{m.suggest_feature_description()}</p>
          </div>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/BennyPLS/pomodoro-app/issues/new?template=feature_request.yml"
              target="_blank"
              rel="noopener noreferrer"
            >
              {m.suggest_feature()}
              <ExternalLink aria-hidden="true" />
            </a>
          </Button>
        </section>
        <ResetDataDialog />
      </main>
    </div>
  )
}
