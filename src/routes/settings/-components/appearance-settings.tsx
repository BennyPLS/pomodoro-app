import { useRef, useState } from 'react'
import {
  Copy,
  Download,
  Monitor,
  Moon,
  MoreHorizontal,
  Palette as PaletteIcon,
  Pencil,
  Plus,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react'
import type { ChangeEvent } from 'react'
import type { Palette } from '@/lib/themes'
import { PRESETS, parseThemeFile, serializeThemeFile } from '@/lib/themes'
import { useTheme } from '@/providers/theme-provider'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ThemeEditor } from '@/routes/settings/-components/theme-editor'

const MODES = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
] as const
const PALETTE_COLORS = ['primary', 'accent', 'secondary'] as const

export function AppearanceSettings() {
  const { theme, setTheme, resolvedMode, palette, customThemes, selectPalette, deletePalette, storageError } =
    useTheme()
  const [editor, setEditor] = useState<{ initial: Palette; editing: boolean } | null>(null)
  const create = (source: Palette) =>
    setEditor({
      initial: { ...source, id: crypto.randomUUID(), name: `${source.name.slice(0, 30)} · copia` },
      editing: false,
    })

  const fileInput = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const exportTheme = (source: Palette) => {
    setFileError(null)
    try {
      const blob = new Blob([serializeThemeFile(source)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const name = source.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()
      link.download = `${name || 'tema'}.json`
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setFileError('No se pudo exportar el tema. Inténtalo de nuevo.')
    }
  }

  const importTheme = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    setFileError(null)
    setImporting(true)
    try {
      if (customThemes.length >= 100)
        throw new Error('Ya tienes 100 temas guardados. Elimina uno antes de importar otro.')
      if (file.size > 1024 * 1024) throw new Error('El archivo es demasiado grande. El tamaño máximo es 1 MB.')
      const imported = parseThemeFile(await file.text())
      setEditor({ initial: { ...imported, id: crypto.randomUUID() }, editing: false })
    } catch (error) {
      setFileError(error instanceof Error ? error.message : 'No se pudo leer el archivo.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <section aria-labelledby="appearance-heading" className="bg-card rounded-2xl border p-5 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-primary/10 text-primary rounded-xl p-2.5">
          <PaletteIcon className="size-5" />
        </div>
        <div>
          <h2 id="appearance-heading" className="text-xl font-semibold">
            Apariencia
          </h2>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-medium">Modo de apariencia</h3>
        </div>
        <div role="group" aria-label="Modo de apariencia" className="bg-muted flex shrink-0 gap-1 rounded-lg p-1">
          {MODES.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              size="sm"
              className="flex-1"
              variant={theme === value ? 'default' : 'ghost'}
              aria-pressed={theme === value}
              onClick={() => setTheme(value)}
            >
              <Icon />
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Elige tu tema</h3>
        <span className="text-muted-foreground text-xs" role="status">
          Actual: {palette.name} · {resolvedMode === 'light' ? 'Claro' : 'Oscuro'}
        </span>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={importing || customThemes.length >= 100}
          onClick={() => fileInput.current?.click()}
        >
          <Upload />
          {importing ? 'Importando…' : 'Importar JSON'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportTheme(palette)} title={`Exportar ${palette.name}`}>
          <Download />
          Exportar tema actual
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          className="hidden"
          aria-label="Archivo de tema JSON"
          onChange={importTheme}
        />
      </div>
      {fileError && (
        <p role="alert" className="text-destructive mb-4 text-sm">
          {fileError}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {[...PRESETS, ...customThemes].map((item) => {
          const selected = item.id === palette.id
          const custom = customThemes.some((saved) => saved.id === item.id)
          return (
            <div key={item.id} className="relative min-w-0">
              <Button
                variant="outline"
                aria-label={`Aplicar tema ${item.name}`}
                aria-pressed={selected}
                onClick={() => selectPalette(item.id)}
                className={`h-16.5 w-full min-w-0 justify-start gap-3 rounded-xl p-2 pr-12 shadow-none ${selected ? 'border-primary bg-primary/5 ring-primary/20 ring-2' : 'hover:border-primary/50'}`}
              >
                <span
                  aria-hidden="true"
                  className="size-12 shrink-0 rounded-lg border"
                  style={{
                    backgroundImage: `linear-gradient(120deg, ${PALETTE_COLORS.map((key) => item[resolvedMode][key]).join(', ')})`,
                  }}
                />
                <span className="truncate text-sm font-semibold">{item.name}</span>
              </Button>
              {custom ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1/2 right-2 size-8 -translate-y-1/2"
                      aria-label={`Opciones de ${item.name}`}
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setEditor({ initial: item, editing: true })}>
                      <Pencil />
                      Editar
                    </DropdownMenuItem>

                    <DropdownMenuItem disabled={customThemes.length >= 100} onSelect={() => create(item)}>
                      <Copy />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => exportTheme(item)}>
                      <Download />
                      Exportar JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => deletePalette(item.id)}
                    >
                      <Trash2 />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-2 size-8 -translate-y-1/2"
                  aria-label={`Personalizar ${item.name}`}
                  title={`Personalizar ${item.name}`}
                  disabled={customThemes.length >= 100}
                  onClick={() => create(item)}
                >
                  <Pencil />
                </Button>
              )}
            </div>
          )
        })}
        <Button
          variant="outline"
          disabled={customThemes.length >= 100}
          onClick={() => setEditor({ initial: { ...palette, id: crypto.randomUUID(), name: '' }, editing: false })}
          className="hover:bg-muted/50 h-16.5 justify-start gap-3 rounded-xl border-dashed p-2"
        >
          <span className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-lg">
            <Plus className="size-5" />
          </span>
          <span className="text-sm font-semibold">Crear tema</span>
        </Button>
      </div>
      {storageError && (
        <p role="alert" className="text-destructive mt-2 text-sm">
          No se pudo guardar la apariencia en este navegador. Los cambios se mantendrán solo durante esta sesión.
        </p>
      )}
      {editor && <ThemeEditor initial={editor.initial} editing={editor.editing} onClose={() => setEditor(null)} />}
    </section>
  )
}
