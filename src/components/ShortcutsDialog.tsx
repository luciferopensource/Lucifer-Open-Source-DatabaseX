import { useRef } from 'react'
import { useFocusTrap } from '../lib/useFocusTrap'
import { IconClose } from './Icons'

const SHORTCUTS: { keys: string[]; action: string }[] = [
  { keys: ['⌘', 'K'], action: 'Open the command palette' },
  { keys: ['Ctrl', 'K'], action: 'Same on Windows and Linux' },
  { keys: ['↑', '↓'], action: 'Move through palette results' },
  { keys: ['Enter'], action: 'Open the highlighted result' },
  { keys: ['Esc'], action: 'Close a palette, drawer or dialog' },
  { keys: ['?'], action: 'Open this shortcut sheet' },
  { keys: ['Tab'], action: 'Cycle focus inside a dialog' },
]

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef, open)

  if (!open) return null

  return (
    <>
      <div className="palette-scrim" onClick={onClose} />
      <div className="shortcuts-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title" ref={panelRef}>
        <header className="glossary-dialog__head">
          <div>
            <p className="eyebrow">Reference</p>
            <h2 id="shortcuts-title">Keyboard shortcuts</h2>
          </div>
          <button type="button" className="settings__close" onClick={onClose} aria-label="Close shortcuts">
            <IconClose width={16} height={16} />
          </button>
        </header>

        <dl className="shortcut-list">
          {SHORTCUTS.map((shortcut) => (
            <div className="shortcut-row" key={shortcut.action}>
              <dt>
                {shortcut.keys.map((key) => (
                  <kbd key={key}>{key}</kbd>
                ))}
              </dt>
              <dd>{shortcut.action}</dd>
            </div>
          ))}
        </dl>

        <footer className="palette__foot">
          <span>No mouse required</span>
          <span>Esc closes</span>
        </footer>
      </div>
    </>
  )
}
