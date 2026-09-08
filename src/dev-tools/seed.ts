import { DateTime } from 'luxon'
import type { IndividualMode } from '@/providers/timer-provider'
import type { Session } from '@/lib/db'
import db from '@/lib/db'

/**
 * Sample data for development, so the stats page has something to say before
 * you have sat through a hundred real Pomodoros.
 *
 * Reachable only through `src/dev-tools/index.tsx`, which `__root.tsx` imports
 * behind `import.meta.env.DEV`. That flag is statically false in a production
 * build, so this module is tree-shaken out and never reaches the bundle — which
 * matters here because the service worker precaches `**\/*`.
 */

/** Marks generated rows, so clearing them never touches a session you recorded. */
const SEED_PREFIX = 'seed:'

/** Enough for the 30d range plus the previous 30d it compares against. */
export const SEED_DAYS = 90

/** Fixed so reseeding gives the same page back — deltas and screenshots stay comparable. */
const SEED = 20260909

/** mulberry32: small, seedable, and good enough for shaping fake days. */
function makeRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Days are shaped, not uniform: gaps and weekends are what make streaks visible. */
const ACTIVE_ODDS = { weekday: 0.88, weekend: 0.45 }
/** Roughly one pomodoro in eight is abandoned, which is what `completed: false` is for. */
const FINISH_ODDS = 0.875

const WORK_SEC = 25 * 60
const BREAK_SEC = 5 * 60
const LONG_BREAK_SEC = 30 * 60

function generate(days: number): Array<Omit<Session, 'id'>> {
  const random = makeRandom(SEED)
  const rows: Array<Omit<Session, 'id'>> = []
  const today = DateTime.local().startOf('day')

  const push = (type: IndividualMode, startedAt: DateTime, duration: number, completed: boolean) => {
    rows.push({
      uuid: `${SEED_PREFIX}${rows.length}`,
      type,
      startedAt: startedAt.toJSDate(),
      endedAt: startedAt.plus({ seconds: duration }).toJSDate(),
      duration,
      completed,
    })
  }

  const pick = (min: number, max: number) => min + Math.floor(random() * (max - min + 1))

  for (let daysAgo = days - 1; daysAgo >= 0; daysAgo--) {
    const day = today.minus({ days: daysAgo })
    const weekend = day.weekday > 5
    if (random() > (weekend ? ACTIVE_ODDS.weekend : ACTIVE_ODDS.weekday)) continue

    const total = weekend ? pick(1, 4) : pick(3, 8)
    // Two clusters, so a day reads as a morning stretch and an afternoon push
    // rather than one implausible six-hour block.
    const morning = Math.min(total, pick(2, 4))
    const blocks = [
      { count: morning, start: day.set({ hour: 8, minute: 45 }).plus({ minutes: pick(0, 90) }) },
      { count: total - morning, start: day.set({ hour: 14, minute: 0 }).plus({ minutes: pick(0, 120) }) },
    ]

    let completedToday = 0

    for (const block of blocks) {
      let cursor = block.start

      for (let index = 0; index < block.count; index++) {
        const finished = random() <= FINISH_ODDS
        const workSec = finished ? WORK_SEC : pick(5, 21) * 60

        push('work', cursor, workSec, finished)
        cursor = cursor.plus({ seconds: workSec })

        // Giving up on a pomodoro ends the block — no tidy break afterwards.
        if (!finished) break

        completedToday++
        if (index === block.count - 1) break

        const long = completedToday % 4 === 0
        const restSec = long ? LONG_BREAK_SEC : BREAK_SEC
        push(long ? 'longBreak' : 'break', cursor, restSec, true)
        cursor = cursor.plus({ seconds: restSec })
      }
    }
  }

  return rows
}

const seeded = () => db.sessions.filter((session) => session.uuid.startsWith(SEED_PREFIX))

export function countSeededSessions() {
  return seeded().count()
}

/** Replaces any previous seed, so pressing the button twice is not the same as seeding twice. */
export async function seedSessions() {
  await clearSeededSessions()
  const rows = generate(SEED_DAYS)
  await db.sessions.bulkAdd(rows)
  return rows.length
}

export function clearSeededSessions() {
  return seeded().delete()
}
