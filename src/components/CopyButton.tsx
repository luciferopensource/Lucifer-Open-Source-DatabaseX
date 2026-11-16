import { useEffect, useState } from 'react'
import { IconCheck, IconCopy } from './Icons'

/**
 * Copies a value to the clipboard. Falls back to a hidden textarea on browsers
 * that refuse the async clipboard API, and confirms inline (no toast layer).
 */
export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1400)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const area = document.createElement('textarea')
      area.value = value
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    setCopied(true)
  }

  return (
    <button
      type="button"
      className={copied ? 'copy-btn is-copied' : 'copy-btn'}
      onClick={copy}
      aria-label={`Copy ${label ?? value}`}
    >
      {copied ? <IconCheck width={12} height={12} /> : <IconCopy width={12} height={12} />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  )
}
