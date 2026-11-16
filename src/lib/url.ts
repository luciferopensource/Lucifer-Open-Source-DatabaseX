/**
 * URL state for hash routes.
 *
 * The app keeps using hash routing (same contract as the source project) but
 * filters, tabs and pagination live in the fragment query string, so any view
 * can be shared as a link:
 *
 *   #/stream-backup-1/extensions?q=.mkv&cat=video&page=3&sort=files
 *
 * Writes use history.replaceState so filtering never floods the back stack,
 * and a custom event keeps every subscriber in sync without a page reload.
 */

const URL_EVENT = 'lx:url'

export interface HashState {
  /** Path part without the leading `#/`, e.g. `stream-backup-1/extensions`. */
  base: string
  params: URLSearchParams
}

export function readHash(hash: string = window.location.hash): HashState {
  const raw = hash.replace(/^#\/?/, '')
  const [base, query = ''] = raw.split('?')
  return { base, params: new URLSearchParams(query) }
}

export function hashHref(base: string, params?: URLSearchParams): string {
  const query = params?.toString()
  return `#/${base}${query ? `?${query}` : ''}`
}

export function replaceHash(base: string, params?: URLSearchParams): void {
  const next = hashHref(base, params)
  if (window.location.hash === next) return
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`)
  window.dispatchEvent(new Event(URL_EVENT))
}

export function subscribeHash(callback: () => void): () => void {
  window.addEventListener('hashchange', callback)
  window.addEventListener(URL_EVENT, callback)
  return () => {
    window.removeEventListener('hashchange', callback)
    window.removeEventListener(URL_EVENT, callback)
  }
}
