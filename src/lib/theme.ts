import { useCallback, useEffect, useState } from 'react'
import { clearWallpaperImage, loadWallpaperImage, saveWallpaperImage } from './wallpaperStore'

export type Theme = 'dark' | 'light'
export type AccentId = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'graphite' | 'custom'
export type FontId =
  | 'grotesk'
  | 'editorial'
  | 'technical'
  | 'sora'
  | 'manrope'
  | 'playfair'
  | 'fraunces'
  | 'syne'
  | 'instrument'
export type Density = 'comfortable' | 'compact'
export type TextSize = 'sm' | 'md' | 'lg'
export type Wallpaper = 'mesh' | 'glow' | 'grid' | 'none' | 'custom'
export type SidebarState = 'shown' | 'compact' | 'hidden'
export type RadiusScale = 'sharp' | 'default' | 'soft'

export interface AccentOption {
  id: Exclude<AccentId, 'custom'>
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
  { id: 'sora', label: 'Sora', sample: 'Aa' },
  { id: 'manrope', label: 'Manrope', sample: 'Aa' },
  { id: 'playfair', label: 'Playfair', sample: 'Aa' },
  { id: 'fraunces', label: 'Fraunces', sample: 'Aa' },
  { id: 'syne', label: 'Syne', sample: 'Aa' },
  { id: 'instrument', label: 'Instrument', sample: 'Aa' },
]

const THEME_KEY = 'lx-theme'
const ACCENT_KEY = 'lx-accent'
const ACCENT_HEX_KEY = 'lx-accent-hex'
const FONT_KEY = 'lx-font'
const DENSITY_KEY = 'lx-density'
const SIZE_KEY = 'lx-size'
const WALLPAPER_KEY = 'lx-wallpaper'
const SIDEBAR_KEY = 'lx-sidebar'
const RADIUS_KEY = 'lx-radius'
const GLASS_KEY = 'lx-glass'
const GLASS_PCT_KEY = 'lx-glass-pct'

export const DENSITIES: { id: Density; label: string }[] = [
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'compact', label: 'Compact' },
]

export const TEXT_SIZES: { id: TextSize; label: string }[] = [
  { id: 'sm', label: 'Small' },
  { id: 'md', label: 'Default' },
  { id: 'lg', label: 'Large' },
]

export const WALLPAPERS: { id: Exclude<Wallpaper, 'custom'>; label: string }[] = [
  { id: 'mesh', label: 'Mesh' },
  { id: 'glow', label: 'Glow' },
  { id: 'grid', label: 'Grid' },
  { id: 'none', label: 'Plain' },
]

export const RADIUS_SCALES: { id: RadiusScale; label: string }[] = [
  { id: 'sharp', label: 'Sharp' },
  { id: 'default', label: 'Default' },
  { id: 'soft', label: 'Soft' },
]

export const GLASS_STEP = 5
export const GLASS_MIN = 5
export const GLASS_MAX = 100
export const GLASS_DEFAULT = 40
export const DEFAULT_ACCENT_HEX = '#6a9dff'
export const WALLPAPER_MAX_BYTES = 2 * 1024 * 1024

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

export function isHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}

function readAccent(): AccentId {
  const fromDom = document.documentElement.dataset.accent
  if (fromDom === 'custom') return 'custom'
  if (ACCENTS.some((accent) => accent.id === fromDom)) return fromDom as AccentId
  try {
    const saved = localStorage.getItem(ACCENT_KEY)
    if (saved === 'custom') return 'custom'
    if (ACCENTS.some((accent) => accent.id === saved)) return saved as AccentId
  } catch {
    /* storage can be blocked */
  }
  return 'blue'
}

