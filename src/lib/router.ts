import { useEffect, useState } from 'react'
import { readUrl, subscribeUrl } from './url'

export type Route = 'home' | 'total-database' | 'compare' | 'stream-backup-1' | 'stream-backup-2' | 'sources'

const ROUTES: Route[] = ['home', 'total-database', 'compare', 'stream-backup-1', 'stream-backup-2', 'sources']

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
  const route = (ROUTES as string[]).includes(head) ? (head as Route) : 'home'
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

export function routeHref(route: Route, tab?: string | null, params?: Record<string, string>): string {
  const base = route === 'home' ? '/' : `/${route}${tab ? `/${tab}` : ''}`
  const query = params ? new URLSearchParams(params).toString() : ''
  return `${base}${query ? `?${query}` : ''}`
}
