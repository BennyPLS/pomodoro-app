import type { useAchievements } from '@/routes/stats/-lib/use-achievements'
import type { Insights } from '@/routes/stats/-lib/use-insights'
import { Meter } from '@/routes/stats/-components/meter'
import { formatDurationShort, formatUnit } from '@/routes/stats/-lib/utils'
import { m } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * The one hero figure on the page: the current streak, with the next streak
 * milestone as its meter and the all-time totals as supporting stats.
 */
export function StreakHero({
  insights,
  achievements,
}: {
  insights: Insights
  achievements: ReturnType<typeof useAchievements>
}) {
  const next = achievements.nextStreak

  const streakProgress = next
    ? m.streak_progress({ current: insights.streak, target: next.thresholdDays, title: next.title })
    : m.all_streaks_unlocked()

  const totals: Array<{ label: string; value: string }> = [
    { label: m.total_focus_time(), value: formatDurationShort(achievements.totals.totalWorkSec) },
    { label: m.completed_pomodoros(), value: achievements.totals.completedPomodoros.toLocaleString() },
    { label: m.active_days(), value: insights.activeDays.toLocaleString() },
    { label: m.best_streak(), value: formatUnit(insights.bestStreak, 'day') },
  ]

  return (
    <section className="bg-card rounded-xl border p-4 shadow-sm sm:p-5">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-8">
        <div className="flex flex-col gap-3">
          <h2 className="text-muted-foreground text-sm">{m.current_streak()}</h2>

          <div className="flex items-center gap-3">
            <span className={cn('text-4xl leading-none', insights.streak === 0 && 'opacity-40 grayscale')} aria-hidden>
              🔥
            </span>
            <div className="flex items-baseline gap-2">
              {/* Proportional figures: tabular-nums makes a number this large look loose. */}
              <span className="text-5xl leading-none font-semibold">{insights.streak}</span>
              <span className="text-muted-foreground text-sm">{m.day_streak()}</span>
            </div>
          </div>

          {insights.streakAtRisk ? (
            <p className="bg-muted text-muted-foreground w-fit rounded-md px-2 py-1 text-xs">{m.streak_at_risk()}</p>
          ) : null}

          {next ? (
            <div className="mt-1 flex flex-col gap-1.5">
              <Meter
                value={next.progressPct}
                label={m.streak()}
                valueText={m.progress_of({ current: insights.streak, target: next.thresholdDays })}
              />
              <p className="text-muted-foreground text-xs">{streakProgress}</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">{streakProgress}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-muted-foreground text-xs tracking-wide uppercase">{m.all_time()}</h3>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {totals.map((total) => (
              <div key={total.label} className="bg-muted/30 rounded-lg border p-3">
                <dt className="text-muted-foreground text-xs">{total.label}</dt>
                <dd className="mt-1 text-lg leading-tight font-semibold">{total.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
