import { useEffect, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Keeps keyboard focus inside a dialog while it is open and restores focus to
 * the trigger on close. No animation, no library.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, open: boolean) {
  useEffect(() => {
    if (!open) return
    const container = ref.current
    if (!container) return
    const previous = document.activeElement as HTMLElement | null

    const focusFirst = () => {
      const first = container.querySelector<HTMLElement>(FOCUSABLE)
      first?.focus()
    }
    focusFirst()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (node) => node.offsetParent !== null || node === document.activeElement,
      )
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', onKeyDown)
    return () => {
      container.removeEventListener('keydown', onKeyDown)
      previous?.focus?.()
    }
  }, [ref, open])
}
