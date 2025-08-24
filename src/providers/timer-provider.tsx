'use client'

import { createContext, type ReactNode, useContext, useEffect, useRef } from 'react'
import { createStore, type StoreApi } from 'zustand/vanilla'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
// Add: db for persisting timer sessions
import db from '~/lib/db'

// Types
type TimerMode = 'infinite' | 'individually'
type IndividualMode = 'work' | 'break' | 'longBreak'

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
]

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
    phaseStartAt: number | null // epoch ms
    phasePlannedSeconds: number | null
    phaseType: IndividualMode | null
    // Add: browser-session-only cumulative totals (do NOT persist to DB)
    sessionTotalSec: number
    sessionWorkSec: number
    sessionRestSec: number
}

// Timer store actions interface
interface TimerActions {
    setMode: (mode: TimerMode) => void
    setIndividualMode: (mode: IndividualMode) => void
    setRemainingSeconds: (seconds: number) => void
    decrementSeconds: () => void
    setIsRunning: (isRunning: boolean) => void
    setOrderIndex: (index: number) => void
    setIntervalId: (id: number | null) => void
    start: () => void
    stop: () => void
    reset: () => void
}

type TimerStore = TimerState & TimerActions

function createTimerStore() {
    // Helper: determine phase type from state
    const getPhaseTypeFromState = (s: Pick<TimerState, 'mode' | 'individualMode' | 'orderIndex'>): IndividualMode => {
        if (s.mode === 'individually') return s.individualMode
        // infinite mode sequence: work, break, work, break, work, break, work, longBreak
        const idx = s.orderIndex % ORDER_SECONDS.length
        if (idx === 1 || idx === 3 || idx === 5) return 'break'
        if (idx === 7) return 'longBreak'
        return 'work'
    }

    // Helper: persist a finished/partial phase
    const persistPhase = async (payload: {
        type: IndividualMode
        startedAt: number
        endedAt: number
        durationSec: number
    }) => {
        try {
            await db.timerSessions.add({
                type: payload.type,
                startedAt: new Date(payload.startedAt),
                endedAt: new Date(payload.endedAt),
                durationSec: payload.durationSec,
            })
        } catch {
            // ignore persistence errors
        }
    }

    return createStore<TimerStore>((set, get) => ({
        // State
        mode: 'infinite',
        individualMode: 'work',
        remainingSeconds: ORDER_SECONDS[0] ?? 25 * 60,
        isRunning: false,
        orderIndex: 0,
        intervalId: null,
        // Add: phase trackers
        phaseStartAt: null,
        phasePlannedSeconds: null,
        phaseType: null,
        // Add: initialize browser-session-only totals
        sessionTotalSec: 0,
        sessionWorkSec: 0,
        sessionRestSec: 0,

        // Actions
        setMode: (newMode) => {
            const { individualMode, stop } = get()
            stop()
            set({ mode: newMode })

            if (newMode === 'infinite') {
                set({
                    orderIndex: 0,
                    remainingSeconds: ORDER_SECONDS[0] ?? 25 * 60,
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

        setRemainingSeconds: (seconds) => set({ remainingSeconds: seconds }),
        setIsRunning: (isRunning) => set({ isRunning }),
        setOrderIndex: (index) => set({ orderIndex: index }),
        setIntervalId: (id) => set({ intervalId: id }),

        stop: () => {
            const state = get()
            const { intervalId } = state
            if (intervalId !== null) clearInterval(intervalId)

            // Persist current phase if it was running
            if (state.isRunning && state.phaseStartAt && state.phaseType) {
                const now = Date.now()
                const planned = state.phasePlannedSeconds ?? 0
                let durationSec: number

                // If we are stopping because the timer just hit the end, remainingSeconds <= 1,
                // record the full planned duration; otherwise record elapsed wall time.
                if (state.remainingSeconds <= 1 && planned > 0) {
                    durationSec = planned
                } else {
                    durationSec = Math.max(0, Math.floor((now - state.phaseStartAt) / 1000))
                    // Cap to planned if available
                    if (planned > 0) durationSec = Math.min(durationSec, planned)
                }

                void persistPhase({
                    type: state.phaseType,
                    startedAt: state.phaseStartAt,
                    endedAt: now,
                    durationSec,
                })
            }

            set({
                isRunning: false,
                intervalId: null,
                // reset phase trackers
                phaseStartAt: null,
                phasePlannedSeconds: null,
                phaseType: null,
            })
        },

        start: () => {
            const { isRunning, remainingSeconds } = get()
            if (isRunning || remainingSeconds <= 0) return

            // Initialize phase trackers if this is a fresh start
            const s = get()
            if (!s.phaseStartAt || !s.phaseType) {
                const phaseType = getPhaseTypeFromState(s)
                set({
                    phaseStartAt: Date.now(),
                    phasePlannedSeconds: s.remainingSeconds,
                    phaseType,
                })
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
                    remainingSeconds: ORDER_SECONDS[0] ?? 25 * 60,
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
                sessionTotalSec,
                sessionWorkSec,
                sessionRestSec,
                phaseType,
            } = get()

            // Determine current phase type (use tracked phase when available)
            const currentType = phaseType ?? getPhaseTypeFromState(get())
            const addOneSecondToSessionTotals = () => {
                const isWork = currentType === 'work'
                set({
                    sessionTotalSec: sessionTotalSec + 1,
                    sessionWorkSec: sessionWorkSec + (isWork ? 1 : 0),
                    sessionRestSec: sessionRestSec + (isWork ? 0 : 1),
                })
            }

            addOneSecondToSessionTotals()

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

export function TimerProvider({ children }: { children: ReactNode }) {
    const storeRef = useRef<StoreApi<TimerStore> | null>(null)
    const closedRef = useRef(false)

    if (!storeRef.current) {
        storeRef.current = createTimerStore()
    }

    // On mount: flush any pending phase captured during a previous close
    useEffect(() => {
        const key = 'timer:pendingPhase'
        try {
            const raw = localStorage.getItem(key)
            if (raw) {
                const payload = JSON.parse(raw) as {
                    type: IndividualMode
                    startedAt: number
                    endedAt: number
                    durationSec: number
                }
                void db.timerSessions.add({
                    type: payload.type,
                    startedAt: new Date(payload.startedAt),
                    endedAt: new Date(payload.endedAt),
                    durationSec: payload.durationSec,
                })
                localStorage.removeItem(key)
            }
        } catch {
            // ignore errors
        }
    }, [])

    // Persist on window close/tab hide by caching to localStorage synchronously
    useEffect(() => {
        const key = 'timer:pendingPhase'
        const handlePersistOnClose = () => {
            const s = storeRef.current?.getState()
            if (!s) return
            if (s.isRunning && s.phaseStartAt && s.phaseType) {
                const now = Date.now()
                const planned = s.phasePlannedSeconds ?? 0
                let durationSec: number

                if (s.remainingSeconds <= 1 && planned > 0) {
                    durationSec = planned
                } else {
                    durationSec = Math.max(0, Math.floor((now - s.phaseStartAt) / 1000))
                    if (planned > 0) durationSec = Math.min(durationSec, planned)
                }

                const payload = {
                    type: s.phaseType,
                    startedAt: s.phaseStartAt,
                    endedAt: now,
                    durationSec,
                }

                try {
                    localStorage.setItem(key, JSON.stringify(payload))
                } catch {
                    // ignore storage errors
                }

                // Mark as closing to avoid double-persist from unmount cleanup
                closedRef.current = true
            }
        }

        window.addEventListener('pagehide', handlePersistOnClose)
        window.addEventListener('beforeunload', handlePersistOnClose)
        return () => {
            window.removeEventListener('pagehide', handlePersistOnClose)
            window.removeEventListener('beforeunload', handlePersistOnClose)
        }
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
    const store = useContext(TimerStoreContext)
    if (!store) throw new Error('useTimerSelector must be used within a TimerProvider')
    return useStore(store, useShallow(selector))
}
