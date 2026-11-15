import { useEffect } from 'react'
import type { Appearance } from '../lib/theme'
import { ACCENTS, FONTS } from '../lib/theme'
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
  const { theme, accent, font, setTheme, setAccent, setFont, reset } = appearance

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
      <aside className="settings" role="dialog" aria-modal="true" aria-labelledby="settings-title">
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
