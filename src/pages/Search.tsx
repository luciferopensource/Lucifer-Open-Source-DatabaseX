import { getAggregatedDatabase } from '../data/aggregateDatabase'
import { routeHref } from '../lib/router'
import { useLocation } from '../lib/router'
import { replacePath } from '../lib/url'
import { PageLink } from '../components/PageLink'
import { CopyLinkButton } from '../components/CopyLinkButton'
import { ShareButton } from '../components/PageActions'
import { IconArrowLeft, IconSearch } from '../components/Icons'
import { Pill } from '../components/ui'

const PAGES = [
  { label: 'Overview', hint: 'Living archive home', href: routeHref('home') },
  { label: 'Total Database', hint: 'Aggregate report', href: routeHref('total-database') },
  { label: 'Channel analysis', hint: 'Total Database tab', href: routeHref('total-database', 'channel') },
  { label: 'Resolution intelligence', hint: 'Total Database tab', href: routeHref('total-database', 'resolution') },
  { label: 'Storage highlights', hint: 'Total Database tab', href: routeHref('total-database', 'storage') },
  { label: 'Extension ledger', hint: 'Total Database tab', href: routeHref('total-database', 'extensions') },
  { label: 'Health & signals', hint: 'Total Database tab', href: routeHref('total-database', 'signals') },
  { label: 'Compare channels', hint: 'Backup 01 vs Backup 02', href: routeHref('compare') },
  { label: 'Sources & method', hint: 'Provenance and converter', href: routeHref('sources') },
]

/** Full-page version of the palette: extensions, categories and pages in one place. */
export function Search() {
  const location = useLocation()
  const query = location.params.get('q') ?? ''
  const category = location.params.get('cat') ?? ''
  const aggregate = getAggregatedDatabase()
  const records = aggregate.extensionIntelligence.records

  const needle = query.trim().toLowerCase()
  const categories = Array.from(new Set(records.map((record) => record.category))).sort()

  const matches = records.filter((record) => {
    const categoryOk = !category || record.category === category
    if (!needle) return categoryOk
    const channels = record.channelContributions.map((entry) => entry.channelName).join(' ')
    return (
      categoryOk &&
      (record.extension.toLowerCase().includes(needle) ||
        record.category.toLowerCase().includes(needle) ||
        channels.toLowerCase().includes(needle))
    )
  })

  const pageMatches = PAGES.filter(
    (page) =>
      !needle || page.label.toLowerCase().includes(needle) || page.hint.toLowerCase().includes(needle),
  )

  const setQuery = (value: string) => {
    const params = new URLSearchParams(location.params)
    if (value) params.set('q', value)
    else params.delete('q')
    replacePath('search', params)
  }

  const setCategory = (value: string) => {
    const params = new URLSearchParams(location.params)
    if (value) params.set('cat', value)
    else params.delete('cat')
    replacePath('search', params)
  }

  return (
    <>
      <div className="page-head">
        <PageLink className="backlink" href={routeHref('home')}>
          <IconArrowLeft width={13} height={13} /> Overview
        </PageLink>
        <div className="page-head__row">
          <div>
            <p className="eyebrow">Index-wide lookup</p>
            <h1>Search</h1>
            <p className="lede">
              Search every recorded extension, its category and the pages of this site. Results are derived from the
              same aggregate the reports use — nothing extra is indexed.
            </p>
          </div>
          <div className="page-head__meta">
            <CopyLinkButton />
            <ShareButton title="Lucifer Database X search" />
          </div>
        </div>
      </div>

      <div className="search-bar">
        <label className="field field--lg">
          <IconSearch />
          <input
            type="search"
            value={query}
            placeholder="Try .mkv, Audiophile or storage"
            aria-label="Search the index"
            autoFocus
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="seg" role="group" aria-label="Filter by category">
          <button type="button" aria-pressed={!category} onClick={() => setCategory('')}>
            All
          </button>
          {categories.map((item) => (
            <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="search-summary">
        <span>
          <b>{matches.length.toLocaleString('en-GB')}</b> extensions
        </span>
        <span>
          <b>{pageMatches.length}</b> pages
        </span>
        {category ? <Pill tone="plain">{category}</Pill> : null}
        <CopyLinkButton label="Copy results link" />
      </div>

      <section className="panel" aria-label="Extension results">
        <div className="panel__head">
          <h2 className="panel__title">Extensions</h2>
          <span className="panel__meta">{matches.length.toLocaleString('en-GB')} matches</span>
        </div>
        {matches.length === 0 ? (
          <p className="empty">No extension matches “{query}”. Try a shorter fragment or clear the category filter.</p>
        ) : (
          <div className="table-wrap">
            <table className="tbl search-tbl">
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
                  <th scope="col">Channels</th>
                  <th scope="col">Related</th>
                </tr>
              </thead>
              <tbody>
                {matches.slice(0, 60).map((record) => (
                  <tr key={record.extension}>
                    <th scope="row" className="mono">
                      {record.extension}
                    </th>
                    <td>
                      <button className="chip-btn chip-btn--sm" type="button" onClick={() => setCategory(record.category)}>
                        {record.category}
                      </button>
                    </td>
                    <td className="tbl__num">{record.files}</td>
                    <td className="tbl__num">{record.storage}</td>
                    <td className="mono search-tbl__channels">
                      {Array.from(
                        new Set(record.channelContributions.map((entry) => entry.channelName.replace('Lucifer Stream Site ', ''))),
                      ).join(' · ')}
                    </td>
                    <td>
                      <PageLink
                        className="link-quiet"
                        href={routeHref('total-database', 'extensions', { q: record.extension })}
                      >
                        Open in ledger
                      </PageLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {matches.length > 60 ? (
          <p className="note">Showing the first 60 of {matches.length.toLocaleString('en-GB')} matches — narrow the query to see the rest.</p>
        ) : null}
      </section>

      <section className="panel" aria-label="Page results" style={{ marginTop: 16 }}>
        <div className="panel__head">
          <h2 className="panel__title">Pages</h2>
          <span className="panel__meta">{pageMatches.length} matches</span>
        </div>
        {pageMatches.length === 0 ? (
          <p className="empty">No page matches “{query}”.</p>
        ) : (
          <ul className="page-results">
            {pageMatches.map((page) => (
              <li key={page.href}>
                <PageLink href={page.href}>
                  <b>{page.label}</b>
                  <span>{page.hint}</span>
                </PageLink>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
