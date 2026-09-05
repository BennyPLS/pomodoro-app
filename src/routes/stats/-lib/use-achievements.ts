import { useMemo } from 'react'
import type { Session } from '@/lib/db'
import { m } from '@/lib/i18n'

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

const FOCUS_DEFS = (): Array<FocusMilestoneDef> => [
  { id: 'getting-started', emoji: '🪄', title: m.starting(), badge: m.first_pomodoro(), thresholdSec: 25 * 60 },
  { id: 'warming-up', emoji: '⚡', title: m.warming_up(), badge: m.two_hour_streak(), thresholdSec: 2 * 60 * 60 },
  {
    id: 'focused-learner',
    emoji: '🔥',
    title: m.focused_apprentice(),
    badge: m.deep_worker(),
    thresholdSec: 10 * 60 * 60,
  },
  {
    id: 'consistency-master',
    emoji: '🚀',
    title: m.master_of_consistency(),
    badge: m.full_day_focus(),
    thresholdSec: 25 * 60 * 60,
  },
  { id: 'zen-mode', emoji: '🌟', title: m.zen_mode(), badge: m.focus_master(), thresholdSec: 50 * 60 * 60 },
  {
    id: 'elite-worker',
    emoji: '💎',
    title: m.elite_worker(),
    badge: m['100_hours_deep_work'](),
    thresholdSec: 100 * 60 * 60,
  },
]

const POMODORO_DEFS = (): Array<PomodoroMilestoneDef> => [
  { id: 'pomo-1', title: m.first_pomodoro(), thresholdCount: 1, emoji: '🥇' },
  { id: 'pomo-10', title: m.double_digits(), thresholdCount: 10, emoji: '🔟' },
  { id: 'pomo-25', title: m.pomodoro_apprentice(), thresholdCount: 25, emoji: '📚' },
  { id: 'pomo-50', title: m.focused_worker(), thresholdCount: 50, emoji: '💼' },
  { id: 'pomo-100', title: m.centurion(), thresholdCount: 100, emoji: '🏅' },
  { id: 'pomo-250', title: m.devoted_deep_work(), thresholdCount: 250, emoji: '🧠' },
  { id: 'pomo-500', title: m.time_alchemist(), thresholdCount: 500, emoji: '⏳' },
  { id: 'pomo-1000', title: m.pomodoro_legend(), thresholdCount: 1000, emoji: '🏆' },
]

const STREAK_DEFS = (): Array<StreakMilestoneDef> => [
  { id: 'streak-2', title: m.building_momentum(), thresholdDays: 2, emoji: '🚶' },
  { id: 'streak-5', title: m.consistent_performer(), thresholdDays: 5, emoji: '🏃' },
  { id: 'streak-7', title: m.one_week_streak(), thresholdDays: 7, emoji: '📅' },
  { id: 'streak-14', title: m.two_weeks_strong(), thresholdDays: 14, emoji: '💪' },
  { id: 'streak-30', title: m.habit_master(), thresholdDays: 30, emoji: '🏆' },
]

export function useAchievements(sessions: Array<Session> | null | undefined, streakDays: number) {
  return useMemo(() => {
    const totalWorkSec = (sessions ?? []).reduce((acc, s) => (s.type === 'work' ? acc + s.duration : acc), 0)
    const completedPomodoros = (sessions ?? []).reduce((acc, s) => acc + (s.type === 'work' && s.completed ? 1 : 0), 0)

    const focus: Array<FocusMilestone> = FOCUS_DEFS().map((item) => {
      const earned = totalWorkSec >= item.thresholdSec
      const progressPct = Math.min(100, (totalWorkSec / item.thresholdSec) * 100)
      const remainingSec = Math.max(0, item.thresholdSec - totalWorkSec)
      return { ...item, earned, progressPct, remainingSec }
    })

    const pomodoro: Array<PomodoroMilestone> = POMODORO_DEFS().map((item) => {
      const earned = completedPomodoros >= item.thresholdCount
      const progressPct = Math.min(100, (completedPomodoros / item.thresholdCount) * 100)
      const remainingCount = Math.max(0, item.thresholdCount - completedPomodoros)
      return { ...item, earned, progressPct, remainingCount }
    })

    const streak: Array<StreakMilestone> = STREAK_DEFS().map((item) => {
      const earned = streakDays >= item.thresholdDays
      const progressPct = Math.min(100, (streakDays / item.thresholdDays) * 100)
      const remainingDays = Math.max(0, item.thresholdDays - streakDays)
      return { ...item, earned, progressPct, remainingDays }
    })

    const nextStreak = streak.find((item) => !item.earned) ?? null

    return {
      totals: { totalWorkSec, completedPomodoros, streakDays },
      focus,
      pomodoro,
      streak,
      nextStreak,
    }
  }, [sessions, streakDays])
}
