import { REGISTERED_ARCHIVES } from '../data/archiveRegistry'
import { parseStorageToBytes } from '../data/aggregateDatabase'
import { useStorageUnit } from '../data/storageUnitContext'
import { parseCount, shortChannel } from '../lib/view'
import { Kpi, Panel, Pill } from '../components/ui'
import { PageLink } from '../components/PageLink'
import { routeHref } from '../lib/router'
import { IconArrowLeft, IconChart } from '../components/Icons'

interface Side {
  name: string
  scanId: string
  storage: string
  storageBytes: number
  files: number
  messages: number
  average: string
  averageBytes: number
  largest: string
  largestBytes: number
  extensions: number
  duration: string
}

const SIDES: Side[] = REGISTERED_ARCHIVES.map((archive) => {
  const highlights = archive.dataset.storageHighlights
  return {
    name: archive.displayName,
    scanId: archive.scanId,
    storage: archive.combinedStorage,
    storageBytes: parseStorageToBytes(archive.combinedStorage),
    files: archive.numericFiles,
    messages: archive.numericMessages,
    average: highlights.averageFileSize,
    averageBytes: parseStorageToBytes(highlights.averageFileSize),
    largest: highlights.largestFileSize,
    largestBytes: parseStorageToBytes(highlights.largestFileSize),
    extensions: archive.dataset.extensionSummary.uniqueExtensions,
    duration: archive.dataset.scanSummary.scanDuration,
  }
})

function leaderLabel(a: number, b: number): 'a' | 'b' | 'tie' {
  if (a === b) return 'tie'
  return a > b ? 'a' : 'b'
}

