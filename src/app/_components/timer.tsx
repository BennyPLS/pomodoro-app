'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '~/components/ui/button'

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reverse()
type TIME = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

const getNumber = (ref: HTMLDivElement) => {
    const actualTop = parseInt(ref.style.top?.replace('px', '') ?? '0')
    return actualTop === 0 ? 9 : actualTop / 128 + 9
}

const advanceNumber = (ref: HTMLDivElement): number => {
    const actualTop = parseInt(ref.style.top?.replace('px', '') ?? '0')

    if (actualTop === -1152) {
        ref.style.top = '0px'
    } else {
        ref.style.top = `${actualTop - 128}px`
    }

    return actualTop === 0 ? 9 : actualTop / 128 + 9
}

const setTime = (ref: HTMLDivElement, time: TIME) => {
    ref.style.top = `${(time - 9) * 128}px`
}

const ORDER = [25, 5, 25, 5, 25, 5, 25, 5, 30]

type TimerMode = 'infinite' | 'individually'

export function Timer() {
    const [mode, setMode] = useState<TimerMode>('infinite')

    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const orderRef = useRef<number>(0)

    const minutesTensRef = useRef<HTMLDivElement>(null)
    const minutesRef = useRef<HTMLDivElement>(null)
    const secondsTensRef = useRef<HTMLDivElement>(null)
    const secondsRef = useRef<HTMLDivElement>(null)

    const setTimerTime = useCallback(
        (minutes: number, seconds: number) => {
            const minutesTens = (minutes / 10) | 0
            const minutesUnits = minutes % 10
            const secondsTens = (seconds / 10) | 0
            const secondsUnits = seconds % 10
            setTime(secondsRef.current!, secondsUnits as TIME)
            setTime(secondsTensRef.current!, secondsTens as TIME)
            setTime(minutesRef.current!, minutesUnits as TIME)
            setTime(minutesTensRef.current!, minutesTens as TIME)
        },
        [secondsRef, secondsTensRef, minutesRef, minutesTensRef]
    )

    useEffect(() => {
        if (mode === 'infinite') {
            orderRef.current = 0
            setTimerTime(ORDER[0]!, 0)
        } else {
            setTimerTime(25, 0)
        }
    }, [mode, setTimerTime])

    const stopTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearInterval(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [timeoutRef])

    // error ignored for dependency cycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const startTimer = () => {
        if (timeoutRef.current) return
        timeoutRef.current = setInterval(advanceTimer, 1000)
    }

    const advanceTimer = useCallback(() => {
        const newSecond = advanceNumber(secondsRef.current!)
        if (newSecond !== 0) return
        const newTenSecond = advanceNumber(secondsTensRef.current!)
        if (newTenSecond !== 0) return
        const newMinute = advanceNumber(minutesRef.current!)
        if (newMinute !== 0) return
        const newTenMinute = advanceNumber(minutesTensRef.current!)
        if (newTenMinute !== 0) return

        stopTimer()

        if (mode === 'infinite') {
            orderRef.current = (orderRef.current + 1) % ORDER.length
            const orderTime = ORDER[orderRef.current]!
            setTimerTime(orderTime, 0)
            startTimer()
        } else {
            alert('Time out!')
        }
    }, [stopTimer, mode, setTimerTime, startTimer])

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex gap-4">
                <Button onClick={() => setMode('infinite')}>Infinite</Button>
                <Button onClick={() => setMode('individually')}>Individually</Button>
            </div>
            <div className="flex gap-4 data-[mode='infinite']:hidden" data-mode={mode}>
                <Button
                    onClick={() => {
                        stopTimer()
                        setTimerTime(25, 0)
                    }}
                >
                    Work Time
                </Button>
                <Button
                    onClick={() => {
                        stopTimer()
                        setTimerTime(5, 0)
                    }}
                >
                    Break Time
                </Button>
                <Button
                    onClick={() => {
                        stopTimer()
                        setTimerTime(30, 0)
                    }}
                >
                    Long Break Time
                </Button>
            </div>
            <div className="relative flex h-50 overflow-hidden py-10 text-center text-9xl">
                <div className="to-background/0 from-background absolute top-0 z-50 h-10 w-full bg-linear-to-b" />
                <div className="relative h-30 w-20">
                    <div
                        className="absolute left-0 flex flex-col gap-2 transition-all duration-300 ease-in-out"
                        ref={minutesTensRef}
                        style={{ top: '-896px' }}
                    >
                        {NUMBERS.map((number) => (
                            <span className="z-10 flex h-30 w-20 items-center justify-center" key={`1-${number}`}>
                                {number}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="relative h-30 w-20">
                    <div
                        className="absolute left-0 flex flex-col gap-2 transition-all duration-300 ease-in-out"
                        ref={minutesRef}
                        style={{ top: '-512px' }}
                    >
                        {NUMBERS.map((number) => (
                            <span className="z-10 flex h-30 w-20 items-center justify-center" key={`1-${number}`}>
                                {number}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-center">:</div>
                <div className="relative h-30 w-20">
                    <div
                        className="absolute left-0 flex flex-col gap-2 transition-all duration-300 ease-in-out"
                        ref={secondsTensRef}
                        style={{ top: '-1152px' }}
                    >
                        {NUMBERS.map((number) => (
                            <span className="z-10 flex h-30 w-20 items-center justify-center" key={`1-${number}`}>
                                {number}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="relative h-30 w-20">
                    <div
                        className="absolute left-0 flex flex-col gap-2 transition-all duration-300 ease-in-out"
                        ref={secondsRef}
                        style={{ top: '-1152px' }}
                    >
                        {NUMBERS.map((number) => (
                            <span className="z-10 flex h-30 w-20 items-center justify-center" key={`1-${number}`}>
                                {number}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="from-background/0 to-background absolute bottom-0 z-50 h-10 w-full bg-linear-to-b" />
            </div>
            <div className="flex gap-4">
                <Button onClick={startTimer}>Start</Button>
                <Button onClick={stopTimer}>Stop</Button>
            </div>
        </div>
    )
}
