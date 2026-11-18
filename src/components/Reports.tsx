import type { ChannelContributionItem } from '../data/aggregateDatabase'
import { useStorageUnit } from '../data/storageUnitContext'
import type { CategoryRow, ResolutionRow } from '../lib/view'
import { toPercentage } from '../lib/view'
import { Bar, Panel, StatusPill } from './ui'
import { CategoryIcon, IconArrowRight, IconChart, IconHardDrive } from './Icons'
import { PageLink } from './PageLink'
import { routeHref } from '../lib/router'

/* ── Scan strip ───────────────────────────────────────────────────────────── */

export function ScanStrip({ cells }: { cells: { label: string; value: string }[] }) {
  return (
    <dl className="scan-strip">
      {cells.map((cell) => (
        <div className="scan-cell" key={cell.label}>
          <dt>{cell.label}</dt>
          <dd>{cell.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/* ── Category matrix ──────────────────────────────────────────────────────── */

export function CategoryMatrix({ rows }: { rows: CategoryRow[] }) {
  return (
    <div className="cat-list">
      {rows.map((row) => (
        <div className="cat-row" key={row.id}>
          <div className="cat-row__name">
            <CategoryIcon name={row.icon} />
            <span>{row.category}</span>
          </div>
          <div className="cat-row__bar">
            <Bar pct={row.pct} />
          </div>
          <div className="cat-row__files">{row.files}</div>
          <div className="cat-row__storage">{row.storage}</div>
          <div className="cat-row__share">{row.pct < 0.1 ? '<0.1%' : `${row.pct.toFixed(1)}%`}</div>
        </div>
      ))}
    </div>
  )
}

/* ── Channel contribution cards ───────────────────────────────────────────── */

export function ContributionCards({ items }: { items: ChannelContributionItem[] }) {
  const { formatString } = useStorageUnit()
  return (
    <div className="contrib-grid">
      {items.map((item) => (
        <article className="contrib" key={item.channelId}>
          <div className="contrib__head">
            <span className="contrib__name">{item.displayName}</span>
            <StatusPill status={item.status} />
          </div>
          <div className="contrib__row">
            <span>Channel ID</span>
            <b>{item.channelId}</b>
          </div>
          <div className="contrib__row">
            <span>Scan reference</span>
            <b>{item.scanId}</b>
          </div>
          <div className="contrib__row">
            <span>Files audited</span>
            <b>{item.files}</b>
          </div>
          <div className="contrib__row">
            <span>Stored volume</span>
            <b>{formatString(item.storage)}</b>
          </div>
          <div className="contrib__share">
            <div className="contrib__share-label">
              <span>Share of volume</span>
              <span>{item.storageSharePercentage}</span>
            </div>
            <Bar pct={toPercentage(item.storageSharePercentage)} />
          </div>
          <PageLink className="archive-card__cta" href={routeHref('compare')}>
            Compare channels <IconArrowRight width={14} height={14} />
          </PageLink>
        </article>
      ))}
    </div>
  )
}

/* ── Resolution ───────────────────────────────────────────────────────────── */

export function ResolutionReport({ rows }: { rows: ResolutionRow[] }) {
  const { formatString } = useStorageUnit()
  const total = rows.reduce((sum, row) => sum + row.pct, 0) || 1

  return (
    <Panel title="Resolution spectrum" icon={<IconChart />} meta={`${rows.length} profiles`} flush>
      <div className="panel__body" style={{ paddingBottom: 18 }}>
        <div className="spectrum" style={{ height: 14 }}>
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="spectrum__seg"
              style={{
                width: `${(row.pct / total) * 100}%`,
                background: 'var(--accent)',
                opacity: Math.max(0.28, 1 - index * 0.085),
              }}
              title={`${row.label} — ${row.pctLabel}`}
            />
          ))}
        </div>
        <div className="res-legend">
          {rows.map((row, index) => (
            <span className="legend__item" key={row.id}>
              <span
                className="legend__swatch"
                style={{ background: 'var(--accent)', opacity: Math.max(0.28, 1 - index * 0.085) }}
              />
              {row.label}
              <span className="legend__value">{row.pctLabel}</span>
            </span>
          ))}
        </div>
      </div>

      {rows.map((row, index) => (
        <div className="res-row" key={row.id}>
          <div className="res-row__id">
            <span
              className="res-swatch"
              style={{ background: 'var(--accent)', opacity: Math.max(0.28, 1 - index * 0.085) }}
            />
            <div>
              <div className="res-row__label">{row.label}</div>
              <div className="res-row__tag">{row.tag}</div>
            </div>
          </div>
          <div className="res-row__files">{row.files}</div>
          <div className="res-row__storage">{formatString(row.storage)}</div>
          <div className="res-row__pct">{row.pctLabel}</div>
          {row.contributions.length > 0 ? (
            <div className="res-contrib">
              {row.contributions.map((contribution) => (
                <span key={`${row.id}-${contribution.channelName}`}>
                  {contribution.channelName}: <b>{contribution.files}</b> files ·{' '}
                  <b>{formatString(contribution.storage)}</b>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </Panel>
  )
}

/* ── Storage ──────────────────────────────────────────────────────────────── */

export function StorageReport({
  tiles,
  records,
  note,
}: {
  tiles: { label: string; value: string; sub?: string }[]
  records: { name: string; size: string; channel?: string }[]
  note?: string
}) {
  const { formatString } = useStorageUnit()
  return (
    <>
      <div className="storage-grid">
        {tiles.map((tile) => (
          <dl className="storage-tile" key={tile.label}>
            <dt>{tile.label}</dt>
            <dd>{formatString(tile.value)}</dd>
            {tile.sub ? <small>{tile.sub}</small> : null}
          </dl>
        ))}
      </div>

      <Panel
        title="Largest records on file"
        icon={<IconHardDrive />}
        meta={`${records.length} record${records.length === 1 ? '' : 's'}`}
        flush
      >
        <div className="record-list">
          {records.map((record) => (
            <div className="record" key={`${record.channel ?? 'record'}-${record.name}`}>
              <span className="record__name">
                {record.channel ? `${record.channel} — ` : ''}
                {record.name}
              </span>
              <span className="record__size">{formatString(record.size)}</span>
            </div>
          ))}
        </div>
      </Panel>

      {note ? (
        <p className="note" style={{ marginTop: 14 }}>
          {note}
        </p>
      ) : null}
    </>
  )
}
