import type { ReactNode } from 'react'
import Button from './Button'

type Props = {
  open: boolean
  title?: string
  children: ReactNode
  onClose?: () => void
}

export default function Modal({ open, title, children, onClose }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Modal'}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="w-full max-w-lg rounded bg-white shadow-lg">
        {(title || onClose) && (
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="text-sm font-semibold">{title}</div>
            {onClose && (
              <Button variant="secondary" onClick={onClose} className="px-3 py-1.5">
                Close
              </Button>
            )}
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}