export function Compare() {
  const { formatString, formatBytes } = useStorageUnit()
  const [a, b] = SIDES

  const rows: {
    label: string
    a: string
    b: string
    leader: 'a' | 'b' | 'tie' | null
  }[] = [
    { label: 'Archived storage', a: formatString(a.storage), b: formatString(b.storage), leader: leaderLabel(a.storageBytes, b.storageBytes) },
    { label: 'Files audited', a: a.files.toLocaleString('en-GB'), b: b.files.toLocaleString('en-GB'), leader: leaderLabel(a.files, b.files) },
    { label: 'Messages checked', a: a.messages.toLocaleString('en-GB'), b: b.messages.toLocaleString('en-GB'), leader: leaderLabel(a.messages, b.messages) },
    { label: 'Average file', a: a.average, b: b.average, leader: leaderLabel(a.averageBytes, b.averageBytes) },
    { label: 'Largest file', a: a.largest, b: b.largest, leader: leaderLabel(a.largestBytes, b.largestBytes) },
    { label: 'Unique extensions', a: String(a.extensions), b: String(b.extensions), leader: leaderLabel(a.extensions, b.extensions) },
    { label: 'Scan duration', a: a.duration, b: b.duration, leader: null },
  ]

  const categoryNames = Array.from(
    new Set([
      ...REGISTERED_ARCHIVES[0].dataset.categoryBreakdown.map((item) => item.category),
      ...REGISTERED_ARCHIVES[1].dataset.categoryBreakdown.map((item) => item.category),
    ]),
  )

  const categoryRows = categoryNames.map((name) => {
    const first = REGISTERED_ARCHIVES[0].dataset.categoryBreakdown.find((item) => item.category === name)
    const second = REGISTERED_ARCHIVES[1].dataset.categoryBreakdown.find((item) => item.category === name)
    const firstFiles = first ? parseCount(first.files) : 0
    const secondFiles = second ? parseCount(second.files) : 0
    return {
      name,
      a: { files: firstFiles, label: first?.files ?? '—', storage: first?.storage ?? '—' },
      b: { files: secondFiles, label: second?.files ?? '—', storage: second?.storage ?? '—' },
      max: Math.max(firstFiles, secondFiles, 1),
    }
  })

  const resolutionRows = Array.from(
    new Set([
      ...REGISTERED_ARCHIVES[0].dataset.resolutionBreakdown.map((item) => item.id),
      ...REGISTERED_ARCHIVES[1].dataset.resolutionBreakdown.map((item) => item.id),
    ]),
  ).map((id) => {
    const first = REGISTERED_ARCHIVES[0].dataset.resolutionBreakdown.find((item) => item.id === id)
    const second = REGISTERED_ARCHIVES[1].dataset.resolutionBreakdown.find((item) => item.id === id)
    const firstFiles = first ? parseCount(first.files) : 0
    const secondFiles = second ? parseCount(second.files) : 0
    return {
      id,
      label: first?.label ?? second?.label ?? id,
      a: { files: firstFiles, label: first?.files ?? '—', storage: first?.storage ?? '—' },
      b: { files: secondFiles, label: second?.files ?? '—', storage: second?.storage ?? '—' },
      max: Math.max(firstFiles, secondFiles, 1),
    }
  })

  return (
    <>
      <div className="page-head">
        <PageLink className="backlink" href={routeHref('home')}>
          <IconArrowLeft width={13} height={13} /> Overview
        </PageLink>
        <div className="page-head__row">
          <div>
            <p className="eyebrow">Cross-archive comparison</p>
            <h1>Channel head to head</h1>
            <p className="lede">
              Both registered archives side by side. Every figure is read from the same datasets that drive the
              individual reports — nothing is recalculated by hand or rounded for effect.
            </p>
          </div>
          <dl className="page-head__meta">
            <dt>Channels compared</dt>
            <dd>{SIDES.length}</dd>
            <dt>Source</dt>
            <dd>Registered archive registry</dd>
          </dl>
        </div>
      </div>

      <div className="compare-cards">
        {SIDES.map((side) => (
          <article className="compare-card" key={side.scanId}>
            <div className="compare-card__head">
              <span className="archive-card__index">{shortChannel(side.name)}</span>
              <Pill tone="pos" dot>
                Audited
              </Pill>
            </div>
            <h2>{side.name}</h2>
            <p className="archive-card__id">{side.scanId}</p>
            <div className="compare-card__metrics">
              <div>
                <span>Storage</span>
                <b>{formatString(side.storage)}</b>
              </div>
              <div>
                <span>Files</span>
                <b>{side.files.toLocaleString('en-GB')}</b>
              </div>
              <div>
                <span>Extensions</span>
                <b>{side.extensions}</b>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="kpi-row">
        <Kpi
          label="Storage delta"
          value={formatBytes(Math.abs(a.storageBytes - b.storageBytes))}
          sub={`${shortChannel(a.storageBytes >= b.storageBytes ? a.name : b.name)} holds more`}
        />
        <Kpi
          label="File delta"
          value={Math.abs(a.files - b.files).toLocaleString('en-GB')}
          sub={`${shortChannel(a.files >= b.files ? a.name : b.name)} holds more`}
        />
        <Kpi
          label="Message delta"
          value={Math.abs(a.messages - b.messages).toLocaleString('en-GB')}
          sub={`${shortChannel(a.messages >= b.messages ? a.name : b.name)} scanned more messages`}
        />
        <Kpi label="Combined files" value={(a.files + b.files).toLocaleString('en-GB')} sub="both archives" />
      </div>

      <Panel title="Head to head" icon={<IconChart />} meta={`${rows.length} metrics`} flush>
        <div className="table-wrap" style={{ maxHeight: 'none' }}>
          <table className="tbl compare-table">
            <thead>
              <tr>
                <th scope="col">Metric</th>
                <th scope="col" className="tbl__num">
                  {shortChannel(a.name)}
                </th>
                <th scope="col" className="tbl__num">
                  {shortChannel(b.name)}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td className={row.leader === 'a' ? 'tbl__num is-leader' : 'tbl__num'}>{row.a}</td>
                  <td className={row.leader === 'b' ? 'tbl__num is-leader' : 'tbl__num'}>{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div style={{ marginTop: 16 }}>
        <Panel title="Category split" icon={<IconChart />} meta="Files per category" flush>
          <div className="compare-rows">
            {categoryRows.map((row) => (
              <div className="compare-row" key={row.name}>
                <span className="compare-row__name">{row.name}</span>
                <div className="compare-row__bars">
                  <span className="compare-row__bar">
                    <i style={{ width: `${(row.a.files / row.max) * 100}%` }} />
                    <em>{row.a.label}</em>
                  </span>
                  <span className="compare-row__bar compare-row__bar--b">
                    <i style={{ width: `${(row.b.files / row.max) * 100}%` }} />
                    <em>{row.b.label}</em>
                  </span>
                </div>
                <span className="compare-row__storage">
                  {row.a.storage} / {row.b.storage}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ marginTop: 16 }}>
        <Panel title="Resolution split" icon={<IconChart />} meta="Files per profile" flush>
          <div className="compare-rows">
            {resolutionRows.map((row) => (
              <div className="compare-row" key={row.id}>
                <span className="compare-row__name">{row.label}</span>
                <div className="compare-row__bars">
                  <span className="compare-row__bar">
                    <i style={{ width: `${(row.a.files / row.max) * 100}%` }} />
                    <em>{row.a.label}</em>
                  </span>
                  <span className="compare-row__bar compare-row__bar--b">
                    <i style={{ width: `${(row.b.files / row.max) * 100}%` }} />
                    <em>{row.b.label}</em>
                  </span>
                </div>
                <span className="compare-row__storage">
                  {row.a.storage} / {row.b.storage}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <p className="note" style={{ marginTop: 18 }}>
        Blue bars belong to {shortChannel(a.name)}; the outlined bars belong to {shortChannel(b.name)}. Bar length is
        relative to the larger of the two values in that row, not to the fleet total. In the table, blue marks the
        larger value — ties stay neutral.
      </p>
    </>
  )
}
