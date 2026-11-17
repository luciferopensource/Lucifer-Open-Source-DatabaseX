import { useEffect, useState } from 'react'
import { readUrl, subscribeUrl } from './url'

export type Route = 'home' | 'total-database' | 'compare' | 'sources' | 'search' | 'not-found'

const KNOWN: Route[] = ['home', 'total-database', 'compare', 'sources', 'search']

export interface Location {
  route: Route
  /** Second path segment, e.g. the report tab: `extensions`. */
  tab: string | null
  params: URLSearchParams
  /** Full path part, needed when only the query string changes. */
  base: string
}

export function parsePath(pathname: string, search: string): Location {
  const { base, params } = readUrl(pathname, search)
  const segments = base.split('/').filter(Boolean)
  const head = segments[0] ?? ''

  // Unknown paths (including the retired backup pages) get an honest 404 rather
  // than silently rendering the home page.
  const route: Route = head === '' ? 'home' : (KNOWN as string[]).includes(head) ? (head as Route) : 'not-found'
  return { route, tab: segments[1] ?? null, params, base }
}

export function useLocation(): Location {
  const [location, setLocation] = useState<Location>(() =>
    parsePath(window.location.pathname, window.location.search),
  )

  useEffect(() => {
    const sync = () => setLocation(parsePath(window.location.pathname, window.location.search))
    return subscribeUrl(sync)
  }, [])

  return location
}

export function routeHref(route: Exclude<Route, 'not-found'>, tab?: string | null, params?: Record<string, string>): string {
  const base = route === 'home' ? '/' : `/${route}${tab ? `/${tab}` : ''}`
  const query = params ? new URLSearchParams(params).toString() : ''
  return `${base}${query ? `?${query}` : ''}`
}
