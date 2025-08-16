'use client'

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { createStore, type StoreApi } from 'zustand/vanilla'
import { useStore } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

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
    return createStore<TimerStore>((set, get) => ({
        // State
        mode: 'infinite',
        individualMode: 'work',
        remainingSeconds: ORDER_SECONDS[0] ?? 25 * 60,
        isRunning: false,
        orderIndex: 0,
        intervalId: null,

        // Actions
        setMode: (newMode) => {
            const { intervalId } = get()
            if (intervalId !== null) clearInterval(intervalId)
            set({ mode: newMode, isRunning: false, intervalId: null })

            if (newMode === 'infinite') {
                set({
                    orderIndex: 0,
                    remainingSeconds: ORDER_SECONDS[0] ?? 25 * 60,
                })
            } else {
                const { individualMode } = get()
                set({ remainingSeconds: MODE_TIMES_SECONDS[individualMode] })
            }
        },

        setIndividualMode: (newIndividualMode) => {
            const { intervalId, mode } = get()
            if (intervalId !== null) clearInterval(intervalId)
            set({ individualMode: newIndividualMode, isRunning: false, intervalId: null })

            if (mode === 'individually') {
                set({ remainingSeconds: MODE_TIMES_SECONDS[newIndividualMode] })
            }
        },

        setRemainingSeconds: (seconds) => set({ remainingSeconds: seconds }),
        setIsRunning: (isRunning) => set({ isRunning }),
        setOrderIndex: (index) => set({ orderIndex: index }),
        setIntervalId: (id) => set({ intervalId: id }),

        stop: () => {
            const { intervalId } = get()
            if (intervalId !== null) clearInterval(intervalId)
            set({ isRunning: false, intervalId: null })
        },

        start: () => {
            const { isRunning, remainingSeconds } = get()
            if (typeof window === 'undefined') return
            if (isRunning || remainingSeconds <= 0) return

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
            const { remainingSeconds, mode, individualMode, orderIndex } = get()
            if (remainingSeconds <= 1) {
                get().stop()

                if (mode === 'infinite') {
                    const nextIndex = (orderIndex + 1) % ORDER_SECONDS.length
                    const nextTime = ORDER_SECONDS[nextIndex] ?? 25 * 60
                    set({ orderIndex: nextIndex, remainingSeconds: nextTime })

                    if (typeof window !== 'undefined') {
                        window.setTimeout(() => {
                            get().start()
                        }, 0)
                    }
                } else {
                    set({ remainingSeconds: MODE_TIMES_SECONDS[individualMode] })
                }
            } else {
                set({ remainingSeconds: remainingSeconds - 1 })
            }
        },
    }))
}

// Context to confine the store
const TimerStoreContext = createContext<StoreApi<TimerStore> | null>(null)

export function TimerProvider({ children }: { children: ReactNode }) {
    const storeRef = useRef<StoreApi<TimerStore> | null>(null)

    if (!storeRef.current) {
        storeRef.current = createTimerStore()
    }

    // Cleanup on unmount (stop any running interval)
    useEffect(() => {
        return () => {
            storeRef.current?.getState().stop()
        }
    }, [])

    return <TimerStoreContext.Provider value={storeRef.current}>{children}</TimerStoreContext.Provider>
}

export default function useTimer<T>(selector: (s: TimerStore) => T): T {
    const store = useContext(TimerStoreContext)
    if (!store) throw new Error('useTimerSelector must be used within a TimerProvider')
    return useStore(store, useShallow(selector))
}