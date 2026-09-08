import type { HourBucket } from '@/routes/stats/-lib/use-time-of-day'
import { formatDurationShort, formatPercentage } from '@/routes/stats/-lib/utils'
import { m } from '@/lib/i18n'

/**
 * The WCAG-clean twin of {@link HoursChart}. Silent hours are dropped: 24 rows
 * of which two thirds read "—" is noise in a table, whereas in the chart the
 * empty night carries shape.
 */
export function HoursTable({ data }: { data: Array<HourBucket> }) {
  const total = data.reduce((acc, hour) => acc + hour.workSec, 0)
  const active = data.filter((hour) => hour.workSec > 0)

  return (
    <div className="max-h-96 overflow-y-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{m.hours_table_caption()}</caption>
        <thead className="bg-muted sticky top-0">
          <tr className="text-muted-foreground text-left text-xs">
            <th scope="col" className="px-3 py-2 font-medium">
              {m.hour()}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              {m.focus_time()}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              {m.share_of_focus()}
            </th>
          </tr>
        </thead>
        <tbody>
          {active.map((hour) => (
            <tr key={hour.hour} className="border-t">
              <th scope="row" className="px-3 py-1.5 text-left font-normal whitespace-nowrap">
                {hour.rangeLabel}
              </th>
              <td className="px-3 py-1.5 text-right tabular-nums">{formatDurationShort(hour.workSec)}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">
                {formatPercentage(total > 0 ? (hour.workSec / total) * 100 : 0)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-muted">
          <tr className="border-t font-medium">
            <th scope="row" className="px-3 py-2 text-left">
              {m.total()}
            </th>
            <td className="px-3 py-2 text-right tabular-nums">{formatDurationShort(total)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatPercentage(total > 0 ? 100 : 0)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
