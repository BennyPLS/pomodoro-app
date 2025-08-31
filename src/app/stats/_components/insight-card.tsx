export function InsightCard(props: { title: string; value: string; hint?: string }) {
    const { title, value, hint } = props
    return (
        <div className="bg-card/50 rounded-lg border p-4">
            <div className="text-muted-foreground text-sm">{title}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
            {hint ? <div className="text-muted-foreground mt-1 text-xs">{hint}</div> : null}
        </div>
    )
}
