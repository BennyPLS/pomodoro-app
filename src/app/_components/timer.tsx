// Timer.tsx (Refactored)

'use client'
import { useEffect, useRef } from 'react'
import { Button } from '~/components/ui/button'
import { useTimer } from '~/hooks/use-timer'
import { env } from '~/env'

// --- Constants ---
const DIGIT_HEIGHT_PX = 128 // Matches h-30 (120px) + gap-2 (8px) in CSS
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reverse()
type TIME_DIGIT = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

// --- Helper Functions ---

// Sets the visual position of a single digit reel
const setDigitReel = (ref: React.RefObject<HTMLDivElement | null>, digit: TIME_DIGIT) => {
    if (!ref.current) return
    // Calculate top offset: (digit - 9) * DIGIT_HEIGHT_PX
    ref.current.style.top = `${(digit - 9) * DIGIT_HEIGHT_PX}px`
}

// Calculates digits from total seconds
const getDigitsFromSeconds = (
    totalSeconds: number
): {
    mt: TIME_DIGIT
    mu: TIME_DIGIT
    st: TIME_DIGIT
    su: TIME_DIGIT
} => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    const mt = Math.floor(minutes / 10) as TIME_DIGIT
    const mu = (minutes % 10) as TIME_DIGIT
    const st = Math.floor(seconds / 10) as TIME_DIGIT
    const su = (seconds % 10) as TIME_DIGIT

    return { mt, mu, st, su }
}

// --- Timer Component ---
export function Timer() {
    // --- Get state and actions from hook ---
    const {
        mode,
        individualMode,
        remainingSeconds,
        isRunning,
        setMode: handleSetMode,
        setIndividualMode: handleSetIndividualMode,
        start: handleStart,
        stop: handleStop,
        reset: handleReset,
    } = useTimer()

    // --- Refs ---
    const finishAudio = useRef<HTMLAudioElement | null>(null)
    const prevSecondsRef = useRef<number | null>(null)
    const minutesTensRef = useRef<HTMLDivElement>(null)
    const minutesRef = useRef<HTMLDivElement>(null)
    const secondsTensRef = useRef<HTMLDivElement>(null)
    const secondsRef = useRef<HTMLDivElement>(null)

    // --- Audio Initialization ---
    useEffect(() => {
        finishAudio.current = new Audio(`${env.NEXT_PUBLIC_BASE_PATH ?? ''}/click.mp3`)
    }, [])

    // --- Play sound when finishing a cycle ---
    // Detect transition away from 1 second (finish moment) to any other value.
    useEffect(() => {
        const prev = prevSecondsRef.current
        if (prev === 1 && remainingSeconds !== 1) {
            finishAudio.current?.play().catch((err) => console.error('Audio play failed:', err))
        }
        prevSecondsRef.current = remainingSeconds
    }, [remainingSeconds])

    // --- Visual Update Effect ---
    useEffect(() => {
        const { mt, mu, st, su } = getDigitsFromSeconds(remainingSeconds)
        setDigitReel(minutesTensRef, mt)
        setDigitReel(minutesRef, mu)
        setDigitReel(secondsTensRef, st)
        setDigitReel(secondsRef, su)
    }, [remainingSeconds]) // Update visuals whenever remainingSeconds changes

    // --- Accessibility Text ---
    const minutes = Math.floor(remainingSeconds / 60)
    const seconds = remainingSeconds % 60
    const formattedAccessibleTime = `Tiempo restante: ${minutes} minuto${minutes !== 1 ? 's' : ''} ${seconds
        .toString()
        .padStart(2, '0')} segundos`

    // --- Render ---
    return (
        <div className="flex flex-col items-center justify-center gap-2">
            {/* Mode Buttons */}
            <div className="flex gap-4">
                <Button onClick={() => handleSetMode('infinite')} variant={mode === 'infinite' ? 'default' : 'outline'}>
                    Infinito
                </Button>
                <Button
                    onClick={() => handleSetMode('individually')}
                    variant={mode === 'individually' ? 'default' : 'outline'}
                >
                    Individual
                </Button>
            </div>

            {/* Individual Mode Selection (always reserve space but conditionally show content) */}
            <div className="mt-2 flex h-9 items-center">
                {' '}
                {/* Fixed height container */}
                {mode === 'individually' && (
                    <div className="flex gap-4">
                        <Button
                            onClick={() => handleSetIndividualMode('work')}
                            variant={individualMode === 'work' ? 'secondary' : 'ghost'}
                        >
                            Trabajo
                        </Button>
                        <Button
                            onClick={() => handleSetIndividualMode('break')}
                            variant={individualMode === 'break' ? 'secondary' : 'ghost'}
                        >
                            Descanso
                        </Button>
                        <Button
                            onClick={() => handleSetIndividualMode('longBreak')}
                            variant={individualMode === 'longBreak' ? 'secondary' : 'ghost'}
                        >
                            Descanso Largo
                        </Button>
                    </div>
                )}
            </div>

            {/* Timer Display */}
            <div className="bg-background mt-2 rounded-lg p-4">
                <p className="sr-only" aria-live={isRunning ? 'polite' : 'off'}>
                    {formattedAccessibleTime}
                </p>

                <div className="relative flex h-50 overflow-hidden py-10 text-center text-9xl" aria-hidden="true">
                    {/* Fades */}
                    <div className="to-background/0 from-background pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b" />

                    {/* Digits */}
                    {/* Note: The 'style' is now controlled by the Visual Update Effect */}
                    <div className="relative h-30 w-20">
                        <div
                            className="absolute left-0 flex flex-col gap-2 transition-all duration-300 ease-in-out"
                            ref={minutesTensRef}
                        >
                            {NUMBERS.map((number) => (
                                <span className="flex h-30 w-20 items-center justify-center" key={`mt-${number}`}>
                                    {number}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="relative h-30 w-20">
                        <div
                            className="absolute left-0 flex flex-col gap-2 transition-all duration-300 ease-in-out"
                            ref={minutesRef}
                        >
                            {NUMBERS.map((number) => (
                                <span className="flex h-30 w-20 items-center justify-center" key={`m-${number}`}>
                                    {number}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-center pb-2 text-6xl">:</div>
                    <div className="relative h-30 w-20">
                        <div
                            className="absolute left-0 flex flex-col gap-2 transition-all duration-300 ease-in-out"
                            ref={secondsTensRef}
                        >
                            {NUMBERS.map((number) => (
                                <span className="flex h-30 w-20 items-center justify-center" key={`st-${number}`}>
                                    {number}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="relative h-30 w-20">
                        <div
                            className="absolute left-0 flex flex-col gap-2 transition-all duration-300 ease-in-out"
                            ref={secondsRef}
                        >
                            {NUMBERS.map((number) => (
                                <span className="flex h-30 w-20 items-center justify-center" key={`s-${number}`}>
                                    {number}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="from-background/0 to-background pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-b" />
                </div>
            </div>

            {/* Control Buttons */}
            <div className="mt-2 flex gap-4">
                <Button onClick={handleStart} disabled={isRunning || remainingSeconds === 0}>
                    Comenzar
                </Button>
                <Button onClick={handleStop} disabled={!isRunning}>
                    Parar
                </Button>
                <Button onClick={handleReset} disabled={isRunning}>
                    Reiniciar
                </Button>
            </div>
        </div>
    )
}
