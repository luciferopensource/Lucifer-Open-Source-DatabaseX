import { describe, expect, it } from 'vitest'
import { auditTimeline, resolutionByChannel, snapshotDates, vaultHealth } from '../insight'

describe('insight derivations', () => {
  it('scores each registered vault from its own record', () => {
    const reports = vaultHealth()
    expect(reports).toHaveLength(2)
    for (const report of reports) {
      expect(report.parts).toHaveLength(3)
      expect(report.parts.reduce((sum, part) => sum + part.points, 0)).toBeCloseTo(report.score, 1)
      expect(report.score).toBeGreaterThan(0)
      expect(report.score).toBeLessThanOrEqual(100)
    }
  })

  it('crosses every resolution tier with its contributing channels', () => {
    const rows = resolutionByChannel()
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(row.cells).toHaveLength(2)
      expect(row.cells.every((cell) => cell.share >= 0 && cell.share <= 1)).toBe(true)
    }
  })

  it('records one timeline entry per archive plus the aggregate reconciliation', () => {
    expect(auditTimeline()).toHaveLength(5)
  })

  it('states the single snapshot date honestly', () => {
    expect(snapshotDates()).toHaveLength(1)
  })
})
