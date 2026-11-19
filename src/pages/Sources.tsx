import { getAllArchives } from '../data/archiveRegistry'
import { getAggregatedDatabase } from '../data/aggregateDatabase'
import { OWNER_INFO } from '../data/channelIntelligenceData'
import { UnitConverter } from '../components/Converter'
import { PageLink } from '../components/PageLink'
import { CopyLinkButton } from '../components/CopyLinkButton'
import { PrintButton, ShareButton } from '../components/PageActions'
import { CopyButton } from '../components/CopyButton'
import { routeHref } from '../lib/router'
import { GLOSSARY } from '../lib/glossary'
import { Panel, Pill, StatusPill } from '../components/ui'
import { IconArrowLeft, IconFileText, IconShield } from '../components/Icons'

const REPORT_FILES: Record<string, { file: string; size: string }> = {
  'archive-001': { file: '/reports/backup-1-source-report.txt', size: '44.8 kB' },
  'archive-002': { file: '/reports/backup-2-source-report.txt', size: '38.1 kB' },
}

const METHOD = [
  'The audit reports on file were copied verbatim into `/reports/` from the source project. They are the only origin of channel figures wherever a channel is published.',
  'The dataset modules in `src/data/` are byte-identical copies of the source datasets. No value was retyped, rounded or reformatted by hand.',
  'The aggregate sums the numeric fields, parses storage strings into bytes once, and derives category, resolution and extension unions from the registered archives.',
  'Scan duration on the Total Database page is added from the published channel durations, not pasted from a summary.',
  'The integrity matrix is computed from the aggregate that was just built. An empty registry reports MISSING or EMPTY instead of a wall of green.',
  'The media catalogue is empty by design. It holds no titles, posters or counts until a verified query populates it.',
]

export function Sources() {
  const aggregate = getAggregatedDatabase()
  const archives = getAllArchives()

  return (
    <>
      <div className="page-head">
        <PageLink className="backlink" href={routeHref('home')}>
          <IconArrowLeft width={13} height={13} /> Overview
        </PageLink>
        <div className="page-head__row">
          <div>
            <p className="eyebrow">Provenance and method</p>
            <h1>Sources &amp; method</h1>
            <p className="lede">
              Where every number comes from, how it is derived, and what this site deliberately does not do. If a
              figure cannot be traced to an audited report, it does not belong on this site.
            </p>
          </div>
          <dl className="page-head__meta">
            <dt>Published reports</dt>
            <dd>{archives.length}</dd>
            <dt>Aggregate version</dt>
            <dd>{aggregate.scanRecord.reportVersion}</dd>
          </dl>
        </div>
        <div className="page-head__actions">
          <CopyLinkButton />
          <PrintButton />
          <ShareButton title="Sources & method" />
        </div>
      </div>

      {archives.length === 0 ? (
        <Panel title="No channel is published" icon={<IconFileText />} meta="Registry empty">
          <p className="empty">
            The retired channels are unpublished, so their reports are not presented as live sources. The audit files
            stay on disk in <code>/reports/</code> and the datasets stay in <code>src/data/</code>; publishing a registry
            entry brings its report card back here automatically.
          </p>
        </Panel>
      ) : (
      <div className="report-grid">
        {archives.map((archive) => {
          const meta = REPORT_FILES[archive.id]
          return (
            <article className="report-card" key={archive.id}>
              <div className="archive-card__top">
                <span className="archive-card__index">Archive #{String(archive.sequence).padStart(2, '0')}</span>
                <StatusPill status={archive.status} />
              </div>
              <h2>{archive.displayName}</h2>
              <dl className="report-card__meta">
                <div>
                  <dt>Channel ID</dt>
                  <dd className="meta-copy">
                    {archive.channelId}
                    <CopyButton value={archive.channelId ?? ''} label="channel ID" />
                  </dd>
                </div>
                <div>
                  <dt>Scan ID</dt>
                  <dd className="meta-copy">
                    {archive.scanId}
                    <CopyButton value={archive.scanId} label="scan ID" />
                  </dd>
                </div>
                <div>
                  <dt>Completed</dt>
                  <dd>{archive.completedDate}</dd>
                </div>
                <div>
                  <dt>Scanner</dt>
                  <dd>{archive.scanner}</dd>
                </div>
              </dl>
              {meta ? (
                <a className="report-card__file" href={meta.file} target="_blank" rel="noopener noreferrer">
                  <IconFileText width={14} height={14} />
                  Original report · TXT
                  <span>{meta.size}</span>
                </a>
              ) : null}
            </article>
          )
        })}
      </div>
      )}

      <div className="grid-2" style={{ marginTop: 20 }}>
        <Panel title="How the figures are derived" icon={<IconShield />} meta={`${METHOD.length} rules`}>
          <ol className="method-list">
            {METHOD.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </Panel>

        <Panel title="Unit converter" icon={<IconFileText />} meta="Same parser as the tables">
          <UnitConverter />
          <p className="note" style={{ marginTop: 12 }}>
            TB, GB and MB are binary (1 TB = 1024 GB). The headline PB figure uses the decimal convention the audit
            reports use (1 PB = 1000 TB). The converter shares the reports&rsquo; parser, so a figure typed here
            matches the tables exactly.
          </p>
        </Panel>
      </div>

      <section className="section">
        <div className="section__head">
          <div>
            <p className="eyebrow">Reference</p>
            <h2 className="section__title">Glossary</h2>
            <p className="section__desc">
              The labels the scanner emits, in plain language. Nothing here describes a capability the site has.
            </p>
          </div>
          <Pill tone="plain">{GLOSSARY.length} terms</Pill>
        </div>

        <div className="glossary-grid">
          {GLOSSARY.map((entry) => (
            <article className="glossary-item" key={entry.term}>
              <span className="glossary-item__group">{entry.group}</span>
              <h3>{entry.term}</h3>
              <p>{entry.definition}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="note" style={{ marginTop: 28 }}>
        Maintained by {OWNER_INFO.name} · {OWNER_INFO.role}, {OWNER_INFO.entity}. The source project remains
        read-only; this replica copies from it and never writes back.
      </p>
    </>
  )
}
