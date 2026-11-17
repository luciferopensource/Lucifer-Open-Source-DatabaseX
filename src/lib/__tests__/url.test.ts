import { beforeEach, describe, expect, it, vi } from 'vitest'
import { migrateLegacyHash, navigateTo, pathHref, readUrl, replacePath } from '../url'

describe('url state', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('splits path and query', () => {
    const state = readUrl('/total-database/extensions', '?q=mkv&page=2')
    expect(state.base).toBe('total-database/extensions')
    expect(state.params.get('q')).toBe('mkv')
    expect(state.params.get('page')).toBe('2')
  })

  it('builds hrefs with and without a query', () => {
    expect(pathHref('compare')).toBe('/compare')
    expect(pathHref('search', new URLSearchParams({ q: '.mkv' }))).toBe('/search?q=.mkv')
  })

  it('replacePath rewrites the address without pushing history', () => {
    const onChange = vi.fn()
    window.addEventListener('lx:url', onChange)
    replacePath('total-database/resolution', new URLSearchParams({ unit: 'TB' }))
    window.removeEventListener('lx:url', onChange)

    expect(window.location.pathname).toBe('/total-database/resolution')
    expect(window.location.search).toBe('?unit=TB')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(window.history.length).toBeGreaterThan(0)
  })

  it('navigateTo pushes a new entry', () => {
    window.history.replaceState(null, '', '/')
    navigateTo('/sources')
    expect(window.location.pathname).toBe('/sources')
  })

  it('migrates a legacy hash route', () => {
    window.history.replaceState(null, '', '/#/compare?tab=storage')
    migrateLegacyHash()
    expect(window.location.pathname).toBe('/compare')
    expect(window.location.search).toBe('?tab=storage')
    expect(window.location.hash).toBe('')
  })
})
