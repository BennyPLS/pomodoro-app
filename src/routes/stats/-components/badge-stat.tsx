export function BadgeStat(props: { label: string; value: string; className?: string }) {
  const { label, value, className } = props
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 ${className ?? 'bg-foreground/10 text-foreground'}`}
    >
      <span className="text-xs">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
