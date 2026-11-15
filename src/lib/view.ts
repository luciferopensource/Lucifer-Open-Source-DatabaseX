import type { ChannelIntelligenceDataset, ExtensionRecord } from '../data/channelIntelligenceData'
import type { AggregatedDatabaseResult } from '../data/aggregateDatabase'
import { parseStorageToBytes } from '../data/aggregateDatabase'

/** "Lucifer Stream Site Backup 1" → "Backup 1" for dense provenance cells. */
export function shortChannel(name: string): string {
  return name.replace(/^Lucifer Stream Site\s*/i, '').replace(/^Backup\s*/, 'Backup ')
}

export function toPercentage(value: string): number {
  const parsed = parseFloat(value.replace('%', ''))
  return Number.isFinite(parsed) ? parsed : 0
}

/** Adds "2h 52m 25s" + "2h 43m 48s" = "5h 36m 13s" without hard-coding a total. */
export function sumDurations(values: string[]): string {
  let totalSeconds = 0
  for (const value of values) {
    const hours = /(\d+)\s*h/.exec(value)
    const minutes = /(\d+)\s*m/.exec(value)
    const seconds = /(\d+)\s*s/.exec(value)
    totalSeconds += (hours ? Number(hours[1]) * 3600 : 0) + (minutes ? Number(minutes[1]) * 60 : 0) + (seconds ? Number(seconds[1]) : 0)
  }
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}h ${m}m ${s}s`
}

export interface CategoryRow {
  id: string
  icon: string
  category: string
  files: string
  storage: string
  pct: number
}

export interface ResolutionRow {
  id: string
  label: string
  tag: string
  files: string
  storage: string
  pct: number
  pctLabel: string
  contributions: { channelName: string; files: string; storage: string }[]
}

export interface ExtensionRow {
  extension: string
  category: string
  files: string
  numericFiles: number
  storage: string
  bytes: number
  provenance: string
}

export function categoriesFromDataset(dataset: ChannelIntelligenceDataset): CategoryRow[] {
  return dataset.categoryBreakdown.map((item) => ({
    id: item.id,
    icon: item.icon,
    category: item.category,
    files: item.files,
    storage: item.storage,
    pct: toPercentage(item.percentage),
  }))
}

export function categoriesFromAggregate(aggregate: AggregatedDatabaseResult): CategoryRow[] {
  return aggregate.categoryBreakdown.map((item) => ({
    id: item.id,
    icon: item.icon,
    category: item.category,
    files: item.files,
    storage: item.storage,
    pct: toPercentage(item.percentage),
  }))
}

export function resolutionFromDataset(dataset: ChannelIntelligenceDataset): ResolutionRow[] {
  return dataset.resolutionBreakdown.map((item) => ({
    id: item.id,
    label: item.label,
    tag: item.tag,
    files: item.files,
    storage: item.storage,
    pct: item.numericPercentage,
    pctLabel: item.percentage,
    contributions: [],
  }))
}

export function resolutionFromAggregate(aggregate: AggregatedDatabaseResult): ResolutionRow[] {
  return aggregate.resolutionMatrix.map((item) => ({
    id: item.id,
    label: item.label,
    tag: item.tag,
    files: item.files,
    storage: item.storage,
    pct: item.numericPercentage,
    pctLabel: item.aggregatePercentage,
    contributions: item.contributions,
  }))
}

export function extensionsFromDataset(dataset: ChannelIntelligenceDataset): ExtensionRow[] {
  return dataset.extensionRecords.map((record: ExtensionRecord) => ({
    extension: record.extension,
    category: record.category,
    files: record.files,
    numericFiles: record.numericFiles,
    storage: record.storage,
    bytes: parseStorageToBytes(record.storage),
    provenance: `Page ${record.page}`,
  }))
}

export function extensionsFromAggregate(aggregate: AggregatedDatabaseResult): ExtensionRow[] {
  return aggregate.extensionIntelligence.records.map((record) => ({
    extension: record.extension,
    category: record.category,
    files: record.files,
    numericFiles: record.numericFiles,
    storage: record.storage,
    bytes: record.numericStorageBytes,
    provenance:
      Array.from(new Set(record.channelContributions.map((contribution) => shortChannel(contribution.channelName)))).join(
        ' · ',
      ) || '—',
  }))
}
