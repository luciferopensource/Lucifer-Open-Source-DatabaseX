import type { ReactNode } from 'react'

export type Tone = 'plain' | 'pos' | 'warn' | 'info' | 'neg'

export function Pill({ tone = 'plain', dot = false, children }: { tone?: Tone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={`pill pill--${tone}`}>
      {dot ? <span className="pill__dot" /> : null}
      {children}
    </span>
  )
}

export function StatusPill({ status }: { status: string }) {
  const upper = status.toUpperCase()
  const tone: Tone = /COMPLETE|VERIFIED|SYNCHRON|COMMITTED|CACHED|SAVED|AUDITED/.test(upper)
    ? 'pos'
    : /PARTIAL|PENDING|STALE/.test(upper)
      ? 'warn'
      : 'plain'
  return (
    <Pill tone={tone} dot>
      {status}
    </Pill>
  )
}

export function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="kpi">
      <div className="kpi__label">{label}</div>
      <div className="kpi__value">{value}</div>
      {sub ? <div className="kpi__sub">{sub}</div> : null}
    </div>
  )
}

export function Panel({
  title,
  icon,
  meta,
  children,
  flush = false,
}: {
  title: string
  icon?: ReactNode
  meta?: string
  children: ReactNode
  flush?: boolean
}) {
  return (
    <section className="panel">
      <div className="panel__head">
        <h2 className="panel__title">
          {icon}
          {title}
        </h2>
        {meta ? <span className="panel__meta">{meta}</span> : null}
      </div>
      <div className={flush ? 'panel__body panel__body--flush' : 'panel__body'}>{children}</div>
    </section>
  )
}

export interface TabItem {
  id: string
  label: string
  count?: string
}

export function Tabs({
  items,
  value,
  onChange,
  label,
}: {
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  label: string
}) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          id={`tab-${item.id}`}
          aria-selected={value === item.id}
          aria-controls={`panel-${item.id}`}
          className="tab"
          onClick={() => onChange(item.id)}
        >
          {item.label}
          {item.count ? <span className="tab__count">{item.count}</span> : null}
        </button>
      ))}
    </div>
  )
}

export function TabPanel({ id, active, children }: { id: string; active: string; children: ReactNode }) {
  if (id !== active) return null
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`}>
      {children}
    </div>
  )
}

export function Bar({ pct }: { pct: number }) {
  const width = Math.min(100, Math.max(pct, 0.8))
  return (
    <div className="bar" role="presentation">
      <div className="bar__fill" style={{ width: `${width}%` }} />
    </div>
  )
}

export function SectionHead({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow?: string
  title: string
  description?: string
  aside?: ReactNode
}) {
  return (
    <div className="section__head">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="section__title">{title}</h2>
        {description ? <p className="section__desc">{description}</p> : null}
      </div>
      {aside}
    </div>
  )
}
