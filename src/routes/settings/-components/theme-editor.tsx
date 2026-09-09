import { useState } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import type { ColorKey, Palette, ResolvedMode, ThemeColors } from '@/lib/themes'
import { COLOR_KEYS, PRESETS, contrastRatio, hexSchema, paletteSchema } from '@/lib/themes'
import { m } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ColorPicker } from '@/components/ui/color-picker'
import { ExpandableCard } from '@/components/ui/expandable-card'
import { FieldLegend, FieldSet } from '@/components/ui/field'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useTheme } from '@/providers/theme-provider'
import { ThemePreview } from '@/routes/settings/-components/theme-preview'

const MAIN_COLORS: Array<ColorKey> = ['background', 'card', 'foreground', 'primary', 'accent', 'border']
// Label getters, not strings: messages have to be read on every render so switching
// the locale relabels the editor.
const LABELS: Record<ColorKey, () => string> = {
  background: () => m.color_background(),
  foreground: () => m.color_foreground(),
  card: () => m.color_card(),
  'card-foreground': () => m.color_card_foreground(),
  popover: () => m.color_popover(),
  'popover-foreground': () => m.color_popover_foreground(),
  primary: () => m.color_primary(),
  'primary-foreground': () => m.color_primary_foreground(),
  secondary: () => m.color_secondary(),
  'secondary-foreground': () => m.color_secondary_foreground(),
  muted: () => m.color_muted(),
  'muted-foreground': () => m.color_muted_foreground(),
  accent: () => m.color_accent(),
  'accent-foreground': () => m.color_accent_foreground(),
  destructive: () => m.color_destructive(),
  'destructive-foreground': () => m.color_destructive_foreground(),
  border: () => m.color_border(),
  input: () => m.color_input(),
  ring: () => m.color_ring(),
  'chart-1': () => m.color_chart_1(),
  'chart-2': () => m.color_chart_2(),
  'chart-3': () => m.color_chart_3(),
  'chart-4': () => m.color_chart_4(),
  'chart-5': () => m.color_chart_5(),
}
const PAIRS: Array<[ColorKey, ColorKey, () => string]> = [
  ['foreground', 'background', () => m.color_foreground()],
  ['card-foreground', 'card', () => m.contrast_surfaces()],
  ['primary-foreground', 'primary', () => m.contrast_buttons()],
  ['muted-foreground', 'muted', () => m.color_muted_foreground()],
  ['accent-foreground', 'accent', () => m.color_accent()],
  ['secondary-foreground', 'secondary', () => m.color_secondary()],
  ['popover-foreground', 'popover', () => m.color_popover()],
  ['destructive-foreground', 'destructive', () => m.color_destructive()],
]

