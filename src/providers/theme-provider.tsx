import { createContext, use, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Appearance, Palette, ThemeMode } from '@/lib/themes'
import {
  APPEARANCE_KEY,
  MEDIA,
  PRESETS,
  applyAppearance,
  getPalette,
  paletteSchema,
  parseAppearance,
  readAppearance,
  resolveMode,
} from '@/lib/themes'

export type Theme = ThemeMode

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedMode: 'light' | 'dark'
  palette: Palette
  customThemes: Array<Palette>
  selectPalette: (id: string) => void
  savePalette: (palette: Palette) => void
  deletePalette: (id: string) => void
  storageError: boolean
}

const ThemeProviderContext = createContext<ThemeProviderState | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Appearance>(readAppearance)
  const [resolvedMode, setResolvedMode] = useState(() => resolveMode(settings.mode))
  const [storageError, setStorageError] = useState(false)

  useLayoutEffect(() => {
    setResolvedMode(applyAppearance(settings))
  }, [settings])

  useEffect(() => {
    try {
      localStorage.setItem(APPEARANCE_KEY, JSON.stringify(settings))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [settings])

  useEffect(() => {
    const media = window.matchMedia(MEDIA)
    const update = () => setResolvedMode(applyAppearance(settings))
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [settings])

  useEffect(() => {
    const update = (event: StorageEvent) => {
      if (event.key === APPEARANCE_KEY || event.key === null) setSettings(parseAppearance(event.newValue))
    }
    window.addEventListener('storage', update)
    return () => window.removeEventListener('storage', update)
  }, [])

  const setTheme = useCallback((mode: Theme) => setSettings((previous) => ({ ...previous, mode })), [])
  const selectPalette = useCallback((paletteId: string) => {
    setSettings((previous) =>
      [...PRESETS, ...previous.customThemes].some((item) => item.id === paletteId)
        ? { ...previous, paletteId }
        : previous,
    )
  }, [])
  const savePalette = useCallback((palette: Palette) => {
    const validated = paletteSchema.parse(palette)
    if (PRESETS.some((preset) => preset.id === validated.id)) return
    setSettings((previous) => ({
      ...previous,
      paletteId: validated.id,
      customThemes: previous.customThemes.some((item) => item.id === validated.id)
        ? previous.customThemes.map((item) => (item.id === validated.id ? validated : item))
        : [...previous.customThemes, validated],
    }))
  }, [])
  const deletePalette = useCallback((id: string) => {
    setSettings((previous) => ({
      ...previous,
      paletteId: previous.paletteId === id ? 'nord' : previous.paletteId,
      customThemes: previous.customThemes.filter((item) => item.id !== id),
    }))
  }, [])

  const value = useMemo(
    () => ({
      theme: settings.mode,
      setTheme,
      resolvedMode,
      palette: getPalette(settings),
      customThemes: settings.customThemes,
      selectPalette,
      savePalette,
      deletePalette,
      storageError,
    }),
    [settings, setTheme, resolvedMode, selectPalette, savePalette, deletePalette, storageError],
  )

  return <ThemeProviderContext value={value}>{children}</ThemeProviderContext>
}

export const useTheme = () => {
  const context = use(ThemeProviderContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
