import { Bar, BarChart, CartesianGrid, Rectangle, XAxis, YAxis } from 'recharts'
import type { DayPoint } from '@/routes/stats/-lib/chart-data'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip } from '@/components/ui/chart'
import { ActivityTooltip } from '@/routes/stats/-components/chart-tooltip'
import { activityConfig } from '@/routes/stats/-lib/chart-data'
import { formatAxisMinutes, minuteAxis } from '@/routes/stats/-lib/utils'

type SegmentShapeProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  payload?: DayPoint
}

/**
 * The 4px rounding belongs to the top of the *stack*, not to every segment, so
 * the work segment only rounds on days where no break sits on top of it.
 */
function WorkSegment({ payload, ...rect }: SegmentShapeProps) {
  return <Rectangle {...rect} radius={(payload?.rest ?? 0) > 0 ? 0 : [4, 4, 0, 0]} />
}

/**
 * Work and break minutes per day, stacked on a single axis.
 *
 * A work-share line used to ride a second y-axis here. Two scales on one plot
 * invent a correlation the data never had — and that particular metric was
 * pinned near 83% by the fixed 25/5 cycle regardless of behaviour, so it is
 * gone rather than relocated.
 */
export function ActivityChart({ data }: { data: Array<DayPoint> }) {
  // The stack height, not either series alone, is what the axis has to cover.
  const axis = minuteAxis(Math.max(...data.map((day) => day.work + day.rest), 0))

  return (
    <ChartContainer config={activityConfig()} className="aspect-auto h-64 w-full sm:h-72">
      <BarChart
        data={data}
        margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
        barCategoryGap="18%"
        // Keyboard access to the same readout the pointer gets.
        accessibilityLayer
      >
        {/* Solid hairlines, one step off the surface: recessive, never dashed. */}
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={12}
          interval="preserveStartEnd"
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
        <ChartTooltip cursor={{ fill: 'var(--muted-foreground)', fillOpacity: 0.12 }} content={<ActivityTooltip />} />
        <ChartLegend content={<ChartLegendContent />} />
        {/* stroke in the surface colour is the 2px gap between stacked segments */}
        <Bar
          dataKey="work"
          stackId="activity"
          fill="var(--color-work)"
          maxBarSize={24}
          stroke="var(--card)"
          strokeWidth={2}
          shape={<WorkSegment />}
        />
        <Bar
          dataKey="rest"
          stackId="activity"
          fill="var(--color-rest)"
          maxBarSize={24}
          radius={[4, 4, 0, 0]}
          stroke="var(--card)"
          strokeWidth={2}
        />
      </BarChart>
    </ChartContainer>
  )
}
