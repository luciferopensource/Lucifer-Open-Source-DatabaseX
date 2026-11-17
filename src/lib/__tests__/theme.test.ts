import { describe, expect, it } from 'vitest'
import { customAccentTokens, isHex } from '../theme'

describe('custom accent', () => {
  it('validates hex input', () => {
    expect(isHex('#6a9dff')).toBe(true)
    expect(isHex('6a9dff')).toBe(false)
    expect(isHex('#fff')).toBe(false)
  })

  it('derives a readable accent per mode', () => {
    const dark = customAccentTokens('#ff5a1f', 'dark')
    const light = customAccentTokens('#ff5a1f', 'light')
    for (const tokens of [dark, light]) {
      expect(tokens.accent).toMatch(/^#[0-9a-f]{6}$/)
      expect(tokens.strong).toMatch(/^#[0-9a-f]{6}$/)
      expect(tokens.soft).toMatch(/^rgba\(/)
      expect(['#07101f', '#ffffff']).toContain(tokens.on)
    }
    expect(dark.accent).not.toBe(light.accent)
  })

  it('falls back to the default blue for invalid input', () => {
    expect(customAccentTokens('nope', 'dark').accent).toMatch(/^#[0-9a-f]{6}$/)
  })
})
