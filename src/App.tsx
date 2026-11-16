import { lazy, Suspense, useEffect, useState } from 'react'
import { useLocation, type Route } from './lib/router'
import { useAppearance } from './lib/theme'
import { StorageUnitProvider } from './data/storageUnitContext'
import { REGISTERED_ARCHIVES } from './data/archiveRegistry'
import { Sidebar, Topbar, Footer } from './components/Shell'
import { Cursor } from './components/Cursor'
import { Settings } from './components/Settings'
import { CommandPalette } from './components/CommandPalette'
import { GlossaryDialog } from './components/GlossaryDialog'
import { ShortcutsDialog } from './components/ShortcutsDialog'
const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })))
const TotalDatabase = lazy(() =>
  import('./pages/TotalDatabase').then((module) => ({ default: module.TotalDatabase })),
)
const Backup = lazy(() => import('./pages/Backup').then((module) => ({ default: module.Backup })))
const Compare = lazy(() => import('./pages/Compare').then((module) => ({ default: module.Compare })))
const Sources = lazy(() => import('./pages/Sources').then((module) => ({ default: module.Sources })))

const TITLES: Record<Route, string> = {
  home: 'Sovereign Media Index',
  'total-database': 'Total Database',
  compare: 'Compare Channels',
  'stream-backup-1': 'Stream Backup 01',
  'stream-backup-2': 'Stream Backup 02',
  sources: 'Sources & Method',
}

export default function App() {
  const location = useLocation()
  const route = location.route
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

  const backup1 = REGISTERED_ARCHIVES.find((archive) => archive.route === 'stream-backup-1')
  const backup2 = REGISTERED_ARCHIVES.find((archive) => archive.route === 'stream-backup-2')

  return (
    <StorageUnitProvider>
      <div className="shell">
        <Sidebar
          route={route}
          appearance={appearance}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
        />
        <div className="frame">
          <Topbar route={route} />
          <main className="page">
            <Suspense fallback={<div className="page-loading" aria-hidden="true" />}>
              {route === 'home' ? <Home /> : null}
              {route === 'total-database' ? <TotalDatabase /> : null}
              {route === 'compare' ? <Compare /> : null}
              {route === 'stream-backup-1' && backup1 ? <Backup archive={backup1} index={1} /> : null}
              {route === 'stream-backup-2' && backup2 ? <Backup archive={backup2} index={2} /> : null}
              {route === 'sources' ? <Sources /> : null}
            </Suspense>
          </main>
          <Footer
            onOpenGlossary={() => setGlossaryOpen(true)}
            onOpenShortcuts={() => setShortcutsOpen(true)}
          />
        </div>
      </div>
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} appearance={appearance} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <GlossaryDialog open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <Cursor />
    </StorageUnitProvider>
  )
}
