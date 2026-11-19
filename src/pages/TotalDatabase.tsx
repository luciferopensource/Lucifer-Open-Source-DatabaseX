import { getAggregatedDatabase } from '../data/aggregateDatabase'
import { useLocation, routeHref } from '../lib/router'
import { replacePath } from '../lib/url'
import { PageLink } from '../components/PageLink'
import { ExtensionLedger } from '../components/ExtensionLedger'
import { AuditTimeline, ResolutionChannelMatrix, VaultHealthCards } from '../components/Intelligence'
import { getAllArchives } from '../data/archiveRegistry'
import { useStorageUnit } from '../data/storageUnitContext'
import {
  categoriesFromAggregate,
  extensionsFromAggregate,
  resolutionFromAggregate,
  shortChannel,
  sumDurations,
} from '../lib/view'
import { Kpi, Panel, Pill, StatusPill, TabPanel, Tabs } from '../components/ui'
import { auditTimeline, resolutionByChannel, snapshotDates, vaultHealth } from '../lib/insight'
import {
  CategoryMatrix,
  ContributionCards,
  ResolutionReport,
  ScanStrip,
  StorageReport,
} from '../components/Reports'
import { IconArrowLeft, IconChart, IconClock, IconDatabase, IconShield } from '../components/Icons'
import { CopyLinkButton } from '../components/CopyLinkButton'
import { PrintButton, ShareButton } from '../components/PageActions'

type TabId = 'channel' | 'resolution' | 'storage' | 'extensions' | 'signals'
const TAB_IDS: TabId[] = ['channel', 'resolution', 'storage', 'extensions', 'signals']

