import { create } from 'zustand'

// Constants from timer.tsx
const ORDER_SECONDS = [25 * 60, 5 * 60, 25 * 60, 5 * 60, 25 * 60, 5 * 60, 25 * 60, 30 * 60] // Times in seconds
type TimerMode = 'infinite' | 'individually'
type IndividualMode = 'work' | 'break' | 'longBreak'
const MODE_TIMES_SECONDS: Record<IndividualMode, number> = {
    work: 25 * 60,
    break: 5 * 60,
    longBreak: 30 * 60,
}

// Timer store state interface
interface TimerState {
    mode: TimerMode
    individualMode: IndividualMode
    remainingSeconds: number
    isRunning: boolean
    orderIndex: number
    intervalId: NodeJS.Timeout | null
}

// Timer store actions interface
interface TimerActions {
    setMode: (mode: TimerMode) => void
    setIndividualMode: (mode: IndividualMode) => void
    setRemainingSeconds: (seconds: number) => void
    decrementSeconds: () => void
    setIsRunning: (isRunning: boolean) => void
    setOrderIndex: (index: number) => void
    setIntervalId: (id: NodeJS.Timeout | null) => void
    start: () => void
    stop: () => void
    reset: () => void
}

// Create the timer store
export const useTimerStore = create<TimerState & TimerActions>((set, get) => ({
    // Initial state
    mode: 'infinite',
    individualMode: 'work',
    remainingSeconds: ORDER_SECONDS[0] ?? 25 * 60,
    isRunning: false,
    orderIndex: 0,
    intervalId: null,

    // Actions
    setMode: (mode) => {
        set({ mode })
        // Stop timer when mode changes
        get().stop()
        
        if (mode === 'infinite') {
            set({ 
                orderIndex: 0,
                remainingSeconds: ORDER_SECONDS[0] ?? 25 * 60
            })
        } else {
            set({ 
                remainingSeconds: MODE_TIMES_SECONDS[get().individualMode]
            })
        }
    },
    
    setIndividualMode: (individualMode) => {
        set({ individualMode })
        // Stop timer when individual mode changes
        get().stop()
        
        if (get().mode === 'individually') {
            set({ remainingSeconds: MODE_TIMES_SECONDS[individualMode] })
        }
    },
    
    setRemainingSeconds: (remainingSeconds) => set({ remainingSeconds }),
    
    decrementSeconds: () => {
        const { remainingSeconds, mode, orderIndex, stop } = get()
        
        if (remainingSeconds <= 1) {
            // Timer finished
            stop()
            
            // Determine next state based on mode
            if (mode === 'infinite') {
                const nextIndex = (orderIndex + 1) % ORDER_SECONDS.length
                const nextTime = ORDER_SECONDS[nextIndex] ?? 25 * 60
                
                set({ 
                    orderIndex: nextIndex,
                    remainingSeconds: nextTime
                })
                
                // Auto-restart for infinite mode after a short delay
                setTimeout(() => {
                    get().start()
                }, 500)
            } else {
                // Reset to the individual mode time, but don't auto-start
                set({ 
                    remainingSeconds: MODE_TIMES_SECONDS[get().individualMode]
                })
            }
        } else {
            // Just decrement
            set({ remainingSeconds: remainingSeconds - 1 })
        }
    },
    
    setIsRunning: (isRunning) => set({ isRunning }),
    setOrderIndex: (orderIndex) => set({ orderIndex }),
    setIntervalId: (intervalId) => set({ intervalId }),
    
    start: () => {
        const { isRunning, remainingSeconds, intervalId } = get()
        
        // Don't start if already running or if time is up
        if (isRunning || remainingSeconds <= 0) return
        
        // Clear any existing interval
        if (intervalId) clearInterval(intervalId)
        
        // Start new interval
        const newIntervalId = setInterval(() => {
            get().decrementSeconds()
        }, 1000)
        
        set({ 
            isRunning: true,
            intervalId: newIntervalId
        })
    },
    
    stop: () => {
        const { intervalId } = get()
        
        // Clear interval if it exists
        if (intervalId) clearInterval(intervalId)
        
        set({ 
            isRunning: false,
            intervalId: null
        })
    },
    
    reset: () => {
        const { mode, individualMode, stop } = get()
        
        stop()
        
        if (mode === 'infinite') {
            set({ 
                orderIndex: 0,
                remainingSeconds: ORDER_SECONDS[0] ?? 25 * 60
            })
        } else {
            set({ 
                remainingSeconds: MODE_TIMES_SECONDS[individualMode]
            })
        }
    }
}))