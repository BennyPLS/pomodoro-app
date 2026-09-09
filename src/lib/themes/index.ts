import { z } from 'zod'
import { m } from '@/lib/i18n'

export const COLOR_KEYS = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
] as const
export type ColorKey = (typeof COLOR_KEYS)[number]
export type ThemeColors = Record<ColorKey, string>
export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedMode = 'light' | 'dark'
export type Palette = { id: string; name: string; light: ThemeColors; dark: ThemeColors }

const nord: Palette = {
  id: 'nord',
  name: 'Nord',
  light: {
    background: '#fafcff',
    foreground: '#4d576a',
    card: '#fafcff',
    'card-foreground': '#4d576a',
    popover: '#fafcff',
    'popover-foreground': '#4d576a',
    primary: '#5d81ac',
    'primary-foreground': '#d8dee9',
    secondary: '#d8dee9',
    'secondary-foreground': '#5d81ac',
    muted: '#d8dee9',
    'muted-foreground': '#8e97a9',
    accent: '#8fbcbb',
    'accent-foreground': '#4d576a',
    destructive: '#be6069',
    'destructive-foreground': '#d8dee9',
    border: '#c4c9d4',
    input: '#c4c9d4',
    ring: '#5d81ac',
    'chart-1': '#5b85ae',
    'chart-2': '#899bbd',
    'chart-3': '#c46ec4',
    'chart-4': '#f9d33a',
    'chart-5': '#6f4db3',
  },
  dark: {
    background: '#2f3541',
    foreground: '#d8dee9',
    card: '#3c4353',
    'card-foreground': '#d8dee9',
    popover: '#3c4353',
    'popover-foreground': '#d8dee9',
    primary: '#81a1c1',
    'primary-foreground': '#2f3541',
    secondary: '#505868',
    'secondary-foreground': '#d8dee9',
    muted: '#505868',
    'muted-foreground': '#abb2bf',
    accent: '#87bfcf',
    'accent-foreground': '#d8dee9',
    destructive: '#be6069',
    'destructive-foreground': '#d8dee9',
    border: '#505868',
    input: '#505868',
    ring: '#81a1c1',
    'chart-1': '#8eadcc',
    'chart-2': '#b7c2d7',
    'chart-3': '#c775c7',
    'chart-4': '#ffe47b',
    'chart-5': '#8669bf',
  },
}

function tintedPalette(id: string, name: string, light: Partial<ThemeColors>, dark: Partial<ThemeColors>): Palette {
  const variant = (base: ThemeColors, colors: Partial<ThemeColors>): ThemeColors => {
    const result = { ...base, ...colors }
    return {
      ...result,
      'card-foreground': result.foreground,
      popover: result.card,
      'popover-foreground': result.foreground,
      'secondary-foreground': result.foreground,
      muted: result.secondary,
      input: result.border,
      ring: result.primary,
    }
  }
  return { id, name, light: variant(nord.light, light), dark: variant(nord.dark, dark) }
}

export const PRESETS: Array<Palette> = [
  nord,
  // Catppuccin Latte / Mocha: https://catppuccin.com/palette/
  tintedPalette(
    'catppuccin',
    'Catppuccin',
    {
      background: '#eff1f5',
      foreground: '#4c4f69',
      card: '#e6e9ef',
      primary: '#8839ef',
      'primary-foreground': '#eff1f5',
      secondary: '#ccd0da',
      'muted-foreground': '#5c5f77',
      accent: '#ea76cb',
      'accent-foreground': '#4c4f69',
      destructive: '#d20f39',
      'destructive-foreground': '#eff1f5',
      border: '#bcc0cc',
      'chart-1': '#8839ef',
      'chart-2': '#179299',
      'chart-3': '#ea76cb',
      'chart-4': '#df8e1d',
      'chart-5': '#1e66f5',
    },
    {
      background: '#1e1e2e',
      foreground: '#cdd6f4',
      card: '#181825',
      primary: '#cba6f7',
      'primary-foreground': '#1e1e2e',
      secondary: '#313244',
      'muted-foreground': '#bac2de',
      accent: '#f5c2e7',
      'accent-foreground': '#1e1e2e',
      destructive: '#f38ba8',
      'destructive-foreground': '#1e1e2e',
      border: '#45475a',
      'chart-1': '#cba6f7',
      'chart-2': '#94e2d5',
      'chart-3': '#f5c2e7',
      'chart-4': '#f9e2af',
      'chart-5': '#89b4fa',
    },
  ),
  // Alucard Classic / Dracula Classic: https://draculatheme.com/spec
  tintedPalette(
    'dracula',
    'Dracula',
    {
      background: '#fffbeb',
      foreground: '#1f1f1f',
      card: '#efeddc',
      primary: '#644ac9',
      'primary-foreground': '#fffbeb',
      secondary: '#e2deca',
      'muted-foreground': '#6c664b',
      accent: '#a3144d',
      'accent-foreground': '#fffbeb',
      destructive: '#cb3a2a',
      'destructive-foreground': '#fffbeb',
      border: '#ceccc0',
      'chart-1': '#644ac9',
      'chart-2': '#14710a',
      'chart-3': '#a3144d',
      'chart-4': '#846e15',
      'chart-5': '#036a96',
    },
    {
      background: '#282a36',
      foreground: '#f8f8f2',
      card: '#343746',
      primary: '#bd93f9',
      'primary-foreground': '#282a36',
      secondary: '#44475a',
      'muted-foreground': '#d6acff',
      accent: '#ff79c6',
      'accent-foreground': '#282a36',
      destructive: '#ff5555',
      'destructive-foreground': '#282a36',
      border: '#6272a4',
      'chart-1': '#bd93f9',
      'chart-2': '#50fa7b',
      'chart-3': '#ff79c6',
      'chart-4': '#f1fa8c',
      'chart-5': '#8be9fd',
    },
  ),
  // Rosé Pine Dawn / Rosé Pine: https://rosepinetheme.com/palette/
  tintedPalette(
    'rose-pine',
    'Rosé Pine',
    {
      background: '#faf4ed',
      foreground: '#464261',
      card: '#fffaf3',
      primary: '#286983',
      'primary-foreground': '#fffaf3',
      secondary: '#f2e9e1',
      'muted-foreground': '#797593',
      accent: '#d7827e',
      'accent-foreground': '#191724',
      destructive: '#b4637a',
      'destructive-foreground': '#fffaf3',
      border: '#cecacd',
      'chart-1': '#286983',
      'chart-2': '#56949f',
      'chart-3': '#b4637a',
      'chart-4': '#ea9d34',
      'chart-5': '#907aa9',
    },
    {
      background: '#191724',
      foreground: '#e0def4',
      card: '#1f1d2e',
      primary: '#ebbcba',
      'primary-foreground': '#191724',
      secondary: '#26233a',
      'muted-foreground': '#908caa',
      accent: '#c4a7e7',
      'accent-foreground': '#191724',
      destructive: '#eb6f92',
      'destructive-foreground': '#191724',
      border: '#403d52',
      'chart-1': '#ebbcba',
      'chart-2': '#9ccfd8',
      'chart-3': '#eb6f92',
      'chart-4': '#f6c177',
      'chart-5': '#c4a7e7',
    },
  ),
]

