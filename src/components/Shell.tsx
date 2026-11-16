import type { Route } from '../lib/router'
import { routeHref } from '../lib/router'
import { PageLink } from './PageLink'
import type { Appearance } from '../lib/theme'
import { ACCENTS } from '../lib/theme'
import { getAggregatedDatabase } from '../data/aggregateDatabase'
import { OWNER_INFO, TELEGRAM_COMMUNITY_LINKS } from '../data/channelIntelligenceData'
import { useStorageUnit, type StorageUnit } from '../data/storageUnitContext'
import { IconChart, IconDatabase, IconFilm, IconGrid, IconSearch, IconSettings, IconShield } from './Icons'

const NAV: { route: Route; label: string; index: string; Icon: typeof IconGrid }[] = [
  { route: 'home', label: 'Overview', index: '00', Icon: IconGrid },
  { route: 'total-database', label: 'Total Database', index: '01', Icon: IconDatabase },
  { route: 'compare', label: 'Compare', index: '02', Icon: IconChart },
  { route: 'stream-backup-1', label: 'Backup 01', index: '03', Icon: IconFilm },
  { route: 'stream-backup-2', label: 'Backup 02', index: '04', Icon: IconFilm },
  { route: 'sources', label: 'Sources', index: '05', Icon: IconShield },
]

const PAGE_TITLES: Record<Route, string> = {
  home: 'Overview',
  'total-database': 'Total Database',
  compare: 'Compare Channels',
  'stream-backup-1': 'Stream Backup 01',
  'stream-backup-2': 'Stream Backup 02',
  sources: 'Sources & Method',
}

function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect x="3" y="3" width="4.6" height="18" rx="1.4" fill="currentColor" />
      <rect x="9.7" y="3" width="4.6" height="11" rx="1.4" fill="currentColor" opacity="0.65" />
      <rect x="16.4" y="3" width="4.6" height="15" rx="1.4" fill="currentColor" opacity="0.4" />
    </svg>
  )
}

export function Sidebar({
  route,
  appearance,
  onOpenSettings,
  onOpenPalette,
}: {
  route: Route
  appearance: Appearance
  onOpenSettings: () => void
  onOpenPalette: () => void
}) {
  const { unit, setUnit } = useStorageUnit()
  const aggregate = getAggregatedDatabase()
  const modeLabel = appearance.theme === 'dark' ? 'Dark' : 'Light'
  const accentLabel = ACCENTS.find((accent) => accent.id === appearance.accent)?.label ?? 'Original blue'

  return (
    <aside className="sidebar">
      <PageLink className="brand" href={routeHref('home')}>
        <span className="brand__mark">
          <BrandMark />
        </span>
        <span className="brand__text">
          <span className="brand__name">Lucifer Database X</span>
          <span className="brand__meta">Sovereign media index</span>
        </span>
      </PageLink>

      <button type="button" className="nav__search" onClick={onOpenPalette}>
        <IconSearch width={14} height={14} />
        Search everything
        <kbd>⌘K</kbd>
      </button>

      <nav className="nav" aria-label="Primary">
        <span className="nav__label">Workspace</span>
        {NAV.map((item) => (
          <PageLink
            key={item.route}
            className={route === item.route ? 'nav__item is-active' : 'nav__item'}
            href={routeHref(item.route)}
            aria-current={route === item.route ? 'page' : undefined}
          >
            <item.Icon />
            {item.label}
            <span className="nav__index">{item.index}</span>
          </PageLink>
        ))}
      </nav>

      <div className="sidebar__foot">
        <button type="button" className="appearance-trigger" onClick={onOpenSettings}>
          <IconSettings width={15} height={15} />
          <span className="appearance-trigger__text">
            <span className="appearance-trigger__label">Appearance</span>
            <span className="appearance-trigger__value">
              {modeLabel} · {accentLabel}
            </span>
          </span>
          <span className="appearance-trigger__dot" aria-hidden="true" />
        </button>

        <div className="unit">
          <span className="unit__label">Storage unit</span>
          <div className="unit__chips" role="group" aria-label="Storage unit">
            {(['AUTO', 'PB', 'TB', 'GB', 'MB'] as StorageUnit[]).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={unit === option}
                onClick={() => setUnit(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="status-line">
          <span className="status-line__dot" />
          {aggregate.archiveCount} channels verified
        </div>
      </div>
    </aside>
  )
}

export function Topbar({ route }: { route: Route }) {
  const { formatString } = useStorageUnit()
  const aggregate = getAggregatedDatabase()

  return (
    <header className="topbar">
      <div className="crumbs">
        <span>Index</span>
        <em>/</em>
        <b>{PAGE_TITLES[route]}</b>
      </div>
      <div className="telemetry">
        <span>
          <span className="telemetry__dot" />
          {aggregate.archiveCount} channels
        </span>
        <span>{formatString(aggregate.combinedStorage)} volume</span>
        <span>{aggregate.totalFiles} files</span>
      </div>
    </header>
  )
}

export function Footer({
  onOpenGlossary,
  onOpenShortcuts,
}: {
  onOpenGlossary: () => void
  onOpenShortcuts: () => void
}) {
  const aggregate = getAggregatedDatabase()
  const built = new Date(__BUILD_TIME__).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <h3>Lucifer Database X</h3>
          <p>
            A presentation layer for verified channel scan telemetry. {aggregate.archiveCount} archives,{' '}
            {aggregate.totalFiles} indexed files and{' '}
            {aggregate.extensionIntelligence.uniqueExtensionsCount.toLocaleString('en-GB')} unique extensions — every
            figure on this site traced back to the two audit reports. Nothing here is estimated.
          </p>
        </div>

        <div className="footer__col">
          <h4>Community dispatch</h4>
          {TELEGRAM_COMMUNITY_LINKS.map((link) => (
            <a className="footer__link" key={link.id} href={link.url} target="_blank" rel="noreferrer">
              {link.title}
              <span>{link.handleOrEmail}</span>
            </a>
          ))}
        </div>

        <div className="footer__col">
          <h4>Reports</h4>
          <PageLink className="footer__link" href={routeHref('total-database')}>
            Total Database <span>Aggregate</span>
          </PageLink>
          <PageLink className="footer__link" href={routeHref('compare')}>
            Compare channels <span>Head to head</span>
          </PageLink>
          <PageLink className="footer__link" href={routeHref('stream-backup-1')}>
            Backup 01 <span>LMS-4D0E-6C2A</span>
          </PageLink>
          <PageLink className="footer__link" href={routeHref('stream-backup-2')}>
            Backup 02 <span>LMS-94E3-7DE1</span>
          </PageLink>
          <PageLink className="footer__link" href={routeHref('sources')}>
            Sources &amp; method <span>Provenance</span>
          </PageLink>
          <PageLink className="footer__link" href={routeHref('home')}>
            Overview <span>Living archive</span>
          </PageLink>
          <button type="button" className="footer__link footer__link--button" onClick={onOpenGlossary}>
            Glossary <span>Quick reference</span>
          </button>
          <button type="button" className="footer__link footer__link--button" onClick={onOpenShortcuts}>
            Shortcuts <span>Press ?</span>
          </button>
        </div>
      </div>

      <div className="footer__bar">
        <div className="footer__bar-inner">
          <span>
            © 2026 {OWNER_INFO.entity} · {OWNER_INFO.role}
          </span>
          <span>
            Build <b>{__BUILD_COMMIT__}</b> · {built} · no canvas · no fabricated records
          </span>
        </div>
      </div>
    </footer>
  )
}
