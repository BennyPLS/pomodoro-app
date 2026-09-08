import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import type { HourBucket } from '@/routes/stats/-lib/use-time-of-day'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { HourTooltip } from '@/routes/stats/-components/chart-tooltip'
import { hoursConfig } from '@/routes/stats/-lib/chart-data'
import { formatAxisMinutes, minuteAxis } from '@/routes/stats/-lib/utils'

/**
 * Focus minutes by hour of day, summed over the range.
 *
 * The peak is called out in the panel heading rather than by tinting its bar:
 * colour here is series identity, and shading one mark differently would be
 * encoding rank — the reader would have to guess whether the odd hue meant a
 * different kind of thing.
 *
 * No legend: one series, and the heading already names it.
 */
export function HoursChart({ data }: { data: Array<HourBucket> }) {
  const axis = minuteAxis(Math.max(...data.map((hour) => hour.work), 0))

  return (
    <ChartContainer config={hoursConfig()} className="aspect-auto h-48 w-full sm:h-56">
      {/* Left axis width matches ActivityChart so the panels align down the page. */}
      <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barCategoryGap="14%" accessibilityLayer>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          // Every fourth hour. 24 labels never fit, and eight of them collide on
          // a 390px screen; six clear the gutter at every width. The exact peak
          // is named in the heading and in the tooltip, so nothing is lost.
          interval={3}
        />
        <YAxis
          domain={axis.domain}
          ticks={axis.ticks}
          tickFormatter={formatAxisMinutes}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={60}
        />
        <ChartTooltip cursor={{ fill: 'var(--muted-foreground)', fillOpacity: 0.12 }} content={<HourTooltip />} />
        <Bar dataKey="work" fill="var(--color-work)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
