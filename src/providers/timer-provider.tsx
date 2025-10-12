import { createContext, use, useEffect, useRef } from 'react'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import { createStore } from 'zustand/vanilla'
import { v7 } from 'uuid'
import { DateTime } from 'luxon'
import type { StoreApi } from 'zustand/vanilla'
import type { ReactNode } from 'react'
import db from '@/lib/db'

// Types
export type TimerMode = 'infinite' | 'individually'
export type IndividualMode = 'work' | 'break' | 'longBreak'

// Constants
const TWENTY_FIVE_MINUTES = 25 * 60
const FIVE_MINUTES = 5 * 60
const THIRTY = 30 * 60

const ORDER_SECONDS = [
  TWENTY_FIVE_MINUTES,
  FIVE_MINUTES,
  TWENTY_FIVE_MINUTES,
  FIVE_MINUTES,
  TWENTY_FIVE_MINUTES,
  FIVE_MINUTES,
  TWENTY_FIVE_MINUTES,
  THIRTY,
] as const

const MODE_TIMES_SECONDS: Record<IndividualMode, number> = {
  work: TWENTY_FIVE_MINUTES,
  break: FIVE_MINUTES,
  longBreak: THIRTY,
}

// Timer store state interface
interface TimerState {
  mode: TimerMode
  individualMode: IndividualMode
  remainingSeconds: number
  isRunning: boolean
  orderIndex: number
  intervalId: number | null
  // Add: fields to track current phase for persistence
  sessionStartAt: DateTime | null // epoch ms
  sessionType: IndividualMode | null
  sessionPlannedSeconds: number | null
  sessionId: string | null
  // Add: browser-session-only cumulative totals (do NOT persist to DB)
  browserSessionTotalSec: number
  browserSessionWorkSec: number
  browserSessionRestSec: number
}

// Timer store actions interface
interface TimerActions {
  setMode: (mode: TimerMode) => void
  setIndividualMode: (mode: IndividualMode) => void
  decrementSeconds: () => void
  start: () => void
  stop: () => void
  reset: () => void
}

type TimerStore = TimerState & TimerActions

function getCurrentIndividualMode(s: Pick<TimerState, 'mode' | 'individualMode' | 'orderIndex'>): IndividualMode {
  if (s.mode === 'individually') return s.individualMode
  return getCurrentInfinityPhase(s.orderIndex)
}

export function getCurrentInfinityPhase(orderIndex: number): IndividualMode {
  const idx = orderIndex % ORDER_SECONDS.length
  if (idx === 1 || idx === 3 || idx === 5) return 'break'
  if (idx === 7) return 'longBreak'
  return 'work'
}

async function persistSession(payload: {
  type: IndividualMode
  startedAt: DateTime
  endedAt: DateTime
  duration: number
  sessionId: string
  completed: boolean
}) {
  try {
    await db.sessions.add({
      type: payload.type,
      startedAt: payload.startedAt.toJSDate(),
      endedAt: payload.endedAt.toJSDate(),
      duration: payload.duration,
      uuid: payload.sessionId,
      completed: payload.completed,
    })
  } catch {
    console.error("Couldn't persist Session Data")
  }
}

