import type { ArchiveRecord } from '../data/archiveSchemas'
import { useLocation, routeHref } from '../lib/router'
import { replacePath } from '../lib/url'
import { PageLink } from '../components/PageLink'
import { CopyButton } from '../components/CopyButton'
import { ExtensionLedger } from '../components/ExtensionLedger'
import { useStorageUnit } from '../data/storageUnitContext'
import { categoriesFromDataset, extensionsFromDataset, resolutionFromDataset } from '../lib/view'
import { Kpi, Panel, Pill, TabPanel, Tabs } from '../components/ui'
import {
  CategoryMatrix,
  ResolutionReport,
  ScanStrip,
  StorageReport,
} from '../components/Reports'
import { IconArrowLeft, IconDatabase, IconShield } from '../components/Icons'

type TabId = 'channel' | 'resolution' | 'storage' | 'extensions'
const TAB_IDS: TabId[] = ['channel', 'resolution', 'storage', 'extensions']

const REPORT_META: { key: 'channelAnalysisScanRecord' | 'resolutionScanRecord' | 'storageScanRecord' | 'extensionScanRecord'; label: string }[] = [
  { key: 'channelAnalysisScanRecord', label: 'Channel analysis' },
  { key: 'resolutionScanRecord', label: 'Resolution intelligence' },
  { key: 'storageScanRecord', label: 'Storage highlights' },
  { key: 'extensionScanRecord', label: 'File extension ledger' },
]

export function Backup({ archive, index }: { archive: ArchiveRecord; index: number }) {
  const location = useLocation()
  const tab: TabId = (TAB_IDS as string[]).includes(location.tab ?? '') ? (location.tab as TabId) : 'channel'
  const setTab = (id: string) => replacePath(`${archive.route}/${id}`, location.params)
  const dataset = archive.dataset
  const { formatString } = useStorageUnit()

  const categories = categoriesFromDataset(dataset)
  const resolution = resolutionFromDataset(dataset)
  const extensions = extensionsFromDataset(dataset)
  const summary = dataset.scanSummary
  const storage = dataset.storageHighlights
  const target = dataset.targetInfo

  return (
    <>
      <div className="page-head">
        <PageLink className="backlink" href={routeHref('home')}>
          <IconArrowLeft width={13} height={13} /> Overview
        </PageLink>
        <div className="page-head__row">
          <div>
            <p className="eyebrow">
              Backup report {String(index).padStart(2, '0')} / {target.scanId}
            </p>
            <h1>{archive.displayName}</h1>
            <p className="lede">
              Complete file-level audit of this channel vault: category distribution, resolution spectrum, storage
              highlights and the full extension ledger, as returned by the {target.reportVersion} scan.
            </p>
          </div>
          <dl className="page-head__meta">
            <dt>Channel ID</dt>
            <dd className="meta-copy">
              {target.channelId}
              <CopyButton value={target.channelId} label="channel ID" />
            </dd>
            <dt>Scanner</dt>
            <dd>{target.scanner}</dd>
            <dt>Completed</dt>
            <dd>{target.completedDate}</dd>
            <dt>Engine</dt>
            <dd>{target.intelligenceEngine}</dd>
          </dl>
        </div>
      </div>

      <div className="kpi-row">
        <Kpi label="Archived storage" value={formatString(summary.combinedSize)} sub="file payload only" />
        <Kpi label="Files found" value={summary.totalFilesFound} sub="verified records" />
        <Kpi label="Messages checked" value={summary.messagesChecked} sub="zero missed" />
        <Kpi label="Scan duration" value={summary.scanDuration} sub={summary.scannerWorker} />
      </div>

      <div style={{ marginTop: 24 }}>
        <ScanStrip
          cells={[
            { label: 'Channel ID', value: target.channelId },
            { label: 'Scan ID', value: target.scanId },
            { label: 'Scanner node', value: target.scanner },
            { label: 'Completed', value: target.completedDate },
            { label: 'Intelligence engine', value: target.intelligenceEngine },
            { label: 'Report version', value: target.reportVersion },
          ]}
        />
      </div>

      <Tabs
        label={`${archive.displayName} reports`}
        value={tab}
        onChange={setTab}
        items={[
          { id: 'channel', label: 'Channel analysis', count: `${categories.length}` },
          { id: 'resolution', label: 'Resolution intelligence', count: `${resolution.length}` },
          { id: 'storage', label: 'Storage highlights' },
          { id: 'extensions', label: 'Extension ledger', count: `${dataset.extensionSummary.uniqueExtensions}` },
        ]}
      />

      <TabPanel id="channel" active={tab}>
        <Panel
          title="Category breakdown"
          icon={<IconDatabase />}
          meta={`${categories.length} categories · ${summary.totalFilesFound} files`}
          flush
        >
          <CategoryMatrix rows={categories} />
        </Panel>

        <div style={{ marginTop: 16 }}>
          <Panel title="Data integrity matrix" icon={<IconShield />} meta={summary.scanIntegrity}>
            <div className="chips integrity">
              {dataset.dataIntegrity.map((item) => (
                <span className={item.verified ? 'chip chip--ok' : 'chip chip--warn'} key={item.key}>
                  {item.key} · {item.status}
                </span>
              ))}
            </div>

            <div className="record-list" style={{ marginTop: 18 }}>
              {REPORT_META.map((report) => {
                const record = dataset[report.key]
                return (
                  <div className="record" key={report.key}>
                    <span className="record__name">
                      {report.label} <span className="muted">· {record.scanId}</span>
                    </span>
                    <span className="record__size">
                      <Pill tone={record.status === 'COMPLETE' || record.status === 'AUDITED' ? 'pos' : 'plain'}>{record.status}</Pill>{' '}
                      <span className="muted" style={{ marginLeft: 6, fontSize: '0.68rem' }}>
                        {record.databaseCache} · {record.completed}
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
          </Panel>
        </div>
      </TabPanel>

      <TabPanel id="resolution" active={tab}>
        <ResolutionReport rows={resolution} />
      </TabPanel>

      <TabPanel id="storage" active={tab}>
        <StorageReport
          tiles={[
            { label: 'Total archived storage', value: storage.totalStorage, sub: 'file payload only' },
            { label: 'Largest single file', value: storage.largestFileSize, sub: 'one record' },
            { label: 'Average file', value: storage.averageFileSize, sub: 'arithmetic mean' },
            { label: 'Total files', value: storage.totalFiles, sub: `${categories.length} categories` },
          ]}
          records={[{ name: storage.largestFileName, size: storage.largestFileSize }]}
          note="Storage totals describe the file payload reported by the scanner and exclude message metadata. The largest record is the single heaviest file found in this channel."
        />
      </TabPanel>

      <TabPanel id="extensions" active={tab}>
        <ExtensionLedger
          rows={extensions}
          scope={`backup-${index}`}
          summary={{
            files: dataset.extensionSummary.totalFilesAnalysed,
            unique: dataset.extensionSummary.uniqueExtensions,
            storage: dataset.extensionSummary.totalAnalysedStorage,
            pages: dataset.extensionSummary.totalPages,
          }}
        />
      </TabPanel>

      <p className="note" style={{ marginTop: 24 }}>
        <Pill tone="plain">Report {target.reportVersion}</Pill>{' '}
        <span style={{ marginLeft: 8 }}>
          Scan {target.scanId} · status {target.status} · {summary.scannerWorker}
        </span>
      </p>
    </>
  )
}