function readAccentHex(): string {
  try {
    const saved = localStorage.getItem(ACCENT_HEX_KEY)
    if (saved && isHex(saved)) return saved.toLowerCase()
  } catch {
    /* storage can be blocked */
  }
  return DEFAULT_ACCENT_HEX
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

function readSidebar(): SidebarState {
  const fromDom = document.documentElement.dataset.sidebar
  if (fromDom === 'hidden' || fromDom === 'shown' || fromDom === 'compact') return fromDom
  try {
    const saved = localStorage.getItem(SIDEBAR_KEY)
    if (saved === 'hidden' || saved === 'shown' || saved === 'compact') return saved
  } catch {
    /* storage can be blocked */
  }
  return 'shown'
}

function readRadius(): RadiusScale {
  const fromDom = document.documentElement.dataset.radius
  if (fromDom === 'sharp' || fromDom === 'default' || fromDom === 'soft') return fromDom
  try {
    const saved = localStorage.getItem(RADIUS_KEY)
    if (saved === 'sharp' || saved === 'default' || saved === 'soft') return saved
  } catch {
    /* storage can be blocked */
  }
  return 'default'
}

function readWallpaper(): Wallpaper {
  const fromDom = document.documentElement.dataset.wallpaper
  const allowed: Wallpaper[] = ['mesh', 'glow', 'grid', 'none', 'custom']
  if (allowed.includes(fromDom as Wallpaper)) return fromDom as Wallpaper
  try {
    const saved = localStorage.getItem(WALLPAPER_KEY)
    if (allowed.includes(saved as Wallpaper)) return saved as Wallpaper
  } catch {
    /* storage can be blocked */
  }
  return 'mesh'
}

function readDensity(): Density {
  const fromDom = document.documentElement.dataset.density
  if (fromDom === 'compact' || fromDom === 'comfortable') return fromDom
  try {
    const saved = localStorage.getItem(DENSITY_KEY)
    if (saved === 'compact' || saved === 'comfortable') return saved
  } catch {
    /* storage can be blocked */
  }
  return 'comfortable'
}

function readSize(): TextSize {
  const fromDom = document.documentElement.dataset.size
  if (fromDom === 'sm' || fromDom === 'md' || fromDom === 'lg') return fromDom
  try {
    const saved = localStorage.getItem(SIZE_KEY)
    if (saved === 'sm' || saved === 'md' || saved === 'lg') return saved
  } catch {
    /* storage can be blocked */
  }
  return 'md'
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

// ── Custom accent maths ──────────────────────────────────────────────────────

const clampChannel = (value: number) => Math.min(255, Math.max(0, Math.round(value)))

function toRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)]
}

