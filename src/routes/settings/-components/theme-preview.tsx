import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BarChart, ChartBar, ClipboardList, Settings } from 'lucide-react'
import type { ThemeColors } from '@/lib/themes'
import type { IndividualMode, TimerMode } from '@/providers/timer-provider'
import { themeStyle } from '@/lib/themes'
import { Button } from '@/components/ui/button'
import { HomeLayout } from '@/routes/-components/home-layout'
import { TopBarView } from '@/routes/-components/top-bar'
import { TimerView } from '@/routes/-components/timer'
import { BottomBarView } from '@/routes/-components/bottom-bar'

const PREVIEW_WIDTH = 420
const TRACKS = ['A Cozy Day', 'Café Theme', 'Chill Lo-Fi']
const PHASE_SECONDS: Record<IndividualMode, number> = { work: 25 * 60, break: 5 * 60, longBreak: 15 * 60 }

export function ThemePreview({ colors, compact = false }: { colors: ThemeColors; compact?: boolean }) {
  const container = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const [mode, setMode] = useState<TimerMode>('infinite')
  const [individualMode, setIndividualMode] = useState<IndividualMode>('work')
  const [remainingSeconds, setRemainingSeconds] = useState(PHASE_SECONDS.work)
  const [isRunning, setIsRunning] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [track, setTrack] = useState(0)
  const [progress, setProgress] = useState(45)
  const [volume, setVolume] = useState(0.45)
  const previousVolume = useRef(volume)
  const height = compact ? 600 : 720

  // Scale the same home layout as a complete viewport, including its controls and digit reels.
  useLayoutEffect(() => {
    const element = container.current
    if (!element) return
    const update = () => setScale(element.clientWidth / PREVIEW_WIDTH)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isRunning || remainingSeconds === 0) return
    const timeout = window.setTimeout(() => {
      setRemainingSeconds(remainingSeconds - 1)
      if (remainingSeconds === 1) setIsRunning(false)
    }, 1000)
    return () => window.clearTimeout(timeout)
  }, [isRunning, remainingSeconds])

  const changePhase = (phase: IndividualMode) => {
    setIndividualMode(phase)
    setRemainingSeconds(PHASE_SECONDS[phase])
    setIsRunning(false)
  }

  return (
    <div
      ref={container}
      style={{
        ...themeStyle(colors),
        height: scale ? height * scale + 2 : undefined,
        aspectRatio: scale ? undefined : `${PREVIEW_WIDTH} / ${height}`,
      }}
      data-theme-preview={compact ? 'compact' : 'interactive'}
      aria-label={compact ? undefined : 'Vista previa de inicio'}
      role={compact ? undefined : 'region'}
      aria-hidden={compact || undefined}
      inert={compact || undefined}
      className="bg-background text-foreground relative w-full overflow-hidden rounded-xl border"
    >
      <div
        style={{ width: PREVIEW_WIDTH, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        className="absolute top-0 left-0"
      >
        <HomeLayout
          topBar={
            <TopBarView
              title={TRACKS[track]}
              progress={progress}
              duration={180}
              isPlaying={isPlaying}
              play={() => setIsPlaying(true)}
              pause={() => setIsPlaying(false)}
              seek={setProgress}
              next={() => {
                setTrack((track + 1) % TRACKS.length)
                setProgress(0)
              }}
              statsAction={
                <Button size="icon" aria-label="Estadísticas (vista previa)" aria-disabled tabIndex={-1}>
                  <BarChart />
                </Button>
              }
              settingsAction={
                <Button size="icon" aria-label="Configuración (vista previa)" aria-disabled tabIndex={-1}>
                  <Settings />
                </Button>
              }
            />
          }
          timer={
            <TimerView
              mode={mode}
              individualMode={individualMode}
              remainingSeconds={remainingSeconds}
              isRunning={isRunning}
              orderIndex={0}
              setMode={(next) => {
                setMode(next)
                setIsRunning(false)
                setRemainingSeconds(next === 'infinite' ? PHASE_SECONDS.work : PHASE_SECONDS[individualMode])
              }}
              setIndividualMode={changePhase}
              start={() => setIsRunning(true)}
              stop={() => setIsRunning(false)}
              reset={() =>
                setRemainingSeconds(mode === 'infinite' ? PHASE_SECONDS.work : PHASE_SECONDS[individualMode])
              }
            />
          }
          bottomBar={
            <BottomBarView
              volume={volume}
              setVolume={setVolume}
              toggleMute={() => {
                if (volume > 0) {
                  previousVolume.current = volume
                  setVolume(0)
                } else setVolume(previousVolume.current)
              }}
              sessionAction={
                <Button
                  variant="outline"
                  size="icon"
                  className="border-muted-foreground/20 shadow-sm"
                  aria-label="Estadísticas de la sesión (vista previa)"
                  aria-disabled
                  tabIndex={-1}
                >
                  <ChartBar />
                </Button>
              }
              tasksAction={
                <Button
                  variant="outline"
                  size="icon"
                  className="w-full rounded-none border-0 border-t"
                  aria-label="Tareas (vista previa)"
                  aria-disabled
                  tabIndex={-1}
                >
                  <ClipboardList />
                </Button>
              }
            />
          }
        />
      </div>
    </div>
  )
}