export function TotalDatabase() {
  const location = useLocation()
  const tab: TabId = (TAB_IDS as string[]).includes(location.tab ?? '') ? (location.tab as TabId) : 'channel'
  const setTab = (id: string) => replacePath(`total-database/${id}`, location.params)
  const aggregate = getAggregatedDatabase()
  const { formatString } = useStorageUnit()

  const published = getAllArchives()
  const scanDuration = sumDurations(published.map((archive) => archive.dataset.scanSummary.scanDuration))
  const categories = categoriesFromAggregate(aggregate)
  const resolution = resolutionFromAggregate(aggregate)
  const extensions = extensionsFromAggregate(aggregate)
  const highlights = aggregate.storageHighlights
  const health = vaultHealth()
  const matrix = resolutionByChannel()
  const timeline = auditTimeline()
  const channels = published.map((archive) => shortChannel(archive.displayName))

  return (
    <>
      <div className="page-head">
        <PageLink className="backlink" href={routeHref('home')}>
          <IconArrowLeft width={13} height={13} /> Overview
        </PageLink>
        <div className="page-head__row">
          <div>
            <p className="eyebrow">Sovereign unified intelligence core</p>
            <h1>Total Database</h1>
            <p className="lede">
              Comprehensive multi-channel telemetry: resolution spectrum matrices, storage distribution and the
              complete cross-archive file audit, derived from the registered channel scans rather than typed in.
            </p>
          </div>
          <dl className="page-head__meta">
            <dt>Target network</dt>
            <dd>LMS-TOTAL-DB-CORE</dd>
            <dt>Registered archives</dt>
            <dd>{aggregate.archiveCount}</dd>
            <dt>Aggregate state</dt>
            <dd>
              {published.length === 0 ? <Pill tone="plain">EMPTY</Pill> : <StatusPill status={aggregate.allScansVerified ? 'COMPLETE' : 'PARTIAL'} />}
            </dd>
          </dl>
        </div>
        <div className="page-head__actions">
          <CopyLinkButton />
          <PrintButton />
          <ShareButton title="Total Database" />
        </div>
      </div>

      <div className="kpi-row">
        <Kpi
          label="Combined storage"
          value={formatString(aggregate.combinedStorage)}
          sub={`${aggregate.combinedStoragePB} full quota`}
        />
        <Kpi label="Total files found" value={aggregate.totalFiles} sub="verified records" />
        <Kpi
          label="Messages checked"
          value={aggregate.totalMessages}
          sub={published.length > 0 ? 'zero missed' : 'nothing checked yet'}
        />
        <Kpi label="Scan duration" value={scanDuration} sub={`across ${aggregate.archiveCount} scans`} />
      </div>

      <Tabs
        label="Aggregate reports"
        value={tab}
        onChange={setTab}
        items={[
          { id: 'channel', label: 'Channel analysis', count: `${aggregate.categoryBreakdown.length}` },
          { id: 'resolution', label: 'Resolution intelligence', count: `${resolution.length}` },
          { id: 'storage', label: 'Storage highlights' },
          { id: 'extensions', label: 'Extension ledger', count: `${aggregate.extensionIntelligence.uniqueExtensionsCount}` },
          { id: 'signals', label: 'Health & signals', count: `${health.length}` },
        ]}
      />

      <TabPanel id="channel" active={tab}>
        <ScanStrip
          cells={[
            { label: 'Messages checked', value: aggregate.totalMessages },
            { label: 'Files found', value: aggregate.totalFiles },
            { label: 'Combined storage', value: formatString(aggregate.combinedStorage) },
            { label: 'Scan duration', value: scanDuration },
            { label: 'Archives', value: `${aggregate.archiveCount} registered` },
            { label: 'Integrity', value: published.length === 0 ? 'No channels' : aggregate.allScansVerified ? 'All verified' : 'Partial' },
          ]}
        />

        {published.length === 0 ? (
          <div style={{ marginTop: 16 }}>
            <Panel title="No channel is published" icon={<IconDatabase />} meta="Registry empty">
              <p className="empty">
                Backup 01 and Backup 02 are unpublished while their replacements are built. Publish a registry entry
                and every total, matrix and ledger on this page merges it automatically.
              </p>
            </Panel>
          </div>
        ) : null}

        <div style={{ marginTop: 16 }}>
          <Panel
            title="Combined category breakdown"
            icon={<IconDatabase />}
            meta={`${categories.length} categories`}
            flush
          >
            {categories.length > 0 ? (
              <CategoryMatrix rows={categories} />
            ) : (
              <p className="empty" style={{ padding: '0 20px 22px' }}>
                No category records yet — publish a channel archive and its split appears here.
              </p>
            )}
          </Panel>
        </div>

        <div style={{ marginTop: 16 }}>
          <Panel title="Individual channel contributions" icon={<IconDatabase />} meta={`${aggregate.archiveCount} channels`}>
            {aggregate.channelContributions.length > 0 ? (
              <ContributionCards items={aggregate.channelContributions} />
            ) : (
              <p className="empty">No channel contributions yet — the registry is empty.</p>
            )}
          </Panel>
        </div>

        <div style={{ marginTop: 16 }}>
          <Panel title="Data integrity matrix" icon={<IconShield />} meta="Derived from the aggregate">
            <div className="chips integrity">
              {aggregate.dataIntegrity.map((item) => (
                <span className={item.verified ? 'chip chip--ok' : 'chip chip--warn'} key={item.key}>
                  {item.key} · {item.status}
                </span>
              ))}
            </div>
            <p className="note" style={{ marginTop: 14 }}>
              Each row is a live test against the aggregate built from the registry: an empty registry reports
              missing or empty rather than a wall of green.
            </p>
          </Panel>
        </div>
      </TabPanel>

      <TabPanel id="resolution" active={tab}>
        {resolution.length > 0 ? (
          <ResolutionReport rows={resolution} />
        ) : (
          <Panel title="Resolution spectrum" icon={<IconChart />} meta="0 profiles">
            <p className="empty">No resolution records yet — publish a channel archive and its tiers appear here.</p>
          </Panel>
        )}
      </TabPanel>

      <TabPanel id="storage" active={tab}>
        <StorageReport
          tiles={[
            { label: 'Combined storage', value: highlights.combinedStorage, sub: highlights.combinedStoragePB },
            { label: 'Total files', value: highlights.totalFiles, sub: `${aggregate.archiveCount} archives` },
            { label: 'Average file', value: highlights.averageFileSize, sub: 'weighted across both archives' },
            { label: 'Largest single file', value: highlights.largestFileSize, sub: 'one record' },
          ]}
          records={highlights.largestFileRecords.map((record) => ({
            name: record.fileName,
            size: record.fileSize,
            channel: shortChannel(record.channelName),
          }))}
          note="Largest and average figures are recalculated from the registered archive records. Registering a third archive lets its own largest file compete for this figure instead of inheriting a stale constant."
        />
      </TabPanel>

      <TabPanel id="extensions" active={tab}>
        <ExtensionLedger
          rows={extensions}
          scope="total-database"
          summary={{
            files: aggregate.extensionIntelligence.totalFilesAnalysed,
            unique: aggregate.extensionIntelligence.uniqueExtensionsCount,
            storage: aggregate.extensionIntelligence.totalAnalysedStorage,
          }}
        />
      </TabPanel>

      <TabPanel id="signals" active={tab}>
        <ScanStrip
          cells={[
            { label: 'Snapshot dates', value: snapshotDates().join(' · ') || '—' },
            { label: 'Registered archives', value: `${aggregate.archiveCount}` },
            { label: 'Integrity checks', value: `${aggregate.dataIntegrity.filter((item) => item.verified).length} / ${aggregate.dataIntegrity.length}` },
            { label: 'Unique extensions', value: `${aggregate.extensionIntelligence.uniqueExtensionsCount}` },
            { label: 'Largest file', value: highlights.largestFileSize },
            { label: 'Report version', value: aggregate.scanRecord.reportVersion },
          ]}
        />

        <div style={{ marginTop: 16 }}>
          <Panel title="Vault health score" icon={<IconShield />} meta="Derived, formula on the card">
            <VaultHealthCards reports={health} />
          </Panel>
        </div>

        <div style={{ marginTop: 16 }}>
          <Panel
            title="Resolution × channel matrix"
            icon={<IconChart />}
            meta={`${matrix.length} tiers · ${channels.length} channels`}
            flush
          >
            <ResolutionChannelMatrix rows={matrix} channels={channels} />
          </Panel>
        </div>

        <div style={{ marginTop: 16 }}>
          <Panel title="Audit timeline" icon={<IconClock />} meta={`${timeline.length} recorded facts`}>
            <AuditTimeline events={timeline} />
            <p className="note" style={{ marginTop: 16 }}>
              Both scans carry the same completion date, so this is one snapshot rather than a trend. A trend chart
              appears automatically once the registry holds archives from different audit dates — inventing a delta
              from a single snapshot would break the data-honesty rule.
            </p>
          </Panel>
        </div>
      </TabPanel>

      <p className="note" style={{ marginTop: 24 }}>
        <Pill tone="plain">Report {aggregate.scanRecord.reportVersion}</Pill>{' '}
        <span style={{ marginLeft: 8 }}>
          Aggregate scan {aggregate.scanRecord.scanId} · completed {aggregate.scanRecord.completed} · cache{' '}
          {aggregate.scanRecord.databaseCache}
        </span>
      </p>
    </>
  )
}
