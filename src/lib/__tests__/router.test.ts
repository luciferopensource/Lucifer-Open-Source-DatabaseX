import { describe, expect, it } from 'vitest'
import { parsePath, routeHref } from '../router'

describe('router', () => {
  it('maps the root to home', () => {
    expect(parsePath('/', '').route).toBe('home')
  })

  it('reads the report tab from the second segment', () => {
    const location = parsePath('/total-database/extensions', '?q=mkv')
    expect(location.route).toBe('total-database')
    expect(location.tab).toBe('extensions')
    expect(location.params.get('q')).toBe('mkv')
  })

  it('treats retired backup routes as not found', () => {
    expect(parsePath('/stream-backup-1', '').route).toBe('not-found')
    expect(parsePath('/stream-backup-2', '').route).toBe('not-found')
  })

  it('treats unknown paths as not found instead of home', () => {
    expect(parsePath('/nonsense', '').route).toBe('not-found')
  })

  it('builds route hrefs with tabs and params', () => {
    expect(routeHref('home')).toBe('/')
    expect(routeHref('total-database')).toBe('/total-database')
    expect(routeHref('total-database', 'extensions', { q: '.mkv' })).toBe('/total-database/extensions?q=.mkv')
  })
})
