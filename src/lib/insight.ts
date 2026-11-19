/**
 * Insight derivations.
 *
 * Everything here is computed from the registered archives and the aggregate —
 * no new figures, no inferred values. Where the source data only supports one
 * snapshot (both audits are dated 27 Oct 2026), the UI says so instead of
 * drawing a trend line that does not exist.
 */

import { getAllArchives } from '../data/archiveRegistry'
import { getAggregatedDatabase } from '../data/aggregateDatabase'
import { shortChannel } from './view'

export interface ScorePart {
  label: string
  detail: string
  points: number
  max: number
}

export interface VaultHealth {
  id: string
  name: string
  scanId: string
  score: number
  grade: string
  parts: ScorePart[]
}

/** Weighted, transparent score: integrity 40, index completeness 40, status 20. */
export function vaultHealth(archives = getAllArchives()): VaultHealth[] {
  return archives.map((archive) => {
    const checks = archive.dataset.dataIntegrity
    const passed = checks.filter((check) => check.verified).length
    const totalChecks = checks.length || 1
    const completeness = archive.numericMessages > 0 ? Math.min(1, archive.numericFiles / archive.numericMessages) : 0

    const integrityPoints = (passed / totalChecks) * 40
    const completenessPoints = completeness * 40
    const statusPoints = archive.status === 'COMPLETE' ? 20 : 0
    const score = Math.round((integrityPoints + completenessPoints + statusPoints) * 10) / 10

    return {
      id: archive.id,
      name: shortChannel(archive.displayName),
      scanId: archive.scanId,
      score,
      grade: score >= 97 ? 'A+' : score >= 94 ? 'A' : score >= 90 ? 'B' : 'C',
      parts: [
        {
          label: 'Integrity checks',
          detail: `${passed} of ${totalChecks} verified`,
          points: integrityPoints,
          max: 40,
        },
        {
          label: 'Index completeness',
          detail: `${archive.totalFiles} files from ${archive.messagesChecked} messages`,
          points: completenessPoints,
          max: 40,
        },
        {
          label: 'Scan status',
          detail: `${archive.status} · ${archive.dataset.scanSummary.scanIntegrity}`,
          points: statusPoints,
          max: 20,
        },
      ],
    }
  })
}

export interface MatrixCell {
  channel: string
  files: string
  storage: string
  share: number
}

export interface MatrixRow {
  id: string
  label: string
  tag: string
  files: string
  storage: string
  cells: MatrixCell[]
}

const toCount = (value: string) => Number(value.replace(/,/g, '')) || 0

/** Resolution rows crossed with the channels that contributed to them. */
export function resolutionByChannel(archives?: Parameters<typeof getAggregatedDatabase>[0]): MatrixRow[] {
  return getAggregatedDatabase(archives).resolutionMatrix.map((row) => {
    const total = row.numericFiles || 1
    return {
      id: row.id,
      label: row.label,
      tag: row.tag,
      files: row.files,
      storage: row.storage,
      cells: row.contributions.map((entry) => ({
        channel: shortChannel(entry.channelName),
        files: entry.files,
        storage: entry.storage,
        share: toCount(entry.files) / total,
      })),
    }
  })
}

export interface TimelineEvent {
  id: string
  when: string
  title: string
  detail: string
  facts: string[]
}

/** Audit facts only: completion, index totals, integrity outcome, scan reference. */
export function auditTimeline(archives = getAllArchives()): TimelineEvent[] {
  const aggregate = getAggregatedDatabase(archives)
  const events: TimelineEvent[] = []

  for (const archive of archives) {
    const checks = archive.dataset.dataIntegrity
    const passed = checks.filter((check) => check.verified).length

    events.push({
      id: `${archive.id}-index`,
      when: archive.completedDate,
      title: `${shortChannel(archive.displayName)} scan completed`,
      detail: `${archive.messagesChecked} messages checked, ${archive.totalFiles} files indexed across ${archive.combinedStorage}.`,
      facts: [archive.scanId, archive.dataset.scanSummary.scanDuration, archive.scanner],
    })

    events.push({
      id: `${archive.id}-integrity`,
      when: archive.completedDate,
      title: `${shortChannel(archive.displayName)} integrity audit cleared`,
      detail: `${passed} of ${checks.length} checks verified, ${archive.dataset.extensionSummary.uniqueExtensions} unique extensions recorded.`,
      facts: [archive.channelId ?? 'channel id not recorded', archive.dataset.scanSummary.scanIntegrity, archive.reportVersion],
    })
  }

  if (archives.length === 0) return events

  events.push({
    id: 'aggregate',
    when: aggregate.scanRecord.completed,
    title: 'Cross-archive aggregate reconciled',
    detail: `${aggregate.totalFiles} files and ${aggregate.combinedStorage} merged into one union with ${aggregate.extensionIntelligence.uniqueExtensionsCount} unique extensions.`,
    facts: [aggregate.scanRecord.scanId, `${aggregate.archiveCount} archives`, aggregate.scanRecord.databaseCache],
  })

  return events
}

/** One snapshot date across the registry means a trend line would be invented. */
export function snapshotDates(archives = getAllArchives()): string[] {
  return Array.from(new Set(archives.map((archive) => archive.completedDate)))
}
