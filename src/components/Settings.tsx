import { useEffect, useRef, useState } from 'react'
import type { Appearance } from '../lib/theme'
import {
  ACCENTS,
  DENSITIES,
  FONTS,
  GLASS_MAX,
  GLASS_MIN,
  GLASS_STEP,
  RADIUS_SCALES,
  TEXT_SIZES,
  WALLPAPERS,
  isHex,
} from '../lib/theme'
import { useFocusTrap } from '../lib/useFocusTrap'
import { IconCheck, IconClose, IconMoon, IconSun } from './Icons'

/**
 * Appearance drawer: mode, accent palette and display typeface.
 * Everything is instant by design — no slide, no fade.
 */
export function Settings({
  open,
  onClose,
  appearance,
}: {
  open: boolean
  onClose: () => void
  appearance: Appearance
}) {
  const {
    theme,
    accent,
    font,
    glass,
    glassStrength,
    density,
    size,
    wallpaper,
    sidebar,
    accentHex,
    radius,
    wallpaperImage,
    setTheme,
    setAccent,
    setFont,
    setGlass,
    setGlassStrength,
    setDensity,
    setSize,
    setWallpaper,
    setSidebar,
    setRadius,
    setAccentHex,
    uploadWallpaper,
    removeWallpaper,
    reset,
  } = appearance
  const [wallpaperError, setWallpaperError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  useFocusTrap(panelRef, open)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div className="settings-scrim" onClick={onClose} />
      <aside className="settings" role="dialog" aria-modal="true" aria-labelledby="settings-title" ref={panelRef}>
        <header className="settings__head">
          <div>
            <p className="eyebrow">Appearance</p>
            <h2 id="settings-title">Theme settings</h2>
          </div>
          <button type="button" className="settings__close" onClick={onClose} aria-label="Close settings">
            <IconClose width={16} height={16} />
          </button>
        </header>

        <div className="settings__body">
          <section className="settings__group">
            <h3>Mode</h3>
            <div className="mode-grid">
              <button type="button" aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
                <IconSun width={15} height={15} />
                Light
              </button>
              <button type="button" aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
                <IconMoon width={15} height={15} />
                Dark
              </button>
            </div>
          </section>

          <section className="settings__group">
            <h3>Colour</h3>
            <p className="settings__hint">The original blue is the default. Each palette is tuned for both modes.</p>
            <div className="accent-grid">
              {ACCENTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={accent === option.id}
                  onClick={() => setAccent(option.id)}
                >
                  <span className="accent-swatch" style={{ background: option.swatch[theme] }} />
                  <span className="accent-name">{option.label}</span>
                  {accent === option.id ? <IconCheck className="accent-check" width={13} height={13} /> : null}
                </button>
              ))}
            </div>
            <div className="accent-custom">
              <label className="accent-custom__picker">
                <input
                  type="color"
                  value={accentHex}
                  aria-label="Custom accent colour"
                  onChange={(event) => setAccentHex(event.target.value)}
                />
                <span>Custom</span>
              </label>
              <input
                className="accent-custom__hex mono"
                type="text"
                value={accentHex.toUpperCase()}
                aria-label="Custom accent hex value"
                spellCheck={false}
                onChange={(event) => {
                  if (isHex(event.target.value)) setAccentHex(event.target.value)
                }}
              />
              <button
                type="button"
                className="btn btn--quiet"
                aria-pressed={accent === 'custom'}
                onClick={() => setAccentHex(accentHex)}
              >
                Apply
              </button>
            </div>
          </section>

          <section className="settings__group">
            <h3>Glass</h3>
            <div className="glass-row">
              <div className="glass-row__text">
                <span className="glass-row__label">Liquid glass</span>
                <span className="glass-row__hint">Backdrop blur on every card, panel and bar.</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={glass}
                aria-label="Toggle liquid glass"
                className="switch"
                onClick={() => setGlass(!glass)}
              >
                <span className="switch__thumb" />
              </button>
            </div>

            <div className="glass-presets" role="group" aria-label="Glass presets">
              {[
                { pct: 20, label: 'Soft' },
                { pct: 45, label: 'Medium' },
                { pct: 75, label: 'Strong' },
              ].map((preset) => (
                <button
                  key={preset.pct}
                  type="button"
                  aria-pressed={glass && glassStrength === preset.pct}
                  onClick={() => {
                    setGlass(true)
                    setGlassStrength(preset.pct)
                  }}
                >
                  {preset.label}
                  <span>{preset.pct}%</span>
                </button>
              ))}
            </div>

            {glass ? (
              <div className="glass-strength">
                <div className="glass-strength__head">
                  <span>Blur strength</span>
                  <output className="glass-strength__value">{glassStrength}%</output>
                </div>
                <input
                  type="range"
                  min={GLASS_MIN}
                  max={GLASS_MAX}
                  step={GLASS_STEP}
                  value={glassStrength}
                  aria-label="Glass blur strength"
                  onChange={(event) => setGlassStrength(Number(event.target.value))}
                />
                <div className="glass-strength__scale">
                  <span>{GLASS_MIN}%</span>
                  <span>{GLASS_MAX}%</span>
                </div>
                <p className="settings__hint">
                  Blur applies to boxes and controls, not to body text. Raise it until the background reads as frosted
                  rather than flat.
                </p>
              </div>
            ) : (
              <p className="settings__hint">Off — surfaces stay solid. Turn it on to frost the backdrop.</p>
            )}
          </section>

          <section className="settings__group">
            <h3>Background</h3>
            <div className="wallpaper-grid">
              {WALLPAPERS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={wallpaper === option.id}
                  onClick={() => setWallpaper(option.id)}
                  data-wallpaper-preview={option.id}
                >
                  <span className="wallpaper-swatch" aria-hidden="true" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
            <div className="wallpaper-upload">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  const result = await uploadWallpaper(file)
                  setWallpaperError(result.ok ? '' : result.error ?? 'Upload failed.')
                  event.target.value = ''
                }}
              />
              <button type="button" className="btn btn--quiet" onClick={() => fileRef.current?.click()}>
                Upload image
              </button>
              {wallpaperImage ? (
                <button type="button" className="btn btn--quiet" onClick={() => void removeWallpaper()}>
                  Remove upload
                </button>
              ) : null}
              <span className="settings__hint">PNG, JPEG or WebP · max 2 MB · stored on this device.</span>
            </div>
            {wallpaperError ? <p className="settings__error">{wallpaperError}</p> : null}
            <p className="settings__hint">
              The layer behind the glass. Mesh is the default; plain removes it entirely. An uploaded image becomes the
              custom background until you remove it.
            </p>
          </section>

          <section className="settings__group">
            <h3>Layout</h3>
            <div className="seg-row">
              <span className="seg-row__label">Density</span>
              <div className="mode-grid mode-grid--three">
                {DENSITIES.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={density === option.id}
                    onClick={() => setDensity(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="seg-row">
              <span className="seg-row__label">Text size</span>
              <div className="mode-grid mode-grid--three">
                {TEXT_SIZES.map((option) => (
                  <button key={option.id} type="button" aria-pressed={size === option.id} onClick={() => setSize(option.id)}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="seg-row">
              <span className="seg-row__label">Sidebar</span>
              <div className="mode-grid mode-grid--three">
                <button type="button" aria-pressed={sidebar === 'shown'} onClick={() => setSidebar('shown')}>
                  Shown
                </button>
                <button type="button" aria-pressed={sidebar === 'compact'} onClick={() => setSidebar('compact')}>
                  Compact
                </button>
                <button type="button" aria-pressed={sidebar === 'hidden'} onClick={() => setSidebar('hidden')}>
                  Hidden
                </button>
              </div>
            </div>
            <div className="seg-row">
              <span className="seg-row__label">Corners</span>
              <div className="mode-grid mode-grid--three">
                {RADIUS_SCALES.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={radius === option.id}
                    onClick={() => setRadius(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="settings__hint">
              Text size scales the whole interface; density only tightens spacing. Compact keeps the icons and drops the
              labels; the sidebar toggle also lives in the top bar.
            </p>
          </section>

          <section className="settings__group">
            <h3>Typeface</h3>
            <p className="settings__hint">
              Display face only — body copy and numbers keep their own fonts so tables never reflow.
            </p>
            <div className="font-grid">
              {FONTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={font === option.id}
                  onClick={() => setFont(option.id)}
                  data-font-preview={option.id}
                >
                  <span className="font-sample">{option.sample}</span>
                  <span className="font-name">{option.label}</span>
                  {font === option.id ? <IconCheck className="font-check" width={13} height={13} /> : null}
                </button>
              ))}
            </div>
          </section>

          <button type="button" className="btn btn--ghost settings__reset" onClick={reset}>
            Reset to original
          </button>
        </div>

        <footer className="settings__foot">Stored on this device only. No analytics, no tracking.</footer>
      </aside>
    </>
  )
}
