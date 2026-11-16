import { useMemo } from 'react'
import { useStorageUnit } from '../data/storageUnitContext'
import { useLocation } from '../lib/router'
import { replaceHash } from '../lib/url'
import type { ExtensionRow } from '../lib/view'
import { Bar } from './ui'
import { IconChart, IconDownload, IconList, IconSearch, IconTag } from './Icons'

const PAGE_SIZE = 25
type SortMode = 'files' | 'storage' | 'az'
type ViewMode = 'table' | 'chart'

function pageWindow(current: number, total: number): number[] {
  const span = 5
  let start = Math.max(1, current - Math.floor(span / 2))
  const end = Math.min(total, start + span - 1)
  start = Math.max(1, end - span + 1)
  const pages: number[] = []
  for (let page = start; page <= end; page += 1) pages.push(page)
  return pages
}

function csvCell(value: string | number): string {
  const text = String(value)
  const guarded = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${guarded.replace(/"/g, '""')}"`
}

function download(filename: string, mime: string, content: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

/**
 * Extension ledger. Filter, sort, page and view mode all live in the URL
 * fragment, so any table state is shareable and survives a reload. Export is
 * client-side only: the same rows you see, nothing extra.
 */
export function ExtensionLedger({
  rows,
  summary,
  scope,
}: {
  rows: ExtensionRow[]
  summary: { files: string; unique: number; storage: string; pages?: number }
  scope: string
}) {
  const { formatString } = useStorageUnit()
  const location = useLocation()
  const params = location.params

  const query = params.get('q') ?? ''
  const category = params.get('cat') ?? 'ALL'
  const sortParam = params.get('sort')
  const sort: SortMode = sortParam === 'storage' || sortParam === 'az' ? sortParam : 'files'
  const view: ViewMode = params.get('view') === 'chart' ? 'chart' : 'table'
  const requestedPage = Math.max(1, Number(params.get('page') ?? '1') || 1)

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    replaceHash(location.base, next)
  }

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
  const current = Math.min(requestedPage, totalPages)
  const start = (current - 1) * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)
  const chartRows = [...filtered].sort((a, b) => b.numericFiles - a.numericFiles).slice(0, 20)
  const chartMax = chartRows[0]?.numericFiles ?? 1

  const exportCsv = () => {
    const header = 'Extension,Category,Files,Storage,Provenance'
    const body = filtered.map((row) =>
      [row.extension, row.category, row.numericFiles, row.storage, row.provenance].map(csvCell).join(','),
    )
    download(`${scope}-extensions.csv`, 'text/csv', [header, ...body].join('\r\n'))
  }

  const exportJson = () => {
    const body = filtered.map((row) => ({
      extension: row.extension,
      category: row.category,
      files: row.numericFiles,
      storage: row.storage,
      provenance: row.provenance,
    }))
    download(`${scope}-extensions.json`, 'application/json', JSON.stringify(body, null, 2))
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
            onChange={(event) => update({ q: event.target.value, page: null })}
          />
        </label>
        <select
          className="select"
          value={sort}
          aria-label="Sort extensions"
          onChange={(event) => update({ sort: event.target.value, page: null })}
        >
          <option value="files">Files — high to low</option>
          <option value="storage">Storage — high to low</option>
          <option value="az">Extension — A to Z</option>
        </select>

        <div className="seg" role="group" aria-label="Ledger view">
          <button type="button" aria-pressed={view === 'table'} onClick={() => update({ view: null })}>
            <IconList width={14} height={14} />
            Table
          </button>
          <button type="button" aria-pressed={view === 'chart'} onClick={() => update({ view: 'chart' })}>
            <IconChart width={14} height={14} />
            Top 20
          </button>
        </div>

        <div className="export-group">
          <button type="button" className="btn--quiet btn" onClick={exportCsv}>
            <IconDownload width={13} height={13} />
            CSV
          </button>
          <button type="button" className="btn--quiet btn" onClick={exportJson}>
            <IconDownload width={13} height={13} />
            JSON
          </button>
        </div>
      </div>

      <div className="chipbar">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className="chip-btn"
            aria-pressed={category === item}
            onClick={() => update({ cat: item === 'ALL' ? null : item, page: null })}
          >
            {item === 'ALL' ? 'All' : item}
          </button>
        ))}
      </div>

      {view === 'chart' ? (
        <div className="ledger-chart" role="img" aria-label="Top 20 extensions by file count">
          {chartRows.map((row) => (
            <div className="ledger-chart__row" key={`${row.extension}-${row.category}`}>
              <span className="ledger-chart__name">{row.extension}</span>
              <span className="ledger-chart__bar">
                <Bar pct={(row.numericFiles / chartMax) * 100} />
              </span>
              <span className="ledger-chart__value">{row.files}</span>
            </div>
          ))}
          {chartRows.length === 0 ? <p className="note">No extension matches this filter.</p> : null}
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th scope="col" aria-sort={sort === 'az' ? 'ascending' : 'none'}>
                    <button type="button" className="th-sort" onClick={() => update({ sort: 'az', page: null })}>
                      Extension {sort === 'az' ? '↑' : ''}
                    </button>
                  </th>
                  <th scope="col">Category</th>
                  <th scope="col" className="tbl__num" aria-sort={sort === 'files' ? 'descending' : 'none'}>
                    <button type="button" className="th-sort" onClick={() => update({ sort: 'files', page: null })}>
                      Files {sort === 'files' ? '↓' : ''}
                    </button>
                  </th>
                  <th scope="col" className="tbl__num" aria-sort={sort === 'storage' ? 'descending' : 'none'}>
                    <button type="button" className="th-sort" onClick={() => update({ sort: 'storage', page: null })}>
                      Storage {sort === 'storage' ? '↓' : ''}
                    </button>
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
              <button type="button" disabled={current <= 1} onClick={() => update({ page: String(current - 1) })}>
                Prev
              </button>
              {pageWindow(current, totalPages).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-current={item === current}
                  onClick={() => update({ page: String(item) })}
                >
                  {item}
                </button>
              ))}
              <button
                type="button"
                disabled={current >= totalPages}
                onClick={() => update({ page: String(current + 1) })}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

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
        <span>
          Export <b>{filtered.length.toLocaleString('en-GB')} rows</b>
        </span>
      </div>
    </section>
  )
}
