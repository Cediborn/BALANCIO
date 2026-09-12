import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  center?: boolean
  labelledBy?: string
}

export function Sheet({ open, onClose, title, children, center, labelledBy }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    const prev = ref.current?.querySelector<HTMLElement>('input,button,select,textarea,[tabindex]')
    prev?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={ref}
        className={center ? 'modal' : 'sheet'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {!center && !title ? (
          <div className="sheet-handle" aria-hidden="true" />
        ) : null}
        {title ? (
          <div className="sheet-header">
            <h2 className="sheet-title" id={labelledBy ?? undefined}>
              {title}
            </h2>
            <button className="btn-icon" onClick={onClose} aria-label="Close">
              <Icon name="close" size={18} />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  )
}