import { useEffect, useState } from 'react'
import { IconCheck, IconCopy } from './Icons'

/** Copies the current address, query string included, so a filtered view can be shared as-is. */
export function CopyLinkButton({ label = 'Copy view link' }: { label?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      const area = document.createElement('textarea')
      area.value = window.location.href
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
    <button type="button" className={copied ? 'copy-link is-copied' : 'copy-link'} onClick={copy}>
      {copied ? <IconCheck width={13} height={13} /> : <IconCopy width={13} height={13} />}
      {copied ? 'Link copied' : label}
    </button>
  )
}
