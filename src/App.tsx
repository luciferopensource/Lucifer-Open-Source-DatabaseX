import { useEffect, useState } from 'react'
import { useRoute } from './lib/router'
import { useAppearance } from './lib/theme'
import { StorageUnitProvider } from './data/storageUnitContext'
import { REGISTERED_ARCHIVES } from './data/archiveRegistry'
import { Sidebar, Topbar, Footer } from './components/Shell'
import { Cursor } from './components/Cursor'
import { Settings } from './components/Settings'
import { Home } from './pages/Home'
import { TotalDatabase } from './pages/TotalDatabase'
import { Backup } from './pages/Backup'
import type { Route } from './lib/router'

const TITLES: Record<Route, string> = {
  home: 'Sovereign Media Index',
  'total-database': 'Total Database',
  'stream-backup-1': 'Stream Backup 01',
  'stream-backup-2': 'Stream Backup 02',
}

export default function App() {
  const route = useRoute()
  const appearance = useAppearance()
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    document.title = `${TITLES[route]} — Lucifer Database X`
  }, [route])

  const backup1 = REGISTERED_ARCHIVES.find((archive) => archive.route === 'stream-backup-1')
  const backup2 = REGISTERED_ARCHIVES.find((archive) => archive.route === 'stream-backup-2')

  return (
    <StorageUnitProvider>
      <div className="shell">
        <Sidebar route={route} appearance={appearance} onOpenSettings={() => setSettingsOpen(true)} />
        <div className="frame">
          <Topbar route={route} />
          <main className="page">
            {route === 'home' ? <Home /> : null}
            {route === 'total-database' ? <TotalDatabase /> : null}
            {route === 'stream-backup-1' && backup1 ? <Backup archive={backup1} index={1} /> : null}
            {route === 'stream-backup-2' && backup2 ? <Backup archive={backup2} index={2} /> : null}
          </main>
          <Footer />
        </div>
      </div>
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} appearance={appearance} />
      <Cursor />
    </StorageUnitProvider>
  )
}
