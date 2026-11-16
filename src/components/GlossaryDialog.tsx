import { useMemo, useRef, useState } from 'react'
import { GLOSSARY } from '../lib/glossary'
import { useFocusTrap } from '../lib/useFocusTrap'
import { IconClose, IconSearch } from './Icons'

/** Site-wide quick reference. Same data as the Sources page glossary. */
export function GlossaryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef, open)

  const entries = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return GLOSSARY
    return GLOSSARY.filter(
      (entry) =>
        entry.term.toLowerCase().includes(needle) ||
        entry.definition.toLowerCase().includes(needle) ||
        entry.group.toLowerCase().includes(needle),
    )
  }, [query])

  if (!open) return null

  return (
    <>
      <div className="palette-scrim" onClick={onClose} />
      <div className="glossary-dialog" role="dialog" aria-modal="true" aria-labelledby="glossary-title" ref={panelRef}>
        <header className="glossary-dialog__head">
          <div>
            <p className="eyebrow">Reference</p>
            <h2 id="glossary-title">Glossary</h2>
          </div>
          <button type="button" className="settings__close" onClick={onClose} aria-label="Close glossary">
            <IconClose width={16} height={16} />
          </button>
        </header>

        <label className="field" style={{ margin: '0 20px 14px' }}>
          <IconSearch />
          <input
            type="search"
            value={query}
            placeholder="Search a term…"
            aria-label="Search glossary"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="glossary-dialog__list">
          {entries.map((entry) => (
            <article className="glossary-dialog__item" key={entry.term}>
              <span className="glossary-item__group">{entry.group}</span>
              <h3>{entry.term}</h3>
              <p>{entry.definition}</p>
            </article>
          ))}
          {entries.length === 0 ? <p className="note">No term matches “{query}”.</p> : null}
        </div>

        <footer className="palette__foot">
          <span>{GLOSSARY.length} terms</span>
          <span>Esc closes</span>
        </footer>
      </div>
    </>
  )
}