function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map((part) => clampChannel(part).toString(16).padStart(2, '0')).join('')}`
}

function mix(hex: string, target: [number, number, number], ratio: number): string {
  const [r, g, b] = toRgb(hex)
  return toHex([r + (target[0] - r) * ratio, g + (target[1] - g) * ratio, b + (target[2] - b) * ratio])
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = toRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((part) => {
    const value = part / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export interface AccentTokens {
  accent: string
  strong: string
  soft: string
  on: string
}

/**
 * Derives a usable accent set from any hex. Dark mode lifts the colour towards
 * white so it reads on a near-black surface; light mode deepens it so body-size
 * text keeps its contrast. Soft is a low-alpha wash for selected rows.
 */
export function customAccentTokens(hex: string, theme: Theme): AccentTokens {
  const safe = isHex(hex) ? hex : DEFAULT_ACCENT_HEX
  const accent = theme === 'dark' ? mix(safe, [255, 255, 255], 0.16) : mix(safe, [0, 0, 0], 0.14)
  const strong = theme === 'dark' ? mix(safe, [255, 255, 255], 0.34) : mix(safe, [0, 0, 0], 0.3)
  return {
    accent,
    strong,
    soft: rgba(accent, theme === 'dark' ? 0.16 : 0.1),
    on: relativeLuminance(accent) > 0.55 ? '#07101f' : '#ffffff',
  }
}

export interface Appearance {
  theme: Theme
  accent: AccentId
  accentHex: string
  font: FontId
  glass: boolean
  glassStrength: number
  density: Density
  size: TextSize
  wallpaper: Wallpaper
  sidebar: SidebarState
  radius: RadiusScale
  wallpaperImage: string | null
  setTheme: (theme: Theme) => void
  setAccent: (accent: AccentId) => void
  setAccentHex: (hex: string) => void
  setFont: (font: FontId) => void
  setGlass: (glass: boolean) => void
  setGlassStrength: (strength: number) => void
  setDensity: (density: Density) => void
  setSize: (size: TextSize) => void
  setWallpaper: (wallpaper: Wallpaper) => void
  setSidebar: (sidebar: SidebarState) => void
  setRadius: (radius: RadiusScale) => void
  uploadWallpaper: (file: File) => Promise<{ ok: boolean; error?: string }>
  removeWallpaper: () => Promise<void>
  reset: () => void
}

/**
 * Presentation preferences only — mode, accent palette and display font.
 * All of them live on <html> as data attributes and are mirrored to
 * localStorage, so the boot script in index.html restores them before the
 * first paint. Uploaded wallpapers are kept in IndexedDB, not localStorage.
 */
export function useAppearance(): Appearance {
  const [theme, setTheme] = useState<Theme>(readTheme)
  const [accent, setAccent] = useState<AccentId>(readAccent)
  const [accentHex, setAccentHexState] = useState<string>(readAccentHex)
  const [font, setFont] = useState<FontId>(readFont)
  const [glass, setGlass] = useState<boolean>(readGlass)
  const [glassStrength, setGlassStrength] = useState<number>(readGlassStrength)
  const [density, setDensity] = useState<Density>(readDensity)
  const [size, setSize] = useState<TextSize>(readSize)
  const [wallpaper, setWallpaper] = useState<Wallpaper>(readWallpaper)
  const [sidebar, setSidebar] = useState<SidebarState>(readSidebar)
  const [radius, setRadius] = useState<RadiusScale>(readRadius)
  const [wallpaperImage, setWallpaperImage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadWallpaperImage()
      .then((image) => {
        if (!cancelled && image) setWallpaperImage(image)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.dataset.accent = accent
    root.dataset.font = font
    root.dataset.glass = glass ? 'on' : 'off'
    root.dataset.density = density
    root.dataset.size = size
    root.dataset.wallpaper = wallpaper
    root.dataset.sidebar = sidebar
    root.dataset.radius = radius
    root.style.setProperty('--glass-pct', String(glassStrength))

    if (accent === 'custom') {
      const tokens = customAccentTokens(accentHex, theme)
      root.style.setProperty('--accent', tokens.accent)
      root.style.setProperty('--accent-strong', tokens.strong)
      root.style.setProperty('--accent-soft', tokens.soft)
      root.style.setProperty('--on-accent', tokens.on)
    } else {
      root.style.removeProperty('--accent')
      root.style.removeProperty('--accent-strong')
      root.style.removeProperty('--accent-soft')
      root.style.removeProperty('--on-accent')
    }

    if (wallpaperImage) root.style.setProperty('--wallpaper-image', `url("${wallpaperImage}")`)
    else root.style.removeProperty('--wallpaper-image')

    try {
      localStorage.setItem(THEME_KEY, theme)
      localStorage.setItem(ACCENT_KEY, accent)
      localStorage.setItem(ACCENT_HEX_KEY, accentHex)
      localStorage.setItem(FONT_KEY, font)
      localStorage.setItem(GLASS_KEY, glass ? 'on' : 'off')
      localStorage.setItem(GLASS_PCT_KEY, String(glassStrength))
      localStorage.setItem(DENSITY_KEY, density)
      localStorage.setItem(SIZE_KEY, size)
      localStorage.setItem(WALLPAPER_KEY, wallpaper)
      localStorage.setItem(SIDEBAR_KEY, sidebar)
      localStorage.setItem(RADIUS_KEY, radius)
    } catch {
      /* storage can be blocked; the live attributes still apply */
    }
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0b0d' : '#f6f7f8')
  }, [theme, accent, accentHex, font, glass, glassStrength, density, size, wallpaper, sidebar, radius, wallpaperImage])

  const setAccentHex = useCallback((hex: string) => {
    const safe = hex.startsWith('#') ? hex : `#${hex}`
    if (!isHex(safe)) return
    setAccentHexState(safe.toLowerCase())
    setAccent('custom')
  }, [])

  const uploadWallpaper = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return { ok: false, error: 'That file is not an image.' }
    if (file.size > WALLPAPER_MAX_BYTES) return { ok: false, error: 'Images must be 2 MB or smaller.' }
    try {
      const image = await saveWallpaperImage(file)
      setWallpaperImage(image)
      setWallpaper('custom')
      return { ok: true }
    } catch {
      return { ok: false, error: 'The browser refused to store this image.' }
    }
  }, [])

  const removeWallpaper = useCallback(async () => {
    await clearWallpaperImage().catch(() => undefined)
    setWallpaperImage(null)
    setWallpaper('mesh')
  }, [])

  const reset = useCallback(() => {
    setTheme(systemTheme())
    setAccent('blue')
    setAccentHexState(DEFAULT_ACCENT_HEX)
    setFont('grotesk')
    setGlass(false)
    setGlassStrength(GLASS_DEFAULT)
    setDensity('comfortable')
    setSize('md')
    setWallpaper('mesh')
    setSidebar('shown')
    setRadius('default')
    setWallpaperImage(null)
    void clearWallpaperImage().catch(() => undefined)
  }, [])

  return {
    theme,
    accent,
    accentHex,
    font,
    glass,
    glassStrength,
    density,
    size,
    wallpaper,
    sidebar,
    radius,
    wallpaperImage,
    setTheme,
    setAccent,
    setAccentHex,
    setFont,
    setGlass,
    setGlassStrength,
    setDensity,
    setSize,
    setWallpaper,
    setSidebar,
    setRadius,
    uploadWallpaper,
    removeWallpaper,
    reset,
  }
}
