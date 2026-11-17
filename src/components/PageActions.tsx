import { useEffect, useState } from 'react'
import { IconCheck, IconDownload, IconExternal } from './Icons'

/** Opens the print dialog, where the browser can save the report as a PDF. */
export function PrintButton({ label = 'Download PDF' }: { label?: string }) {
  return (
    <button
      type="button"
      className="copy-link"
      onClick={() => window.print()}
      title="Print, or choose “Save as PDF” in the dialog"
    >
      <IconDownload width={13} height={13} />
      {label}
    </button>
  )
}

/** Native share sheet on mobile, clipboard fallback everywhere else. */
export function ShareButton({ title }: { title: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  useEffect(() => {
    if (state === 'idle') return
    const timer = window.setTimeout(() => setState('idle'), 1800)
    return () => window.clearTimeout(timer)
  }, [state])

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        /* the user dismissed the sheet, or the browser refused */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setState('copied')
    } catch {
      setState('failed')
    }
  }

  return (
    <button type="button" className={state === 'copied' ? 'copy-link is-copied' : 'copy-link'} onClick={share}>
      {state === 'copied' ? <IconCheck width={13} height={13} /> : <IconExternal width={13} height={13} />}
      {state === 'copied' ? 'Link copied' : state === 'failed' ? 'Share unavailable' : 'Share'}
    </button>
  )
}
