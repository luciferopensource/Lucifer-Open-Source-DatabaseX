import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'
export type AccentId = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'graphite'
export type FontId = 'grotesk' | 'editorial' | 'technical'

export interface AccentOption {
  id: AccentId
  label: string
  /** Swatch colour per mode, matching the CSS tokens exactly. */
  swatch: Record<Theme, string>
}

export const ACCENTS: AccentOption[] = [
  { id: 'blue', label: 'Original blue', swatch: { dark: '#6a9dff', light: '#1d4ed8' } },
  { id: 'emerald', label: 'Emerald', swatch: { dark: '#3ddc97', light: '#0b7a53' } },
  { id: 'violet', label: 'Violet', swatch: { dark: '#a78bfa', light: '#6d28d9' } },
  { id: 'amber', label: 'Amber', swatch: { dark: '#f5b544', light: '#a35a06' } },
  { id: 'rose', label: 'Rose', swatch: { dark: '#fb7185', light: '#b3123e' } },
  { id: 'graphite', label: 'Graphite', swatch: { dark: '#c7d2de', light: '#111827' } },
]

export const FONTS: { id: FontId; label: string; sample: string }[] = [
  { id: 'grotesk', label: 'Grotesk', sample: 'Aa' },
  { id: 'editorial', label: 'Editorial', sample: 'Aa' },
  { id: 'technical', label: 'Technical', sample: 'Aa' },
]

const THEME_KEY = 'lx-theme'
const ACCENT_KEY = 'lx-accent'
const FONT_KEY = 'lx-font'
const GLASS_KEY = 'lx-glass'
const GLASS_PCT_KEY = 'lx-glass-pct'

export const GLASS_STEP = 5
export const GLASS_MIN = 5
export const GLASS_MAX = 100
export const GLASS_DEFAULT = 40

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function readTheme(): Theme {
  const fromDom = document.documentElement.dataset.theme
  if (fromDom === 'light' || fromDom === 'dark') return fromDom
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* storage can be blocked */
  }
  return systemTheme()
}

function readAccent(): AccentId {
  const fromDom = document.documentElement.dataset.accent
  if (ACCENTS.some((accent) => accent.id === fromDom)) return fromDom as AccentId
  try {
    const saved = localStorage.getItem(ACCENT_KEY)
    if (ACCENTS.some((accent) => accent.id === saved)) return saved as AccentId
  } catch {
    /* storage can be blocked */
  }
  return 'blue'
}

function readFont(): FontId {
  const fromDom = document.documentElement.dataset.font
  if (FONTS.some((font) => font.id === fromDom)) return fromDom as FontId
  try {
    const saved = localStorage.getItem(FONT_KEY)
    if (FONTS.some((font) => font.id === saved)) return saved as FontId
  } catch {
    /* storage can be blocked */
  }
  return 'grotesk'
}

function readGlass(): boolean {
  const fromDom = document.documentElement.dataset.glass
  if (fromDom === 'on') return true
  if (fromDom === 'off') return false
  try {
    return localStorage.getItem(GLASS_KEY) === 'on'
  } catch {
    /* storage can be blocked */
  }
  return false
}

function readGlassStrength(): number {
  const inline = document.documentElement.style.getPropertyValue('--glass-pct')
  const fromInline = Number(inline)
  if (Number.isFinite(fromInline) && fromInline >= GLASS_MIN && fromInline <= GLASS_MAX) return fromInline
  try {
    const saved = Number(localStorage.getItem(GLASS_PCT_KEY))
    if (Number.isFinite(saved) && saved >= GLASS_MIN && saved <= GLASS_MAX) return saved
  } catch {
    /* storage can be blocked */
  }
  return GLASS_DEFAULT
}

export interface Appearance {
  theme: Theme
  accent: AccentId
  font: FontId
  glass: boolean
  glassStrength: number
  setTheme: (theme: Theme) => void
  setAccent: (accent: AccentId) => void
  setFont: (font: FontId) => void
  setGlass: (glass: boolean) => void
  setGlassStrength: (strength: number) => void
  reset: () => void
}

/**
 * Presentation preferences only — mode, accent palette and display font.
 * All three live on <html> as data attributes and are mirrored to
 * localStorage, so the boot script in index.html restores them before the
 * first paint.
 */
export function useAppearance(): Appearance {
  const [theme, setTheme] = useState<Theme>(readTheme)
  const [accent, setAccent] = useState<AccentId>(readAccent)
  const [font, setFont] = useState<FontId>(readFont)
  const [glass, setGlass] = useState<boolean>(readGlass)
  const [glassStrength, setGlassStrength] = useState<number>(readGlassStrength)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.dataset.accent = accent
    root.dataset.font = font
    root.dataset.glass = glass ? 'on' : 'off'
    root.style.setProperty('--glass-pct', String(glassStrength))
    try {
      localStorage.setItem(THEME_KEY, theme)
      localStorage.setItem(ACCENT_KEY, accent)
      localStorage.setItem(FONT_KEY, font)
      localStorage.setItem(GLASS_KEY, glass ? 'on' : 'off')
      localStorage.setItem(GLASS_PCT_KEY, String(glassStrength))
    } catch {
      /* storage can be blocked; the live attributes still apply */
    }
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0b0d' : '#f6f7f8')
  }, [theme, accent, font, glass, glassStrength])

  const reset = useCallback(() => {
    setTheme(systemTheme())
    setAccent('blue')
    setFont('grotesk')
    setGlass(false)
    setGlassStrength(GLASS_DEFAULT)
  }, [])

  return {
    theme,
    accent,
    font,
    glass,
    glassStrength,
    setTheme,
    setAccent,
    setFont,
    setGlass,
    setGlassStrength,
    reset,
  }
}
