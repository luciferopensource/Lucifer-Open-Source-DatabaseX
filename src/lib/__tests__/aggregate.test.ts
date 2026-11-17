import { describe, expect, it } from 'vitest'
import {
  formatNumberWithCommas,
  getAggregatedDatabase,
  parseStorageToBytes,
} from '../../data/aggregateDatabase'

describe('aggregate database', () => {
  it('reports the audited totals unchanged', () => {
    const aggregate = getAggregatedDatabase()
    expect(aggregate.archiveCount).toBe(2)
    expect(aggregate.numericFiles).toBe(1_948_083)
    expect(aggregate.totalFiles).toBe('1,948,083')
    expect(aggregate.combinedStorage).toBe('1654.24 TB')
    expect(aggregate.numericStorageTB).toBeCloseTo(1654.24, 2)
    expect(aggregate.extensionIntelligence.uniqueExtensionsCount).toBe(490)
  })

  it('keeps every cross-archive integrity check verified', () => {
    const aggregate = getAggregatedDatabase()
    expect(aggregate.dataIntegrity.length).toBeGreaterThan(0)
    expect(aggregate.dataIntegrity.every((item) => item.verified)).toBe(true)
    expect(aggregate.allScansVerified).toBe(true)
  })

  it('builds the resolution matrix and category split from the datasets', () => {
    const aggregate = getAggregatedDatabase()
    expect(aggregate.resolutionMatrix.length).toBeGreaterThan(0)
    expect(aggregate.categoryBreakdown.length).toBeGreaterThan(0)
    const matrixFiles = aggregate.resolutionMatrix.reduce((sum, row) => sum + row.numericFiles, 0)
    expect(matrixFiles).toBeGreaterThan(0)
    expect(matrixFiles).toBeLessThanOrEqual(aggregate.numericFiles)
  })

  it('orders channel contributions by storage', () => {
    const aggregate = getAggregatedDatabase()
    expect(aggregate.channelContributions.length).toBe(2)
    const [first, second] = aggregate.channelContributions
    expect(first.numericStorageTB).toBeGreaterThan(second.numericStorageTB)
  })

  it('parses and formats storage without inventing precision', () => {
    expect(parseStorageToBytes('945.67 TB')).toBeGreaterThan(parseStorageToBytes('708.57 TB'))
    expect(parseStorageToBytes('')).toBe(0)
    expect(formatNumberWithCommas(1_948_083)).toBe('1,948,083')
  })
})
