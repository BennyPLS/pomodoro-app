export function ColorPicker({
  value,
  onValueChange,
  label,
}: {
  value: string
  onValueChange: (value: string) => void
  label: string
}) {
  return (
    <input
      type="color"
      aria-label={`Elegir color: ${label}`}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      className="border-input focus-visible:ring-ring size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-1 focus-visible:ring-1 focus-visible:outline-none"
    />
  )
}
