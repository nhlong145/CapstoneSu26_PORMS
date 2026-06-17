export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

export interface Alert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  isRead: boolean
  createdAt: string
}