export function ThemeEditor({
  initial,
  editing,
  onClose,
}: {
  initial: Palette
  editing: boolean
  onClose: () => void
}) {
  const { savePalette, resolvedMode } = useTheme()
  const [draft, setDraft] = useState<Palette>(initial)
  const [mode, setMode] = useState<ResolvedMode>(resolvedMode)
  const [baseId, setBaseId] = useState('')
  const [baseline, setBaseline] = useState(initial)
  const valid = paletteSchema.safeParse(draft).success
  const colors = Object.fromEntries(
    COLOR_KEYS.map((key) => [
      key,
      hexSchema.safeParse(draft[mode][key]).success ? draft[mode][key] : baseline[mode][key],
    ]),
  ) as ThemeColors
  const contrast = PAIRS.map(([text, background, label]) => ({
    label: label(),
    ratio: contrastRatio(colors[text], colors[background]),
  }))
  const lowContrast = contrast.filter((pair) => pair.ratio < 4.5)

  const changeColor = (key: ColorKey, value: string) =>
    setDraft((previous) => ({ ...previous, [mode]: { ...previous[mode], [key]: value } }))
  const field = (key: ColorKey, label: string) => {
    const id = `theme-${mode}-${key}`
    const invalid = !hexSchema.safeParse(draft[mode][key]).success
    return (
      <div key={key} className="space-y-1.5">
        <Label htmlFor={id} className="text-xs">
          {label}
        </Label>
        <div className="flex gap-2">
          <ColorPicker label={label} value={colors[key]} onValueChange={(value) => changeColor(key, value)} />
          <Input
            id={id}
            value={draft[mode][key]}
            onChange={(event) => changeColor(key, event.target.value)}
            aria-invalid={invalid}
            aria-describedby={invalid ? `${id}-error` : undefined}
            spellCheck={false}
            maxLength={7}
            className="min-w-0 font-mono text-xs"
          />
        </div>
        {invalid && (
          <p id={`${id}-error`} className="text-destructive text-xs">
            {m.hex_hint()}
          </p>
        )}
      </div>
    )
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-5xl">
        <div className="pr-8">
          <DialogTitle>{editing ? m.edit_theme() : m.create_theme()}</DialogTitle>
          <DialogDescription className="mt-2">{m.theme_editor_description()}</DialogDescription>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (valid) {
              savePalette(draft)
              onClose()
            }
          }}
        >
          <div className="grid gap-6 md:grid-cols-[1fr_360px]">
            <div className="min-w-0 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="theme-name">{m.theme_name()}</Label>
                <Input
                  id="theme-name"
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  maxLength={40}
                  required
                  placeholder={m.theme_name_placeholder()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme-base">{m.start_from_preset()}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button id="theme-base" variant="outline" className="w-full justify-between font-normal">
                      {PRESETS.find((preset) => preset.id === baseId)?.name ?? m.original_theme_colors()}
                      <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                    <DropdownMenuRadioGroup
                      value={baseId}
                      onValueChange={(value) => {
                        const preset = PRESETS.find((item) => item.id === value)
                        if (!preset) return
                        setBaseId(preset.id)
                        const next = { ...preset, id: draft.id, name: draft.name }
                        setDraft(next)
                        setBaseline(next)
                      }}
                    >
                      {PRESETS.map((preset) => (
                        <DropdownMenuRadioItem key={preset.id} value={preset.id}>
                          {preset.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <p className="text-muted-foreground text-xs">{m.preset_replaces_variants()}</p>
              </div>
              <FieldSet className="gap-0">
                <FieldLegend variant="label">{m.editing_variant()}</FieldLegend>
                <div className="bg-muted flex gap-1 rounded-lg p-1">
                  {(['light', 'dark'] as const).map((item) => (
                    <Button
                      key={item}
                      className="flex-1"
                      variant={mode === item ? 'default' : 'ghost'}
                      aria-pressed={mode === item}
                      onClick={() => setMode(item)}
                    >
                      {item === 'light' ? m.variant_light() : m.variant_dark()}
                    </Button>
                  ))}
                </div>
              </FieldSet>
              <div className="grid grid-cols-2 gap-4">{MAIN_COLORS.map((key) => field(key, LABELS[key]()))}</div>
              <ExpandableCard title={m.advanced_colors()}>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {COLOR_KEYS.filter((key) => !MAIN_COLORS.includes(key)).map((key) => field(key, LABELS[key]()))}
                </div>
              </ExpandableCard>
              <Button variant="ghost" size="sm" onClick={() => setDraft({ ...draft, [mode]: { ...baseline[mode] } })}>
                <RotateCcw /> {mode === 'light' ? m.reset_light_variant() : m.reset_dark_variant()}
              </Button>
            </div>
            <aside className="min-w-0">
              <div className="space-y-3 md:sticky md:top-0">
                <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                  {m.preview_home_variant({ variant: mode === 'light' ? m.variant_light() : m.variant_dark() })}
                </p>
                <p className="text-muted-foreground text-xs">{m.theme_preview_hint()}</p>
                <ThemePreview colors={colors} />
                <ExpandableCard
                  title={
                    lowContrast.length ? m.low_contrast_count({ count: lowContrast.length }) : m.good_text_contrast()
                  }
                >
                  <p className="text-muted-foreground mt-2">{m.contrast_reference()}</p>
                  <ul className="mt-2 space-y-1">
                    {contrast.map((pair) => (
                      <li key={pair.label} className="flex justify-between gap-2">
                        <span>{pair.label}</span>
                        <span>
                          {pair.ratio.toFixed(2)}:1 {pair.ratio < 4.5 ? m.contrast_review() : m.contrast_ok()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </ExpandableCard>
                <p className="text-muted-foreground text-xs">{m.theme_variants_note()}</p>
              </div>
            </aside>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={onClose}>
              {m.cancel()}
            </Button>
            <Button type="submit" disabled={!valid}>
              {m.save_and_apply()}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
