type BadgeColor =
  | 'risk-low'
  | 'risk-medium'
  | 'risk-high'
  | 'risk-critical'
  | 'gray'
  | 'blue'

type BadgeSize = 'sm' | 'md'

type Props = {
  label: string
  color?: BadgeColor
  size?: BadgeSize
  className?: string
}

export default function Badge({ label, color = 'gray', size = 'sm', className }: Props) {
  const colorClasses: Record<BadgeColor, string> = {
    'risk-low': 'bg-risk-low/15 text-risk-low ring-risk-low/30',
    'risk-medium': 'bg-risk-medium/15 text-risk-medium ring-risk-medium/30',
    'risk-high': 'bg-risk-high/15 text-risk-high ring-risk-high/30',
    'risk-critical': 'bg-risk-critical/15 text-risk-critical ring-risk-critical/30',
    gray: 'bg-gray-100 text-gray-700 ring-gray-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  }

  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }

  return (
    <span
      className={[
        'inline-flex items-center rounded-full ring-1 ring-inset font-medium whitespace-nowrap',
        sizeClasses[size],
        colorClasses[color],
        className ?? '',
      ].join(' ')}
    >
      {label}
    </span>
  )
}