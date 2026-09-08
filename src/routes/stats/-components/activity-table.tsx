import type { DayPoint } from '@/routes/stats/-lib/chart-data'
import { formatDurationShort } from '@/routes/stats/-lib/utils'
import { m } from '@/lib/i18n'

/**
 * The WCAG-clean twin of {@link ActivityChart}, column for column with what the
 * tooltip shows, so nothing is gated behind a hover.
 */
export function ActivityTable({ data }: { data: Array<DayPoint> }) {
  const totals = data.reduce(
    (acc, day) => ({
      workSec: acc.workSec + day.workSec,
      restSec: acc.restSec + day.restSec,
      recordedSec: acc.recordedSec + day.recordedSec,
      started: acc.started + day.started,
      completed: acc.completed + day.completed,
    }),
    { workSec: 0, restSec: 0, recordedSec: 0, started: 0, completed: 0 },
  )

  return (
    <div className="max-h-96 overflow-y-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{m.activity_table_caption()}</caption>
        {/* Opaque, not translucent: a blurred sticky row lets the scrolled rows bleed through it. */}
        <thead className="bg-muted sticky top-0">
          <tr className="text-muted-foreground text-left text-xs">
            <th scope="col" className="px-3 py-2 font-medium">
              {m.date()}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              {m.work()}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              {m.break()}
            </th>
            <th scope="col" className="hidden px-3 py-2 text-right font-medium sm:table-cell">
              {m.total()}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              {m.pomodoros()}
            </th>
            <th scope="col" className="hidden px-3 py-2 text-right font-medium sm:table-cell">
              {m.abandoned()}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((day) => (
            <tr key={day.longLabel} className="border-t">
              <th scope="row" className="px-3 py-1.5 text-left font-normal whitespace-nowrap">
                {day.longLabel}
              </th>
              {/* tabular-nums here, where the digits have to line up column-wise */}
              <td className="px-3 py-1.5 text-right tabular-nums">
                {day.workSec > 0 ? formatDurationShort(day.workSec) : '—'}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums">
                {day.restSec > 0 ? formatDurationShort(day.restSec) : '—'}
              </td>
              <td className="hidden px-3 py-1.5 text-right tabular-nums sm:table-cell">
                {day.recordedSec > 0 ? formatDurationShort(day.recordedSec) : '—'}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums">{day.completed || '—'}</td>
              <td className="hidden px-3 py-1.5 text-right tabular-nums sm:table-cell">
                {day.started - day.completed || '—'}
              </td>
            </tr>
          ))}
        </tbody>
        {/* Not sticky: a pinned footer permanently clips whichever row sits under it,
            and the range summary above already carries these totals. */}
        <tfoot className="bg-muted">
          <tr className="border-t font-medium">
            <th scope="row" className="px-3 py-2 text-left">
              {m.total()}
            </th>
            <td className="px-3 py-2 text-right tabular-nums">{formatDurationShort(totals.workSec)}</td>
            <td className="px-3 py-2 text-right tabular-nums">{formatDurationShort(totals.restSec)}</td>
            <td className="hidden px-3 py-2 text-right tabular-nums sm:table-cell">
              {formatDurationShort(totals.recordedSec)}
            </td>
            <td className="px-3 py-2 text-right tabular-nums">{totals.completed}</td>
            <td className="hidden px-3 py-2 text-right tabular-nums sm:table-cell">
              {totals.started - totals.completed}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
