type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}

export default function Button({ variant = 'primary', ...props }: Props) {
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
  }

  const { className, disabled, ...rest } = props

  return (
    <button
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        styles[variant],
        className ?? '',
      ].join(' ')}
      {...rest}
    />
  )
}