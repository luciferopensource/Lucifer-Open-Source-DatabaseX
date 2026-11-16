import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { getAggregatedDatabase } from '../data/aggregateDatabase'
import { REGISTERED_ARCHIVES } from '../data/archiveRegistry'
import { routeHref } from '../lib/router'
import { IconSearch } from './Icons'

interface Command {
  id: string
  label: string
  hint: string
  group: string
  href: string
}

const PAGES: Command[] = [
  { id: 'page-home', label: 'Overview', hint: 'Living archive home', group: 'Pages', href: routeHref('home') },
  { id: 'page-total', label: 'Total Database', hint: 'Aggregate report', group: 'Pages', href: routeHref('total-database') },
  { id: 'page-compare', label: 'Compare channels', hint: 'Backup 01 vs Backup 02', group: 'Pages', href: routeHref('compare') },
  { id: 'page-b1', label: 'Backup 01', hint: 'Lucifer Stream Site Backup 1', group: 'Pages', href: routeHref('stream-backup-1') },
  { id: 'page-b2', label: 'Backup 02', hint: 'Lucifer Stream Site Backup 2', group: 'Pages', href: routeHref('stream-backup-2') },
  { id: 'page-sources', label: 'Sources & method', hint: 'Provenance, converter, glossary', group: 'Pages', href: routeHref('sources') },
]

const REPORT_TABS: { tab: string; label: string }[] = [
  { tab: 'channel', label: 'Channel analysis' },
  { tab: 'resolution', label: 'Resolution intelligence' },
  { tab: 'storage', label: 'Storage highlights' },
  { tab: 'extensions', label: 'Extension ledger' },
]

const MAX_RESULTS = 12

function buildIndex(): Command[] {
  const aggregate = getAggregatedDatabase()
  const reports: Command[] = []
  for (const archive of REGISTERED_ARCHIVES) {
    for (const tab of REPORT_TABS) {
      reports.push({
        id: `${archive.route}-${tab.tab}`,
        label: `${archive.displayName} — ${tab.label}`,
        hint: `Report tab · ${archive.scanId}`,
        group: 'Reports',
        href: routeHref(archive.route as Parameters<typeof routeHref>[0], tab.tab),
      })
    }
  }
  const extensions: Command[] = aggregate.extensionIntelligence.records.slice(0, 200).map((record) => ({
    id: `ext-${record.extension}`,
    label: record.extension,
    hint: `${record.category} · ${record.files} files · ${record.storage}`,
    group: 'Extensions',
    href: routeHref('total-database', 'extensions', { q: record.extension }),
  }))
  return [...PAGES, ...reports, ...extensions]
}

const INDEX = buildIndex()

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = (() => {
    const needle = query.trim().toLowerCase()
    const matched = needle
      ? INDEX.filter(
          (command) =>
            command.label.toLowerCase().includes(needle) || command.hint.toLowerCase().includes(needle),
        )
      : INDEX.filter((command) => command.group === 'Pages' || command.group === 'Reports')
    return matched.slice(0, MAX_RESULTS)
  })()

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  useEffect(() => {
    setActive(0)
  }, [query])

  if (!open) return null

  const run = (command: Command) => {
    onClose()
    window.location.hash = command.href.replace(/^#/, '')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => Math.min(current + 1, results.length - 1))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => Math.max(current - 1, 0))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const command = results[active]
      if (command) run(command)
      return
    }
    if (event.key === 'Tab') {
      // Keep focus inside the dialog.
      event.preventDefault()
      inputRef.current?.focus()
    }
  }

  return (
    <>
      <div className="palette-scrim" onClick={onClose} />
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
      >
        <div className="palette__input">
          <IconSearch width={15} height={15} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder="Jump to a page, report or extension…"
            aria-label="Search pages, reports and extensions"
            aria-controls="palette-results"
            aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd>Esc</kbd>
        </div>

        <div className="palette__list" id="palette-results" role="listbox" ref={listRef}>
          {results.length === 0 ? (
            <p className="palette__empty">Nothing matches “{query}”. The palette only indexes what exists on this site.</p>
          ) : (
            results.map((command, index) => (
              <button
                type="button"
                key={command.id}
                id={`palette-${command.id}`}
                role="option"
                aria-selected={index === active}
                className={index === active ? 'palette__item is-active' : 'palette__item'}
                onMouseEnter={() => setActive(index)}
                onClick={() => run(command)}
              >
                <span className="palette__group">{command.group}</span>
                <span className="palette__label">{command.label}</span>
                <span className="palette__hint">{command.hint}</span>
              </button>
            ))
          )}
        </div>

        <div className="palette__foot">
          <span>↑ ↓ navigate</span>
          <span>Enter open</span>
          <span>Esc close</span>
        </div>
      </div>
    </>
  )
}
