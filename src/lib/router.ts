import { useEffect, useState } from 'react'

export type Route = 'home' | 'total-database' | 'stream-backup-1' | 'stream-backup-2'

const ROUTES: Route[] = ['home', 'total-database', 'stream-backup-1', 'stream-backup-2']

function parseHash(hash: string): Route {
  const key = hash.replace(/^#\/?/, '')
  return (ROUTES as string[]).includes(key) ? (key as Route) : 'home'
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}
