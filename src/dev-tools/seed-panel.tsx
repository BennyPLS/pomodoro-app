import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Database, Trash2 } from 'lucide-react'
import { SEED_DAYS, clearSeededSessions, countSeededSessions, seedSessions } from './seed'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import db from '@/lib/db'

/**
 * Devtools tab for filling `db.sessions` with sample data.
 *
 * Strings are hardcoded English on purpose: this panel never ships, so adding
 * keys to `messages/*.json` would only be translation debt for a build artifact
 * that does not exist.
 */
export function SeedPanel() {
  const seeded = useLiveQuery(() => countSeededSessions())
  const total = useLiveQuery(() => db.sessions.count())
  const [pending, setPending] = useState<'seed' | 'clear' | null>(null)

  const run = (action: 'seed' | 'clear') => {
    setPending(action)
    const work = action === 'seed' ? seedSessions() : clearSeededSessions()
    void work.finally(() => setPending(null))
  }

  const real = total !== undefined && seeded !== undefined ? total - seeded : undefined

  return (
    <div className="bg-card text-foreground flex flex-col gap-4 p-4 text-sm">
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold">Sample sessions</h2>
        <p className="text-muted-foreground">
          Generates ~{SEED_DAYS} days of Pomodoros from a fixed seed, with weekends, gaps and abandoned sessions, so
          streaks and range deltas have something to show. Seeding replaces the previous sample rather than stacking on
          top of it.
        </p>
      </div>

      <dl className="grid w-fit grid-cols-[auto_auto] gap-x-6 gap-y-1 tabular-nums">
        <dt className="text-muted-foreground">Sample rows</dt>
        <dd>{seeded ?? '—'}</dd>
        {/* The point of the uuid marker: your own sessions are counted separately
            and survive Clear. */}
        <dt className="text-muted-foreground">Your own rows</dt>
        <dd>{real ?? '—'}</dd>
      </dl>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={pending !== null} onClick={() => run('seed')}>
          {pending === 'seed' ? <Spinner /> : <Database aria-hidden />}
          {seeded ? 'Reseed' : 'Seed'} sessions
        </Button>
        <Button size="sm" variant="outline" disabled={pending !== null || seeded === 0} onClick={() => run('clear')}>
          {pending === 'clear' ? <Spinner /> : <Trash2 aria-hidden />}
          Clear sample
        </Button>
      </div>
    </div>
  )
}
