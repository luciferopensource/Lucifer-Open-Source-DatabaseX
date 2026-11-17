import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation, type Route } from './lib/router'
import { useAppearance } from './lib/theme'
import { StorageUnitProvider } from './data/storageUnitContext'
import { Sidebar, Topbar, Footer } from './components/Shell'
import { Cursor } from './components/Cursor'
import { Settings } from './components/Settings'
import { CommandPalette } from './components/CommandPalette'
import { GlossaryDialog } from './components/GlossaryDialog'
import { ShortcutsDialog } from './components/ShortcutsDialog'
import { ErrorBoundary } from './components/ErrorBoundary'
const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })))
const TotalDatabase = lazy(() =>
  import('./pages/TotalDatabase').then((module) => ({ default: module.TotalDatabase })),
)
const NotFound = lazy(() => import('./pages/NotFound').then((module) => ({ default: module.NotFound })))
const Search = lazy(() => import('./pages/Search').then((module) => ({ default: module.Search })))
const Compare = lazy(() => import('./pages/Compare').then((module) => ({ default: module.Compare })))
const Sources = lazy(() => import('./pages/Sources').then((module) => ({ default: module.Sources })))

const TITLES: Record<Route, string> = {
  home: 'Sovereign Media Index',
  'total-database': 'Total Database',
  compare: 'Compare Channels',
  sources: 'Sources & Method',
  search: 'Search',
  'not-found': 'Not Found',
}

export default function App() {
  const location = useLocation()
  const route = location.route
  const embed = location.params.get('embed') === '1'
  const appearance = useAppearance()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  useEffect(() => {
    document.title = `${TITLES[route]} — Lucifer Database X`
  }, [route])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
        return
      }
      if (event.key === 'Escape') {
        setPaletteOpen(false)
        setGlossaryOpen(false)
        setShortcutsOpen(false)
        return
      }
      const target = event.target
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
      if (event.key === '?' && !typing) {
        event.preventDefault()
        setShortcutsOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])


  return (
    <StorageUnitProvider>
      {!embed ? (
        <a className="skip-link" href="#main">
          Skip to content
        </a>
      ) : null}
      <div className={embed ? 'shell shell--embed' : 'shell'}>
        {!embed ? (
        <Sidebar
          route={route}
          appearance={appearance}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
          onHide={() => appearance.setSidebar('hidden')}
        />
        ) : null}
        <div className="frame">
          {!embed ? (
          <Topbar
            route={route}
            tab={location.tab}
            sidebarHidden={appearance.sidebar === 'hidden'}
            onToggleSidebar={() =>
              appearance.setSidebar(appearance.sidebar === 'hidden' ? 'shown' : 'hidden')
            }
          />
          ) : null}
          <main className="page" id="main" tabIndex={-1}>
            <ErrorBoundary>
            <Suspense fallback={<div className="page-loading" aria-hidden="true" />}>
              {route === 'home' ? <Home /> : null}
              {route === 'total-database' ? <TotalDatabase /> : null}
              {route === 'compare' ? <Compare /> : null}
              {route === 'sources' ? <Sources /> : null}
              {route === 'search' ? <Search /> : null}
              {route === 'not-found' ? <NotFound /> : null}
            </Suspense>
            </ErrorBoundary>
          </main>
          {!embed ? (
            <Footer
              onOpenGlossary={() => setGlossaryOpen(true)}
              onOpenShortcuts={() => setShortcutsOpen(true)}
            />
          ) : null}
        </div>
      </div>
      {!embed ? (
        <>
          <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} appearance={appearance} />
          <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
          <GlossaryDialog open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
          <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
          <Cursor />
        </>
      ) : null}
    </StorageUnitProvider>
  )
}
