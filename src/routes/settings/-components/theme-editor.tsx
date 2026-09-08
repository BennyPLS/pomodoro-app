import { useState } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import type { ColorKey, Palette, ResolvedMode, ThemeColors } from '@/lib/themes'
import { COLOR_KEYS, PRESETS, contrastRatio, hexSchema, paletteSchema } from '@/lib/themes'
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

const MAIN_COLORS: Array<[ColorKey, string]> = [
  ['background', 'Fondo'],
  ['card', 'Superficie'],
  ['foreground', 'Texto'],
  ['primary', 'Principal'],
  ['accent', 'Acento'],
  ['border', 'Bordes'],
]
const LABELS: Record<ColorKey, string> = {
  background: 'Fondo',
  foreground: 'Texto',
  card: 'Superficie',
  'card-foreground': 'Texto de superficie',
  popover: 'Menús',
  'popover-foreground': 'Texto de menús',
  primary: 'Principal',
  'primary-foreground': 'Texto sobre principal',
  secondary: 'Secundario',
  'secondary-foreground': 'Texto sobre secundario',
  muted: 'Fondo sutil',
  'muted-foreground': 'Texto secundario',
  accent: 'Acento',
  'accent-foreground': 'Texto sobre acento',
  destructive: 'Error',
  'destructive-foreground': 'Texto de error',
  border: 'Bordes',
  input: 'Bordes de campos',
  ring: 'Indicador de foco',
  'chart-1': 'Gráfico 1',
  'chart-2': 'Gráfico 2',
  'chart-3': 'Gráfico 3',
  'chart-4': 'Gráfico 4',
  'chart-5': 'Gráfico 5',
}
const PAIRS: Array<[ColorKey, ColorKey, string]> = [
  ['foreground', 'background', 'Texto'],
  ['card-foreground', 'card', 'Superficies'],
  ['primary-foreground', 'primary', 'Botones'],
  ['muted-foreground', 'muted', 'Texto secundario'],
  ['accent-foreground', 'accent', 'Acento'],
  ['secondary-foreground', 'secondary', 'Secundario'],
  ['popover-foreground', 'popover', 'Menús'],
  ['destructive-foreground', 'destructive', 'Error'],
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
    label,
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
            Usa un color como #a4cea0.
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
          <DialogTitle>{editing ? 'Editar tema' : 'Crear tema'}</DialogTitle>
          <DialogDescription className="mt-2">
            Dale tu toque a cada sesión. Los cambios se aplican al guardar.
          </DialogDescription>
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
                <Label htmlFor="theme-name">Nombre del tema</Label>
                <Input
                  id="theme-name"
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  maxLength={40}
                  required
                  placeholder="Mi rincón de calma"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme-base">Empezar desde un preset</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button id="theme-base" variant="outline" className="w-full justify-between font-normal">
                      {PRESETS.find((preset) => preset.id === baseId)?.name ?? 'Colores del tema original'}
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
                <p className="text-muted-foreground text-xs">Reemplaza los colores de las dos variantes.</p>
              </div>
              <FieldSet className="gap-0">
                <FieldLegend variant="label">Variante que estás editando</FieldLegend>
                <div className="bg-muted flex gap-1 rounded-lg p-1">
                  {(['light', 'dark'] as const).map((item) => (
                    <Button
                      key={item}
                      className="flex-1"
                      variant={mode === item ? 'default' : 'ghost'}
                      aria-pressed={mode === item}
                      onClick={() => setMode(item)}
                    >
                      {item === 'light' ? 'Clara' : 'Oscura'}
                    </Button>
                  ))}
                </div>
              </FieldSet>
              <div className="grid grid-cols-2 gap-4">{MAIN_COLORS.map(([key, label]) => field(key, label))}</div>
              <ExpandableCard title="Colores avanzados">
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {COLOR_KEYS.filter((key) => !MAIN_COLORS.some(([main]) => main === key)).map((key) =>
                    field(key, LABELS[key]),
                  )}
                </div>
              </ExpandableCard>
              <Button variant="ghost" size="sm" onClick={() => setDraft({ ...draft, [mode]: { ...baseline[mode] } })}>
                <RotateCcw /> Restablecer variante {mode === 'light' ? 'clara' : 'oscura'}
              </Button>
            </div>
            <aside className="min-w-0">
              <div className="space-y-3 md:sticky md:top-0">
                <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                  Inicio · {mode === 'light' ? 'Clara' : 'Oscura'}
                </p>
                <p className="text-muted-foreground text-xs">
                  Prueba el temporizador y los controles de inicio con tus colores.
                </p>
                <ThemePreview colors={colors} />
                <ExpandableCard
                  title={
                    lowContrast.length
                      ? `${lowContrast.length} combinaciones con contraste bajo`
                      : 'Buen contraste de texto'
                  }
                >
                  <p className="text-muted-foreground mt-2">
                    Referencia para texto normal: 4.5:1. Puedes guardar y seguir ajustando.
                  </p>
                  <ul className="mt-2 space-y-1">
                    {contrast.map((pair) => (
                      <li key={pair.label} className="flex justify-between gap-2">
                        <span>{pair.label}</span>
                        <span>
                          {pair.ratio.toFixed(2)}:1 {pair.ratio < 4.5 ? '· Revisar' : '· OK'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </ExpandableCard>
                <p className="text-muted-foreground text-xs">
                  Cada tema incluye una variante clara y otra oscura. Personaliza ambas antes de guardar.
                </p>
              </div>
            </aside>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!valid}>
              Guardar y aplicar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
