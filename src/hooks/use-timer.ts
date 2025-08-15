import { useCallback, useEffect, useRef, useState } from 'react'

// Types
type TimerMode = 'infinite' | 'individually'
type IndividualMode = 'work' | 'break' | 'longBreak'

// Constants from timer.tsx
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

export function useTimer(): TimerState & TimerActions {
    // State
    const [mode, setModeState] = useState<TimerMode>('infinite')
    const [individualMode, setIndividualModeState] = useState<IndividualMode>('work')
    const [remainingSeconds, setRemainingSecondsState] = useState<number>(ORDER_SECONDS[0] ?? 25 * 60)
    const [isRunning, setIsRunningState] = useState<boolean>(false)
    const [orderIndex, setOrderIndexState] = useState<number>(0)
    const [intervalId, setIntervalIdState] = useState<number | null>(null)

    // Refs for stable access inside timers (avoid stale closures)
    const intervalRef = useRef<number | null>(null)
    const modeRef = useRef<TimerMode>(mode)
    const individualModeRef = useRef<IndividualMode>(individualMode)
    const orderIndexRef = useRef<number>(orderIndex)
    const isRunningRef = useRef<boolean>(isRunning)

    useEffect(() => {
        modeRef.current = mode
    }, [mode])

    useEffect(() => {
        individualModeRef.current = individualMode
    }, [individualMode])

    useEffect(() => {
        orderIndexRef.current = orderIndex
    }, [orderIndex])

    useEffect(() => {
        isRunningRef.current = isRunning
    }, [isRunning])

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current !== null) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [])

    const setMode = useCallback<TimerActions['setMode']>((newMode) => {
        setModeState(newMode)
        // Stop timer when mode changes
        // ... existing code ...
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        setIsRunningState(false)
        setIntervalIdState(null)
        // ... existing code ...
        if (newMode === 'infinite') {
            setOrderIndexState(0)
            setRemainingSecondsState(ORDER_SECONDS[0] ?? 25 * 60)
        } else {
            setRemainingSecondsState(MODE_TIMES_SECONDS[individualModeRef.current])
        }
    }, [])

    const setIndividualMode = useCallback<TimerActions['setIndividualMode']>((newIndividualMode) => {
        setIndividualModeState(newIndividualMode)
        // Stop timer when individual mode changes
        // ... existing code ...
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        setIsRunningState(false)
        setIntervalIdState(null)
        // ... existing code ...
        if (modeRef.current === 'individually') {
            setRemainingSecondsState(MODE_TIMES_SECONDS[newIndividualMode])
        }
    }, [])

    const setRemainingSeconds = useCallback<TimerActions['setRemainingSeconds']>((seconds) => {
        setRemainingSecondsState(seconds)
    }, [])

    const setIsRunning = useCallback<TimerActions['setIsRunning']>((running) => {
        setIsRunningState(running)
    }, [])

    const setOrderIndex = useCallback<TimerActions['setOrderIndex']>((index) => {
        setOrderIndexState(index)
    }, [])

    const setIntervalId = useCallback<TimerActions['setIntervalId']>((id) => {
        setIntervalIdState(id)
    }, [])

    const stop = useCallback<TimerActions['stop']>(() => {
        // Clear interval if it exists
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        setIsRunningState(false)
        setIntervalIdState(null)
    }, [])

    const start = useCallback<TimerActions['start']>(() => {
        // Don't start if already running or if time is up
        if (isRunningRef.current || remainingSeconds <= 0) return

        // Clear any existing interval
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }

        // Start new interval
        const id = window.setInterval(() => {
            // call the decrement using the latest refs/state
            // ... existing code ...
            // We prefer the exported function to keep parity
            decrementSeconds()
        }, 1000)

        intervalRef.current = id
        setIntervalIdState(id)
        setIsRunningState(true)
    }, [remainingSeconds])

    const reset = useCallback<TimerActions['reset']>(() => {
        stop()
        if (modeRef.current === 'infinite') {
            setOrderIndexState(0)
            setRemainingSecondsState(ORDER_SECONDS[0] ?? 25 * 60)
        } else {
            setRemainingSecondsState(MODE_TIMES_SECONDS[individualModeRef.current])
        }
    }, [stop])

    const decrementSeconds = useCallback<TimerActions['decrementSeconds']>(() => {
        setRemainingSecondsState((prev) => {
            if (prev <= 1) {
                // Timer finished
                stop()

                if (modeRef.current === 'infinite') {
                    const nextIndex = (orderIndexRef.current + 1) % ORDER_SECONDS.length
                    const nextTime = ORDER_SECONDS[nextIndex] ?? 25 * 60

                    setOrderIndexState(nextIndex)
                    setRemainingSecondsState(nextTime)

                    // Auto-restart for infinite mode after a short delay
                    window.setTimeout(() => {
                        start()
                    }, 500)
                } else {
                    // Reset to the individual mode time, but don't auto-start
                    setRemainingSecondsState(MODE_TIMES_SECONDS[individualModeRef.current])
                }

                // Return the current value (will be overwritten by the set calls above)
                return prev
            } else {
                // Just decrement
                return prev - 1
            }
        })
    }, [start, stop])

    return {
        // State
        mode,
        individualMode,
        remainingSeconds,
        isRunning,
        orderIndex,
        intervalId,
        // Actions
        setMode,
        setIndividualMode,
        setRemainingSeconds,
        decrementSeconds,
        setIsRunning,
        setOrderIndex,
        setIntervalId,
        start,
        stop,
        reset,
    }
}
