import { describe, expect, it } from 'vitest'
import { getAllArchives } from '../../data/archiveRegistry'
import { getAggregatedDatabase } from '../../data/aggregateDatabase'

describe('automatic merge', () => {
  it('recalculates totals when another archive is registered', () => {
    const base = getAggregatedDatabase()
    const first = getAllArchives()[0]
    const extra = { ...first, id: 'archive-003', sequence: 3, displayName: 'Third vault (merge proof)' }
    const merged = getAggregatedDatabase([...getAllArchives(), extra])

    console.log('BASE  ', {
      archives: base.archiveCount,
      files: base.numericFiles,
      storage: base.combinedStorage,
      extensions: base.extensionIntelligence.uniqueExtensionsCount,
    })
    console.log('MERGED', {
      archives: merged.archiveCount,
      files: merged.numericFiles,
      storage: merged.combinedStorage,
      extensions: merged.extensionIntelligence.uniqueExtensionsCount,
    })

    expect(merged.archiveCount).toBe(base.archiveCount + 1)
    expect(merged.numericFiles).toBe(base.numericFiles + first.numericFiles)
    expect(merged.numericStorageTB).toBeCloseTo(base.numericStorageTB + first.numericStorageTB, 2)
    // Same extensions registered twice must not double the union.
    expect(merged.extensionIntelligence.uniqueExtensionsCount).toBe(base.extensionIntelligence.uniqueExtensionsCount)
  })
})
