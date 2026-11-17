import type { MatrixRow, TimelineEvent, VaultHealth } from '../lib/insight'
import { IconChart, IconClock, IconShield } from './Icons'

/** Transparent health scores — every part shows its own arithmetic. */
export function VaultHealthCards({ reports }: { reports: VaultHealth[] }) {
  if (reports.length === 0) {
    return <p className="empty">No archives are registered, so there is nothing to score.</p>
  }

  return (
    <>
      <div className="health-grid">
        {reports.map((report) => (
          <article className="health-card" key={report.id}>
            <header className="health-card__head">
              <div>
                <h3>{report.name}</h3>
                <p className="mono">{report.scanId}</p>
              </div>
              <div className="health-card__score">
                <b>{report.score.toFixed(1)}</b>
                <span>{report.grade}</span>
              </div>
            </header>
            <ul className="health-parts">
              {report.parts.map((part) => (
                <li key={part.label}>
                  <div className="health-parts__row">
                    <span>{part.label}</span>
                    <b>
                      {part.points.toFixed(1)} / {part.max}
                    </b>
                  </div>
                  <div className="bar" role="presentation">
                    <span style={{ width: `${Math.min(100, (part.points / part.max) * 100)}%` }} />
                  </div>
                  <p className="health-parts__detail">{part.detail}</p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="note" style={{ marginTop: 14 }}>
        Score = integrity checks passed (40) + indexed files against messages checked (40) + scan status (20). Every part
        is derived from the registered archive record, and a partially verified archive lowers its own score instead of
        borrowing a neighbour&apos;s.
      </p>
    </>
  )
}

/** Resolution crossed with each contributing channel. */
export function ResolutionChannelMatrix({
  rows,
  channels,
}: {
  rows: MatrixRow[]
  channels: string[]
}) {
  if (rows.length === 0) return <p className="empty">No resolution records in the current aggregate.</p>

  return (
    <div className="tbl-wrap">
      <table className="tbl matrix">
        <thead>
          <tr>
            <th scope="col">Resolution</th>
            {channels.map((channel) => (
              <th scope="col" className="tbl__num" key={channel}>
                {channel}
              </th>
            ))}
            <th scope="col" className="tbl__num">
              Union
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">
                <span className="matrix__label">{row.label}</span>
                <span className="matrix__tag">{row.tag}</span>
              </th>
              {channels.map((channel) => {
                const cell = row.cells.find((entry) => entry.channel === channel)
                return (
                  <td className="tbl__num matrix__cell" key={channel}>
                    {cell ? (
                      <>
                        <b>{cell.files}</b>
                        <span>{cell.storage}</span>
                        <i style={{ width: `${Math.max(2, cell.share * 100)}%` }} aria-hidden="true" />
                      </>
                    ) : (
                      <span className="matrix__none">—</span>
                    )}
                  </td>
                )
              })}
              <td className="tbl__num matrix__cell matrix__cell--total">
                <b>{row.files}</b>
                <span>{row.storage}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Timeline of recorded audit facts, newest snapshot first. */
export function AuditTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return <p className="empty">No audit events recorded yet.</p>

  return (
    <ol className="timeline">
      {events.map((event) => (
        <li className="timeline__item" key={event.id}>
          <span className="timeline__dot" aria-hidden="true" />
          <div className="timeline__body">
            <div className="timeline__head">
              <h3>{event.title}</h3>
              <time>{event.when}</time>
            </div>
            <p>{event.detail}</p>
            <ul className="timeline__facts">
              {event.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  )
}

export const SIGNAL_ICONS = {
  health: IconShield,
  matrix: IconChart,
  timeline: IconClock,
}