function createTimerStore() {
  return createStore<TimerStore>((set, get) => ({
    // State
    mode: 'infinite',
    individualMode: 'work',
    remainingSeconds: ORDER_SECONDS[0],
    isRunning: false,
    orderIndex: 0,
    intervalId: null,
    // Add: phase trackers
    sessionStartAt: null,
    sessionPlannedSeconds: null,
    sessionType: null,
    sessionId: null,
    // Add: initialize browser-session-only totals
    browserSessionTotalSec: 0,
    browserSessionWorkSec: 0,
    browserSessionRestSec: 0,

    // Actions
    setMode: (newMode) => {
      const { individualMode, stop } = get()
      stop()
      set({ mode: newMode })

      if (newMode === 'infinite') {
        set({
          orderIndex: 0,
          remainingSeconds: ORDER_SECONDS[0],
        })
      } else {
        set({
          remainingSeconds: MODE_TIMES_SECONDS[individualMode],
        })
      }
    },

    setIndividualMode: (newIndividualMode) => {
      get().stop()
      set({
        individualMode: newIndividualMode,
        mode: 'individually',
        remainingSeconds: MODE_TIMES_SECONDS[newIndividualMode],
      })
    },

    stop: () => {
      const { intervalId, isRunning, sessionStartAt, sessionType, remainingSeconds, sessionId, sessionPlannedSeconds } =
        get()
      if (intervalId !== null) clearInterval(intervalId)

      // Persist current phase chunk if it was running
      if (isRunning && sessionStartAt && sessionType && sessionId) {
        const now = DateTime.local()

        // If we are stopping because the timer just hit the end, remainingSeconds <= 1,
        // record the full planned duration; otherwise record elapsed wall time.
        const duration =
          remainingSeconds <= 1 && sessionPlannedSeconds
            ? sessionPlannedSeconds
            : now.diff(sessionStartAt).as('seconds')

        const completed = remainingSeconds <= 1

        void persistSession({
          type: sessionType,
          startedAt: sessionStartAt,
          endedAt: now,
          duration,
          sessionId,
          completed,
        })

        // If the phase completed, clear the phase identifiers (phase ended)
        if (completed) {
          set({
            isRunning: false,
            intervalId: null,
            // reset phase trackers
            sessionStartAt: null,
            sessionType: null,
            sessionId: null,
          })
          return
        }
      }

      // For a normal pause (not a phase completion) we keep the phaseId/phaseType so
      // resume will continue the same phase and produce more sessions linked to the same phaseId.
      set({
        isRunning: false,
        intervalId: null,
        sessionPlannedSeconds: null,
        sessionStartAt: null,
      })
    },

    start: () => {
      const { isRunning, remainingSeconds } = get()
      if (isRunning || remainingSeconds <= 0) return

      // Initialize phase trackers if this is a fresh start, or resume an existing paused phase.
      const s = get()

      // If there's no phaseType currently tracked, this is a brand-new phase:
      if (!s.sessionType) {
        const type = getCurrentIndividualMode(s)
        set({
          sessionStartAt: DateTime.now(),
          sessionPlannedSeconds: s.remainingSeconds,
          sessionType: type,
          sessionId: v7(),
        })
      } else if (!s.sessionStartAt) {
        // Resuming a paused phase: keep the existing phaseId and planned seconds
        set({ sessionStartAt: DateTime.now(), sessionPlannedSeconds: s.remainingSeconds })
      }

      const { intervalId: existingId } = get()
      if (existingId !== null) clearInterval(existingId)

      const id = window.setInterval(() => {
        get().decrementSeconds()
      }, 1000)

      set({ intervalId: id, isRunning: true })
    },

    reset: () => {
      get().stop()
      const { mode, individualMode } = get()
      if (mode === 'infinite') {
        set({
          orderIndex: 0,
          remainingSeconds: ORDER_SECONDS[0],
        })
      } else {
        set({ remainingSeconds: MODE_TIMES_SECONDS[individualMode] })
      }
    },

    decrementSeconds: () => {
      const {
        remainingSeconds,
        mode,
        individualMode,
        orderIndex,
        browserSessionTotalSec,
        browserSessionWorkSec,
        browserSessionRestSec,
        sessionType,
      } = get()

      // Determine the current phase type (use tracked phase when available)
      const isWork = (sessionType ?? getCurrentIndividualMode(get())) === 'work'
      set({
        browserSessionTotalSec: browserSessionTotalSec + 1,
        browserSessionWorkSec: browserSessionWorkSec + (isWork ? 1 : 0),
        browserSessionRestSec: browserSessionRestSec + (isWork ? 0 : 1),
      })

      if (remainingSeconds > 1) {
        set({ remainingSeconds: remainingSeconds - 1 })
        return
      }

      // End current phase
      get().stop()

      if (mode === 'infinite') {
        const nextIndex = (orderIndex + 1) % ORDER_SECONDS.length
        const nextTime = ORDER_SECONDS[nextIndex] ?? 25 * 60
        set({ orderIndex: nextIndex, remainingSeconds: nextTime })

        window.setTimeout(() => {
          get().start()
        }, 0)
      } else {
        set({ remainingSeconds: MODE_TIMES_SECONDS[individualMode] })
      }
    },
  }))
}

// Context to confine the store
const TimerStoreContext = createContext<StoreApi<TimerStore> | null>(null)

const PENDING_PHASE = 'timer:pendingPhase'

export function TimerProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<StoreApi<TimerStore> | null>(null)
  const closedRef = useRef(false)

  if (!storeRef.current) {
    storeRef.current = createTimerStore()
  }

  // On mount: flush any pending phase captured during a previous close
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PENDING_PHASE)
      if (raw) {
        const { type, startedAt, endedAt, duration, sessionId, completed } = JSON.parse(raw) as {
          type: IndividualMode
          startedAt: string
          endedAt: string
          duration: number
          sessionId: string
          completed: boolean
        }
        void db.sessions.add({
          type,
          startedAt: DateTime.fromISO(startedAt).toJSDate(),
          endedAt: DateTime.fromISO(endedAt).toJSDate(),
          duration,
          uuid: sessionId,
          completed,
        })
        localStorage.removeItem(PENDING_PHASE)
      }
    } catch {
      // ignore errors
    }
  }, [])

  // Persist on window close/tab hide by caching to localStorage synchronously
  useEffect(() => {
    const abort = new AbortController()
    const handlePersistOnClose = () => {
      const s = storeRef.current?.getState()
      if (!s) return
      if (s.isRunning && s.sessionStartAt && s.sessionType) {
        const now = DateTime.local()

        // If we are stopping because the timer just hit the end, remainingSeconds <= 1,
        // record the full planned duration; otherwise record elapsed wall time.
        const duration =
          s.remainingSeconds <= 1 && s.sessionPlannedSeconds
            ? s.sessionPlannedSeconds
            : now.diff(s.sessionStartAt).as('seconds')

        const completed = s.remainingSeconds <= 1

        const payload = {
          type: s.sessionType,
          startedAt: s.sessionStartAt.toISO(),
          endedAt: now.toISO(),
          duration,
          sessionId: s.sessionId,
          completed,
        }

        try {
          localStorage.setItem(PENDING_PHASE, JSON.stringify(payload))
        } catch {
          // ignore storage errors
        }

        // Mark as closing to avoid double-persist from unmount cleanup
        closedRef.current = true
      }
    }

    window.addEventListener('pagehide', handlePersistOnClose, abort)
    window.addEventListener('beforeunload', handlePersistOnClose, abort)

    return () => abort.abort()
  }, [])

  // Cleanup on unmount (stop any running interval) unless we've already handled close
  useEffect(() => {
    return () => {
      if (!closedRef.current) {
        storeRef.current?.getState().stop()
      }
    }
  }, [])

  return <TimerStoreContext.Provider value={storeRef.current}>{children}</TimerStoreContext.Provider>
}

export default function useTimer<T>(selector: (s: TimerStore) => T): T {
  const store = use(TimerStoreContext)
  if (!store) throw new Error('useTimerSelector must be used within a TimerProvider')
  return useStore(store, useShallow(selector))
}
