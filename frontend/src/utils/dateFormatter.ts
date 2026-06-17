const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' })

export function formatTimeAgo(isoDate: string): string {
  const then = new Date(isoDate).getTime()
  const now = Date.now()
  const diffSec = Math.round((then - now) / 1000)

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
    ['second', 1],
  ]

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffSec) >= secondsInUnit || unit === 'second') {
      const value = Math.round(diffSec / secondsInUnit)
      return rtf.format(value, unit)
    }
  }

  return 'vừa xong'
}

export function formatDurationFrom(isoDate: string): string {
  const then = new Date(isoDate).getTime()
  const diffMs = Date.now() - then
  if (diffMs < 0) return 'vừa xong'

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) return `${hours} giờ ${minutes} phút`
  return `${minutes} phút`
}

export function formatTimeVi(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export function isOlderThanMinutes(isoDate: string, minutes: number): boolean {
  return Date.now() - new Date(isoDate).getTime() > minutes * 60 * 1000
}
