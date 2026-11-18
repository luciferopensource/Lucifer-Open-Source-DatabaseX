import { getAggregatedDatabase } from '../data/aggregateDatabase'
import { routeHref } from '../lib/router'
import { PageLink } from '../components/PageLink'
import { CATALOG_ENTRIES } from '../data/catalog'
import { useStorageUnit } from '../data/storageUnitContext'
import { resolutionFromAggregate } from '../lib/view'
import { Pill, SectionHead } from '../components/ui'
import { IconDatabase } from '../components/Icons'

export function Home() {
  const aggregate = getAggregatedDatabase()
  const { formatString } = useStorageUnit()

  const resolution = resolutionFromAggregate(aggregate)
  const totalPct = resolution.reduce((sum, row) => sum + row.pct, 0) || 1
  const active = resolution.filter((row) => row.pct > 0)
  const legend = [...active].sort((a, b) => b.pct - a.pct).slice(0, 4)
  const opacityFor = (id: string) => {
    const index = resolution.findIndex((row) => row.id === id)
    return Math.max(0.3, 1 - index * 0.09)
  }
  const legendPct = legend.reduce((sum, row) => sum + row.pct, 0)
  const remainder = totalPct - legendPct

  return (
    <>
      <section className="hero">
        <div className="hero__grid">
          <div>
            <p className="eyebrow">Sovereign media index / Archive X</p>
            <h1 className="hero__title">
              Step into the
              <span>movie universe</span>
            </h1>
            <p className="lede">
              Experience sovereign cinematic storytelling through lossless 4K HDR mastering, uncompressed spatial
              audio, and curated motion picture archives — every figure below traced to a completed channel scan.
            </p>

            <div className="hero__actions">
              <PageLink className="btn btn--primary" href={routeHref('total-database')}>
                <IconDatabase width={15} height={15} />
                Open total database
              </PageLink>
              <PageLink className="btn btn--ghost" href={routeHref('compare')}>
                Compare channels
              </PageLink>
              <PageLink className="btn btn--ghost" href={routeHref('sources')}>
                Sources &amp; method
              </PageLink>
            </div>

            <dl className="hero__stats">
              <div>
                <dt>Master stream</dt>
                <dd>4K UHD HDR</dd>
              </div>
              <div>
                <dt>Studio sound</dt>
                <dd>Dolby Atmos 7.1</dd>
              </div>
            </dl>
          </div>

          <aside className="snapshot">
            <div className="snapshot__head">
              <span className="snapshot__title">System snapshot</span>
              <Pill tone="pos" dot>
                Verified
              </Pill>
            </div>

            <dl className="snapshot__rows">
              <div className="snap-row">
                <dt>Registered channels</dt>
                <dd>
                  {aggregate.archiveCount}
                  <small>{aggregate.completeScans} complete scans</small>
                </dd>
              </div>
              <div className="snap-row">
                <dt>Indexed files</dt>
                <dd>
                  {aggregate.totalFiles}
                  <small>{aggregate.totalMessages} messages checked</small>
                </dd>
              </div>
              <div className="snap-row">
                <dt>Combined volume</dt>
                <dd>
                  {formatString(aggregate.combinedStorage)}
                  <small>{aggregate.combinedStoragePB}</small>
                </dd>
              </div>
              <div className="snap-row">
                <dt>Unique extensions</dt>
                <dd>
                  {aggregate.extensionIntelligence.uniqueExtensionsCount}
                  <small>across {aggregate.archiveCount} archives</small>
                </dd>
              </div>
            </dl>

            <div className="snapshot__chart">
              <div className="spectrum">
                {active.map((row) => (
                  <div
                    key={row.id}
                    className="spectrum__seg"
                    style={{
                      width: `${(row.pct / totalPct) * 100}%`,
                      background: 'var(--accent)',
                      opacity: opacityFor(row.id),
                    }}
                    title={`${row.label} — ${row.pctLabel}`}
                  />
                ))}
              </div>
              <div className="legend">
                {legend.map((row) => (
                  <span className="legend__item" key={row.id}>
                    <span
                      className="legend__swatch"
                      style={{ background: 'var(--accent)', opacity: opacityFor(row.id) }}
                    />
                    {row.label}
                    <span className="legend__value">{row.pctLabel}</span>
                  </span>
                ))}
                {remainder > 0.05 ? (
                  <span className="legend__item">
                    <span className="legend__swatch" style={{ background: 'var(--line-3)' }} />
                    {active.length - legend.length} further tiers
                    <span className="legend__value">{`${remainder.toFixed(1)}%`}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <SectionHead
          eyebrow="Media catalogue"
          title="Catalogue state"
          description="The media catalogue is separate from the channel telemetry above and stays empty until a verified query populates it."
          aside={<Pill tone="plain">{CATALOG_ENTRIES.length} records</Pill>}
        />

        {CATALOG_ENTRIES.length === 0 ? (
          <div className="empty">
            <strong>Empty by design</strong>
            <span>
              No media record has been verified for this catalogue, so none is shown. This surface refuses to invent
              titles, posters or counts to look complete.
            </span>
          </div>
        ) : null}
      </section>
    </>
  )
}
