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
import { m } from '@/lib/i18n'
import { useTheme } from '@/providers/theme-provider'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ThemeEditor } from '@/routes/settings/-components/theme-editor'

const MODES = [
  { value: 'light', label: () => m.mode_light(), icon: Sun },
  { value: 'dark', label: () => m.mode_dark(), icon: Moon },
  { value: 'system', label: () => m.mode_system(), icon: Monitor },
] as const
const PALETTE_COLORS = ['primary', 'accent', 'secondary'] as const

export function AppearanceSettings() {
  const { theme, setTheme, resolvedMode, palette, customThemes, selectPalette, deletePalette, storageError } =
    useTheme()
  const [editor, setEditor] = useState<{ initial: Palette; editing: boolean } | null>(null)
  const create = (source: Palette) =>
    setEditor({
      initial: { ...source, id: crypto.randomUUID(), name: m.theme_copy_name({ name: source.name.slice(0, 30) }) },
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
      link.download = `${name || m.theme_file_fallback()}.json`
      document.body.append(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setFileError(m.theme_export_failed())
    }
  }

  const importTheme = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    setFileError(null)
    setImporting(true)
    try {
      if (customThemes.length >= 100) throw new Error(m.theme_limit_reached())
      if (file.size > 1024 * 1024) throw new Error(m.theme_file_too_large())
      const imported = parseThemeFile(await file.text())
      setEditor({ initial: { ...imported, id: crypto.randomUUID() }, editing: false })
    } catch (error) {
      setFileError(error instanceof Error ? error.message : m.theme_file_unreadable())
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
            {m.appearance()}
          </h2>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-medium">{m.appearance_mode()}</h3>
        </div>
        <div role="group" aria-label={m.appearance_mode()} className="bg-muted flex shrink-0 gap-1 rounded-lg p-1">
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
              {label()}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{m.choose_theme()}</h3>
        <span className="text-muted-foreground text-xs" role="status">
          {m.current_theme({
            name: palette.name,
            mode: resolvedMode === 'light' ? m.mode_light() : m.mode_dark(),
          })}
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
          {importing ? m.importing() : m.import_json()}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportTheme(palette)}
          title={m.export_theme_named({ name: palette.name })}
        >
          <Download />
          {m.export_current_theme()}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          className="hidden"
          aria-label={m.theme_json_file()}
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
                aria-label={m.apply_theme_named({ name: item.name })}
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
                      aria-label={m.theme_options_named({ name: item.name })}
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setEditor({ initial: item, editing: true })}>
                      <Pencil />
                      {m.edit()}
                    </DropdownMenuItem>

                    <DropdownMenuItem disabled={customThemes.length >= 100} onSelect={() => create(item)}>
                      <Copy />
                      {m.duplicate()}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => exportTheme(item)}>
                      <Download />
                      {m.export_json()}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => deletePalette(item.id)}
                    >
                      <Trash2 />
                      {m.delete_theme()}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-2 size-8 -translate-y-1/2"
                  aria-label={m.customize_theme_named({ name: item.name })}
                  title={m.customize_theme_named({ name: item.name })}
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
          <span className="text-sm font-semibold">{m.create_theme()}</span>
        </Button>
      </div>
      {storageError && (
        <p role="alert" className="text-destructive mt-2 text-sm">
          {m.theme_storage_error()}
        </p>
      )}
      {editor && <ThemeEditor initial={editor.initial} editing={editor.editing} onClose={() => setEditor(null)} />}
    </section>
  )
}
