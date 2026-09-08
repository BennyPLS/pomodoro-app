import { Check, Lock } from 'lucide-react'
import type { useAchievements } from '@/routes/stats/-lib/use-achievements'
import { Meter } from '@/routes/stats/-components/meter'
import { formatDurationShort } from '@/routes/stats/-lib/utils'
import { m } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/** Flattened milestone, so focus / Pomodoro / streak groups render identically. */
type Badge = {
  id: string
  emoji?: string
  title: string
  earned: boolean
  progressPct: number
  /** "4 hr 12 min of 10 hr" — shown on the next-up meter and as chip hint text. */
  progress: string
  remaining: string
}

/**
 * Fourteen full-width progress bars was the old shape of this page, and it
 * buried the only two rows that matter. Now: a meter per group for the next
 * milestone, and a compact chip per milestone for the rest.
 */
export function AchievementsSection({ achievements }: { achievements: ReturnType<typeof useAchievements> }) {
  const { totals } = achievements

  const focus: Array<Badge> = achievements.focus.map((milestone) => ({
    id: milestone.id,
    emoji: milestone.emoji,
    title: milestone.title,
    earned: milestone.earned,
    progressPct: milestone.progressPct,
    progress: m.progress_of({
      current: formatDurationShort(Math.min(totals.totalWorkSec, milestone.thresholdSec)),
      target: formatDurationShort(milestone.thresholdSec),
    }),
    remaining: m.remaining_value({ value: formatDurationShort(milestone.remainingSec) }),
  }))

  const pomodoro: Array<Badge> = achievements.pomodoro.map((milestone) => ({
    id: milestone.id,
    emoji: milestone.emoji,
    title: milestone.title,
    earned: milestone.earned,
    progressPct: milestone.progressPct,
    progress: m.progress_of({
      current: Math.min(totals.completedPomodoros, milestone.thresholdCount),
      target: milestone.thresholdCount,
    }),
    remaining: m.remaining_value({ value: milestone.remainingCount }),
  }))

  const streak: Array<Badge> = achievements.streak.map((milestone) => ({
    id: milestone.id,
    emoji: milestone.emoji,
    title: milestone.title,
    earned: milestone.earned,
    progressPct: milestone.progressPct,
    progress: m.progress_of({
      current: Math.min(totals.streakDays, milestone.thresholdDays),
      target: milestone.thresholdDays,
    }),
    remaining: m.remaining_value({ value: milestone.remainingDays }),
  }))

  const groups = [
    { key: 'focus', title: m.focus_time(), badges: focus },
    { key: 'pomodoro', title: m.pomodoros(), badges: pomodoro },
    { key: 'streak', title: m.streak(), badges: streak },
  ]

  const nextUp = groups.flatMap((group) => {
    const next = group.badges.find((badge) => !badge.earned)
    return next ? [{ group: group.title, badge: next }] : []
  })

  return (
    // Opaque bg-card, like the chart cards: the marks there paint their gaps in
    // var(--card), so every panel on the page sits on that same surface.
    <section className="bg-card rounded-xl border p-4 shadow-sm sm:p-5">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-base font-semibold">{m.achievements()}</h2>
        <span className="text-muted-foreground text-sm tabular-nums">
          {m.earned_of_total({ earned: achievements.earnedCount, total: achievements.totalCount })}
        </span>
      </header>

      <div className="flex flex-col gap-6">
        {nextUp.length > 0 ? (
          <div className="flex flex-col gap-3">
            <h3 className="text-muted-foreground text-xs tracking-wide uppercase">{m.next_up()}</h3>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {nextUp.map(({ group, badge }) => (
                <li key={badge.id} className="bg-muted/30 flex flex-col gap-2 rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none" aria-hidden>
                      {badge.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{badge.title}</div>
                      <div className="text-muted-foreground text-xs">{group}</div>
                    </div>
                  </div>
                  <Meter value={badge.progressPct} label={badge.title} valueText={badge.progress} />
                  <div className="text-muted-foreground flex justify-between gap-2 text-xs tabular-nums">
                    <span>{badge.progress}</span>
                    <span>{badge.remaining}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{m.all_milestones_unlocked()}</p>
        )}

        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.key} className="flex flex-col gap-2">
              <h3 className="text-muted-foreground text-xs tracking-wide uppercase">{group.title}</h3>
              <ul className="flex flex-wrap gap-2">
                {group.badges.map((badge) => (
                  <BadgeChip key={badge.id} badge={badge} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Earned state never rides on colour alone — and it deliberately avoids the
 * `--chart-*` slots, which are series identity, not status. The signal is the
 * check-vs-padlock icon plus a full-colour or desaturated emoji; `--accent` only
 * tints the chip.
 */
function BadgeChip({ badge }: { badge: Badge }) {
  const StateIcon = badge.earned ? Check : Lock

  return (
    <li
      className={cn(
        'flex items-center gap-2 rounded-full border py-1 pr-3 pl-2 text-xs',
        badge.earned
          ? 'bg-accent/25 border-accent text-foreground'
          : 'text-muted-foreground border-dashed bg-transparent',
      )}
    >
      <span className={cn('text-base leading-none', !badge.earned && 'opacity-40 grayscale')} aria-hidden>
        {badge.emoji}
      </span>
      <span className="font-medium">{badge.title}</span>
      <StateIcon className="size-3 shrink-0" aria-hidden />
      <span className="sr-only">{badge.earned ? m.earned() : `${m.locked()} — ${badge.remaining}`}</span>
    </li>
  )
}
