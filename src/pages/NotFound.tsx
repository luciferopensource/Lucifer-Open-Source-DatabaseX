import { PageLink } from '../components/PageLink'
import { routeHref } from '../lib/router'
import { IconArrowLeft } from '../components/Icons'

/**
 * Honest 404. The retired backup routes land here until their replacements
 * arrive — better than silently showing the home page.
 */
export function NotFound() {
  return (
    <div className="notfound">
      <p className="eyebrow">Error 404</p>
      <h1>This page is not here</h1>
      <p className="lede">
        The address you opened does not exist on this site. Backup 01 and Backup 02 are being rebuilt, so their report
        pages have been retired until the new drop arrives.
      </p>
      <div className="notfound__links">
        <PageLink className="btn btn--primary" href={routeHref('home')}>
          <IconArrowLeft width={14} height={14} /> Back to overview
        </PageLink>
        <PageLink className="btn btn--ghost" href={routeHref('total-database')}>
          Total Database
        </PageLink>
        <PageLink className="btn btn--ghost" href={routeHref('sources')}>
          Sources &amp; method
        </PageLink>
      </div>
    </div>
  )
}
