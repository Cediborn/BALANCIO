import type { ReactNode } from 'react'

interface SegmentedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  ariaLabel?: string
}

export function Segmented<T extends string>({ value, onChange, options, ariaLabel }: SegmentedProps<T>) {
  return (
    <div className="segmented" role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={`segmented-btn${value === opt.value ? ' active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

interface ProgressBarProps {
  fraction: number
  warn?: boolean
  done?: boolean
}

export function ProgressBar({ fraction, warn, done }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)))
  const cls = ['progress-fill']
  if (warn) cls.push('warn')
  if (done) cls.push('done')
  return (
    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={cls.join(' ')} style={{ width: `${pct}%` }} />
    </div>
  )
}

interface EmptyStateProps {
  icon: ReactNode
  title: string
  desc: string
  action?: ReactNode
}

export function EmptyState({ icon, title, desc, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {desc ? <div className="empty-desc">{desc}</div> : null}
      {action ? <div style={{ marginTop: 12 }}>{action}</div> : null}
    </div>
  )
}