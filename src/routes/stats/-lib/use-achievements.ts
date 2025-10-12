import { useMemo } from 'react'
import type { Session } from '@/lib/db'

export type FocusMilestoneDef = {
  id: string
  emoji: string
  title: string
  badge: string
  thresholdSec: number
}

export type FocusMilestone = FocusMilestoneDef & {
  earned: boolean
  progressPct: number
  remainingSec: number
}

export type PomodoroMilestoneDef = {
  id: string
  title: string
  thresholdCount: number
  emoji?: string
}

export type PomodoroMilestone = PomodoroMilestoneDef & {
  earned: boolean
  progressPct: number
  remainingCount: number
}

export type StreakMilestoneDef = {
  id: string
  title: string
  thresholdDays: number
  emoji?: string
}

export type StreakMilestone = StreakMilestoneDef & {
  earned: boolean
  progressPct: number
  remainingDays: number
}

const FOCUS_DEFS: Array<FocusMilestoneDef> = [
  { id: 'getting-started', emoji: '🪄', title: 'Empezando', badge: '¡Primer Pomodoro!', thresholdSec: 25 * 60 },
  { id: 'warming-up', emoji: '⚡', title: 'Entrando en calor', badge: 'Racha de 2 horas', thresholdSec: 2 * 60 * 60 },
  {
    id: 'focused-learner',
    emoji: '🔥',
    title: 'Aprendiz enfocado',
    badge: 'Trabajador profundo',
    thresholdSec: 10 * 60 * 60,
  },
  {
    id: 'consistency-master',
    emoji: '🚀',
    title: 'Maestro de la constancia',
    badge: 'Un día completo de enfoque',
    thresholdSec: 25 * 60 * 60,
  },
  { id: 'zen-mode', emoji: '🌟', title: 'Modo Zen', badge: 'Maestro del enfoque', thresholdSec: 50 * 60 * 60 },
  {
    id: 'elite-worker',
    emoji: '💎',
    title: 'Trabajador de élite',
    badge: '100 horas de trabajo profundo',
    thresholdSec: 100 * 60 * 60,
  },
]

const POMODORO_DEFS: Array<PomodoroMilestoneDef> = [
  { id: 'pomo-1', title: '¡Primer Pomodoro!', thresholdCount: 1, emoji: '🥇' },
  { id: 'pomo-10', title: 'Doble dígito', thresholdCount: 10, emoji: '🔟' },
  { id: 'pomo-25', title: 'Aprendiz de Pomodoro', thresholdCount: 25, emoji: '📚' },
  { id: 'pomo-50', title: 'Trabajador enfocado', thresholdCount: 50, emoji: '💼' },
  { id: 'pomo-100', title: 'Centurión', thresholdCount: 100, emoji: '🏅' },
  { id: 'pomo-250', title: 'Devoto del trabajo profundo', thresholdCount: 250, emoji: '🧠' },
  { id: 'pomo-500', title: 'Alquimista del tiempo', thresholdCount: 500, emoji: '⏳' },
  { id: 'pomo-1000', title: 'Leyenda del Pomodoro', thresholdCount: 1000, emoji: '🏆' },
]

const STREAK_DEFS: Array<StreakMilestoneDef> = [
  { id: 'streak-2', title: 'Construyendo momento', thresholdDays: 2, emoji: '🚶' },
  { id: 'streak-5', title: 'Intérprete consistente', thresholdDays: 5, emoji: '🏃' },
  { id: 'streak-7', title: 'Racha de 1 semana', thresholdDays: 7, emoji: '📅' },
  { id: 'streak-14', title: 'Dos semanas fuertes', thresholdDays: 14, emoji: '💪' },
  { id: 'streak-30', title: 'Maestro del hábito', thresholdDays: 30, emoji: '🏆' },
]

export function useAchievements(sessions: Array<Session> | null | undefined, streakDays: number) {
  return useMemo(() => {
    const totalWorkSec = (sessions ?? []).reduce((acc, s) => (s.type === 'work' ? acc + s.duration : acc), 0)
    const completedPomodoros = (sessions ?? []).reduce((acc, s) => acc + (s.type === 'work' && s.completed ? 1 : 0), 0)

    const focus: Array<FocusMilestone> = FOCUS_DEFS.map((m) => {
      const earned = totalWorkSec >= m.thresholdSec
      const progressPct = Math.min(100, (totalWorkSec / m.thresholdSec) * 100)
      const remainingSec = Math.max(0, m.thresholdSec - totalWorkSec)
      return { ...m, earned, progressPct, remainingSec }
    })

    const pomodoro: Array<PomodoroMilestone> = POMODORO_DEFS.map((m) => {
      const earned = completedPomodoros >= m.thresholdCount
      const progressPct = Math.min(100, (completedPomodoros / m.thresholdCount) * 100)
      const remainingCount = Math.max(0, m.thresholdCount - completedPomodoros)
      return { ...m, earned, progressPct, remainingCount }
    })

    const streak: Array<StreakMilestone> = STREAK_DEFS.map((m) => {
      const earned = streakDays >= m.thresholdDays
      const progressPct = Math.min(100, (streakDays / m.thresholdDays) * 100)
      const remainingDays = Math.max(0, m.thresholdDays - streakDays)
      return { ...m, earned, progressPct, remainingDays }
    })

    const nextStreak = streak.find((m) => !m.earned) ?? null

    return {
      totals: { totalWorkSec, completedPomodoros, streakDays },
      focus,
      pomodoro,
      streak,
      nextStreak,
    }
  }, [sessions, streakDays])
}
