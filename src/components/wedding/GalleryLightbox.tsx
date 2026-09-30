import { useEffect, useRef, type PointerEvent } from 'react'
import type { ImageAsset } from '@/types'
import { copy } from '@/locales/id'

interface GalleryLightboxProps {
  images: ImageAsset[]
  index: number
  onIndex: (index: number) => void
  onClose: () => void
}

/** Full-screen photo viewer on a native modal <dialog> (focus trap + Esc for free). */
export function GalleryLightbox({ images, index, onIndex, onClose }: GalleryLightboxProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const swipeStart = useRef<number | null>(null)
  const image = images[index]
  const go = (delta: number) => onIndex((index + delta + images.length) % images.length)

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    // Don't close() in cleanup: that fires `close` → onClose, which would unmount
    // the viewer during StrictMode's effect re-run. Removing the node closes it.
    if (!el.open) el.showModal()
    document.documentElement.classList.add('is-lightbox')
    return () => document.documentElement.classList.remove('is-lightbox')
  }, [])

  const onPointerUp = (e: PointerEvent) => {
    if (swipeStart.current === null) return
    const dx = e.clientX - swipeStart.current
    swipeStart.current = null
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
  }

  return (
    <dialog
      ref={dialog}
      aria-label={copy.gallery.dialog}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1)
        if (e.key === 'ArrowLeft') go(-1)
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="lightbox m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-ivory backdrop:bg-[rgba(38,30,24,0.9)] backdrop:backdrop-blur-sm"
    >
      <div
        className="relative flex h-full flex-col items-center justify-center px-5"
        onPointerDown={(e) => (swipeStart.current = e.clientX)}
        onPointerUp={onPointerUp}
      >
        <figure key={image.url} className="lightbox-image flex max-h-[78dvh] max-w-[min(92vw,640px)] flex-col items-center">
          <img
            src={image.url}
            alt={image.alt}
            onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
            className="max-h-[72dvh] w-auto rounded-sm object-contain shadow-2xl"
          />
          <figcaption className="mt-4 text-center font-serif text-sm text-ivory/80 italic">
            {image.caption ?? `${index + 1} / ${images.length}`}
          </figcaption>
        </figure>

        <button
          type="button"
          onClick={onClose}
          aria-label={copy.gallery.close}
          className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 flex h-11 w-11 items-center justify-center rounded-full border border-ivory/30 text-xl"
        >
          <span aria-hidden="true">×</span>
        </button>
        {images.length > 1 && (
          <div className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] flex gap-4">
            <button type="button" onClick={() => go(-1)} aria-label={copy.gallery.prev} className="h-11 w-11 rounded-full border border-ivory/30">
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" onClick={() => go(1)} aria-label={copy.gallery.next} className="h-11 w-11 rounded-full border border-ivory/30">
              <span aria-hidden="true">›</span>
            </button>
          </div>
        )}
      </div>
    </dialog>
  )
}
