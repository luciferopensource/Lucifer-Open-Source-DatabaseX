/**
 * URL state.
 *
 * Pages live on real paths (`/total-database`, `/stream-backup-1/extensions?q=.mkv`)
 * so links can open in a new tab and each view has a shareable address.
 * Filters, tabs and pagination live in the query string; writes use
 * history.replaceState so typing in a filter never floods the back stack.
 *
 * Legacy `#/route` fragments are redirected to their path on boot.
 */

const URL_EVENT = 'lx:url'

export interface UrlState {
  /** Path without leading or trailing slashes: '' for home, 'stream-backup-1/extensions'. */
  base: string
  params: URLSearchParams
}

export function readUrl(pathname: string, search: string): UrlState {
  const base = pathname.replace(/^\/+|\/+$/g, '')
  return { base, params: new URLSearchParams(search) }
}

export function pathHref(base: string, params?: URLSearchParams): string {
  const query = params?.toString()
  return `/${base}${query ? `?${query}` : ''}`
}

export function replacePath(base: string, params?: URLSearchParams): void {
  const next = pathHref(base, params)
  if (`${window.location.pathname}${window.location.search}` === next) return
  window.history.replaceState(null, '', next)
  window.dispatchEvent(new Event(URL_EVENT))
}

export function navigateTo(href: string): void {
  window.history.pushState(null, '', href)
  window.dispatchEvent(new Event(URL_EVENT))
  window.scrollTo(0, 0)
}

export function subscribeUrl(callback: () => void): () => void {
  window.addEventListener('popstate', callback)
  window.addEventListener(URL_EVENT, callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener(URL_EVENT, callback)
  }
}

/**
 * Turns an old `#/total-database/extensions?q=.mkv` fragment into its path
 * equivalent. Runs once, before the app mounts.
 */
export function migrateLegacyHash(): void {
  const hash = window.location.hash
  if (!hash.startsWith('#/')) return
  const [path, query = ''] = hash.slice(2).split('?')
  window.history.replaceState(null, '', `/${path}${query ? `?${query}` : ''}`)
}
