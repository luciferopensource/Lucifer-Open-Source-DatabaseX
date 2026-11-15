import { useMemo, useState } from 'react'
import type { ChannelContributionItem } from '../data/aggregateDatabase'
import { useStorageUnit } from '../data/storageUnitContext'
import type { CategoryRow, ExtensionRow, ResolutionRow } from '../lib/view'
import { toPercentage } from '../lib/view'
import { Bar, Panel, StatusPill } from './ui'
import { CategoryIcon, IconArrowRight, IconChart, IconHardDrive, IconSearch, IconTag } from './Icons'

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
          <a className="archive-card__cta" href={`#${item.route}`}>
            Open channel report <IconArrowRight width={14} height={14} />
          </a>
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

/* ── Extensions ledger ────────────────────────────────────────────────────── */

const PAGE_SIZE = 25

function pageWindow(current: number, total: number): number[] {
  const span = 5
  let start = Math.max(1, current - Math.floor(span / 2))
  const end = Math.min(total, start + span - 1)
  start = Math.max(1, end - span + 1)
  const pages: number[] = []
  for (let page = start; page <= end; page += 1) pages.push(page)
  return pages
}

type SortMode = 'files' | 'storage' | 'az'

export function ExtensionsReport({
  rows,
  summary,
}: {
  rows: ExtensionRow[]
  summary: { files: string; unique: number; storage: string; pages?: number }
}) {
  const { formatString } = useStorageUnit()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('ALL')
  const [sort, setSort] = useState<SortMode>('files')
  const [page, setPage] = useState(1)

  const categories = useMemo(() => ['ALL', ...Array.from(new Set(rows.map((row) => row.category)))], [rows])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const list = rows.filter(
      (row) =>
        (category === 'ALL' || row.category === category) &&
        (needle === '' || row.extension.toLowerCase().includes(needle)),
    )
    if (sort === 'files') return [...list].sort((a, b) => b.numericFiles - a.numericFiles)
    if (sort === 'storage') return [...list].sort((a, b) => b.bytes - a.bytes)
    return [...list].sort((a, b) => a.extension.localeCompare(b.extension))
  }, [rows, query, category, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)

  const resetTo = (action: () => void) => {
    action()
    setPage(1)
  }

  return (
    <section className="panel">
      <div className="panel__head">
        <h2 className="panel__title">
          <IconTag />
          Extension ledger
        </h2>
        <span className="panel__meta">
          {summary.unique.toLocaleString('en-GB')} unique types
          {summary.pages ? ` · ${summary.pages} source pages` : ''}
        </span>
      </div>

      <div className="ext-toolbar">
        <label className="field">
          <IconSearch />
          <input
            type="search"
            value={query}
            placeholder="Search an extension, e.g. .mkv"
            aria-label="Search extensions"
            onChange={(event) => resetTo(() => setQuery(event.target.value))}
          />
        </label>
        <select
          className="select"
          value={sort}
          aria-label="Sort extensions"
          onChange={(event) => resetTo(() => setSort(event.target.value as SortMode))}
        >
          <option value="files">Files — high to low</option>
          <option value="storage">Storage — high to low</option>
          <option value="az">Extension — A to Z</option>
        </select>
      </div>

      <div className="chipbar">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className="chip-btn"
            aria-pressed={category === item}
            onClick={() => resetTo(() => setCategory(item))}
          >
            {item === 'ALL' ? 'All' : item}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th scope="col">Extension</th>
              <th scope="col">Category</th>
              <th scope="col" className="tbl__num">
                Files
              </th>
              <th scope="col" className="tbl__num">
                Storage
              </th>
              <th scope="col">Provenance</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={`${row.extension}-${row.category}`}>
                <td className="tbl__ext">{row.extension}</td>
                <td>
                  <span className="cat-tag">{row.category}</span>
                </td>
                <td className="tbl__num">{row.files}</td>
                <td className="tbl__num">{formatString(row.storage)}</td>
                <td className="tbl__prov">{row.provenance}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 ? (
          <p className="note" style={{ padding: '24px 20px' }}>
            No extension matches this filter. Clear the search or pick another category — the ledger holds only
            measured values, so nothing is invented to fill the gap.
          </p>
        ) : null}
      </div>

      <div className="pagination">
        <span>
          Showing {(filtered.length === 0 ? 0 : start + 1).toLocaleString('en-GB')}–
          {Math.min(start + PAGE_SIZE, filtered.length).toLocaleString('en-GB')} of{' '}
          {filtered.length.toLocaleString('en-GB')} extensions
        </span>
        <div className="pager">
          <button type="button" disabled={current <= 1} onClick={() => setPage(current - 1)}>
            Prev
          </button>
          {pageWindow(current, totalPages).map((item) => (
            <button
              key={item}
              type="button"
              aria-current={item === current}
              onClick={() => setPage(item)}
            >
              {item}
            </button>
          ))}
          <button type="button" disabled={current >= totalPages} onClick={() => setPage(current + 1)}>
            Next
          </button>
        </div>
      </div>

      <div className="summary-strip">
        <span>
          Files analysed <b>{summary.files}</b>
        </span>
        <span>
          Unique extensions <b>{summary.unique.toLocaleString('en-GB')}</b>
        </span>
        <span>
          Analysed storage <b>{formatString(summary.storage)}</b>
        </span>
      </div>
    </section>
  )
}
