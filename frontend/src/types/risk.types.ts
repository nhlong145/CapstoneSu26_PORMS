export type { RiskLevel } from '@/types/port.types'

export interface RiskAssessment {
  id: string
  portId: string
  riskLevel: import('@/types/port.types').RiskLevel
  assessedAt: string
  summary: string | null
}

export interface RiskConfig {
  id: string
  factor: string
  riskLevel: import('@/types/port.types').RiskLevel
  minValue: number
  maxValue: number | null
}
