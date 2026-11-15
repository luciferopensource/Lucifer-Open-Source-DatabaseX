import { useEffect, useRef } from 'react'

const TRAIL_LENGTH = 7

/**
 * The only motion in the replica: a solid dot that tracks the pointer
 * instantly, an inertial ring that swells over interactive elements, and a
 * short decaying trail. Nothing else on the site animates.
 */
export function Cursor() {
  const layerRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const trailRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let pointerX = window.innerWidth / 2
    let pointerY = window.innerHeight / 2
    let ringX = pointerX
    let ringY = pointerY
    let scale = 1
    let targetScale = 1
    let frame = 0

    const trail = Array.from({ length: TRAIL_LENGTH }, (_, index) => ({
      element: trailRefs.current[index],
      x: pointerX,
      y: pointerY,
      lag: 0.32 - index * 0.026,
    })).filter((item): item is { element: HTMLDivElement; x: number; y: number; lag: number } => item.element !== null)

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`
      if (layerRef.current) layerRef.current.style.opacity = '1'
    }

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      targetScale = target.closest('a, button, select, input, [data-cursor="active"]') ? 1.55 : 1
    }

    const onPointerLeave = () => {
      if (layerRef.current) layerRef.current.style.opacity = '0'
    }

    const render = () => {
      ringX += (pointerX - ringX) * 0.18
      ringY += (pointerY - ringY) * 0.18
      scale += (targetScale - scale) * 0.16
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${scale})`

      let previousX = ringX
      let previousY = ringY
      for (const item of trail) {
        item.x += (previousX - item.x) * item.lag
        item.y += (previousY - item.y) * item.lag
        item.element.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) scale(${Math.max(0.35, 1 - trail.indexOf(item) * 0.1)})`
        previousX = item.x
        previousY = item.y
      }

      frame = window.requestAnimationFrame(render)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerover', onPointerOver, { passive: true })
    document.addEventListener('pointerleave', onPointerLeave)
    frame = window.requestAnimationFrame(render)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('pointerleave', onPointerLeave)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="cursor-layer" ref={layerRef} aria-hidden="true" style={{ opacity: 0 }}>
      {Array.from({ length: TRAIL_LENGTH }, (_, index) => (
        <div
          key={index}
          ref={(element) => {
            trailRefs.current[index] = element
          }}
          className="cursor cursor--trail"
          style={{ opacity: 0.42 - index * 0.05 }}
        />
      ))}
      <div className="cursor cursor--ring" ref={ringRef} />
      <div className="cursor cursor--dot" ref={dotRef} />
    </div>
  )
}