export const APPEARANCE_KEY = 'pomodoro-appearance-v1'
export const MEDIA = '(prefers-color-scheme: dark)'
export const hexSchema = z.string().regex(/^#[0-9a-f]{6}$/i)
const colorsSchema = z.record(z.enum(COLOR_KEYS), hexSchema)
export const paletteSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().trim().min(1).max(40),
  light: colorsSchema,
  dark: colorsSchema,
})
const appearanceSchema = z.object({
  version: z.literal(1),
  mode: z.enum(['light', 'dark', 'system']),
  paletteId: z.string(),
  customThemes: z.array(paletteSchema).max(100),
})
export type Appearance = z.infer<typeof appearanceSchema>
export const DEFAULT_APPEARANCE: Appearance = { version: 1, mode: 'system', paletteId: 'nord', customThemes: [] }

export function parseAppearance(raw: string | null, legacyMode: string | null = null): Appearance {
  try {
    const result = appearanceSchema.safeParse(JSON.parse(raw ?? 'null'))
    if (result.success) {
      const settings = result.data
      const ids = new Set(PRESETS.map((palette) => palette.id))
      settings.customThemes = settings.customThemes.filter((palette) => {
        if (ids.has(palette.id)) return false
        ids.add(palette.id)
        return true
      })
      if (!ids.has(settings.paletteId)) settings.paletteId = 'nord'
      return settings
    }
  } catch {
    /* Invalid storage falls back to the original palette. */
  }
  return { ...DEFAULT_APPEARANCE, mode: legacyMode === 'light' || legacyMode === 'dark' ? legacyMode : 'system' }
}

export function readAppearance(): Appearance {
  try {
    return parseAppearance(localStorage.getItem(APPEARANCE_KEY), localStorage.getItem('theme'))
  } catch {
    return { ...DEFAULT_APPEARANCE }
  }
}

export function resolveMode(mode: ThemeMode): ResolvedMode {
  return mode === 'system' ? (window.matchMedia(MEDIA).matches ? 'dark' : 'light') : mode
}

export function getPalette(settings: Appearance): Palette {
  return [...PRESETS, ...settings.customThemes].find((palette) => palette.id === settings.paletteId) ?? PRESETS[0]
}

export function themeStyle(colors: ThemeColors): Record<string, string> {
  return Object.fromEntries(COLOR_KEYS.map((key) => [`--${key}`, colors[key]]))
}

export function applyAppearance(settings: Appearance): ResolvedMode {
  const mode = resolveMode(settings.mode)
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(mode)
  root.style.colorScheme = mode
  root.dataset.theme = settings.paletteId
  const colors = getPalette(settings)[mode]
  for (const key of COLOR_KEYS) root.style.setProperty(`--${key}`, colors[key])
  return mode
}

export function contrastRatio(first: string, second: string): number {
  const luminance = (hex: string) => {
    const rgb = [1, 3, 5].map((offset) => {
      const value = parseInt(hex.slice(offset, offset + 2), 16) / 255
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
  }
  const a = luminance(first)
  const b = luminance(second)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

const themeFileSchema = z.object({
  format: z.literal('pomodoro-theme'),
  version: z.literal(1),
  theme: paletteSchema.omit({ id: true }),
})

export function serializeThemeFile(palette: Palette): string {
  return `${JSON.stringify(themeFileSchema.parse({ format: 'pomodoro-theme', version: 1, theme: palette }), null, 2)}\n`
}

export function parseThemeFile(contents: string): Omit<Palette, 'id'> {
  let data: unknown
  try {
    data = JSON.parse(contents.replace(/^\uFEFF/, ''))
  } catch {
    throw new Error(m.theme_invalid_json())
  }
  const result = themeFileSchema.safeParse(data)
  if (!result.success) {
    throw new Error(m.theme_incompatible_file())
  }
  return result.data.theme
}
