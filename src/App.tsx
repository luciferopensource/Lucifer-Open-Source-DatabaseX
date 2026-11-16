import { useEffect, useState } from 'react'
import { useLocation, type Route } from './lib/router'
import { useAppearance } from './lib/theme'
import { StorageUnitProvider } from './data/storageUnitContext'
import { REGISTERED_ARCHIVES } from './data/archiveRegistry'
import { Sidebar, Topbar, Footer } from './components/Shell'
import { Cursor } from './components/Cursor'
import { Settings } from './components/Settings'
import { CommandPalette } from './components/CommandPalette'
import { GlossaryDialog } from './components/GlossaryDialog'
import { Home } from './pages/Home'
import { TotalDatabase } from './pages/TotalDatabase'
import { Backup } from './pages/Backup'
import { Compare } from './pages/Compare'
import { Sources } from './pages/Sources'

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
            {route === 'home' ? <Home /> : null}
            {route === 'total-database' ? <TotalDatabase /> : null}
            {route === 'compare' ? <Compare /> : null}
            {route === 'stream-backup-1' && backup1 ? <Backup archive={backup1} index={1} /> : null}
            {route === 'stream-backup-2' && backup2 ? <Backup archive={backup2} index={2} /> : null}
            {route === 'sources' ? <Sources /> : null}
          </main>
          <Footer onOpenGlossary={() => setGlossaryOpen(true)} />
        </div>
      </div>
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} appearance={appearance} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <GlossaryDialog open={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
      <Cursor />
    </StorageUnitProvider>
  )
}
