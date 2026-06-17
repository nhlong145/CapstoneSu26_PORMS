import type { AlertSeverity } from '@/types/alert.types'
import type { RiskLevel } from '@/types/port.types'

export type WeatherFactor = 'WIND' | 'RAIN' | 'VISIBILITY' | 'WAVE'

export type ZoneType = 'DOCK' | 'YARD' | 'GATE' | 'WAREHOUSE'

export type SopActionType =
  | 'STOP_LOADING'
  | 'LIMIT_VESSEL_ENTRY'
  | 'EVACUATE_EQUIPMENT'
  | 'CLOSE_GATE'
  | 'EMERGENCY_SHUTDOWN'
  | 'NOTIFY_AUTHORITY'
  | 'CUSTOM'

export interface ZoneConfig {
  warningText?: string
  priority?: number
  enabled?: boolean
}

export interface Zone {
  id: string
  portId: string
  name: string
  zoneType: ZoneType
  description: string | null
  capacity: number | null
  latitude: number | null
  longitude: number | null
  config: ZoneConfig | null
  currentRiskLevel: RiskLevel
  displayOrder: number
  isActive: boolean
  createdAt: string
  /** Mock/UI helper until threshold-overrides API is wired */
  hasThresholdOverride?: boolean
}

export interface ZoneRestriction {
  actionType: SopActionType
  actionDescription: string
  severity: AlertSeverity
}

export interface ZoneStatus {
  zone: Zone
  activeRestrictions: ZoneRestriction[]
}

export interface CreateZoneRequest {
  name: string
  zoneType: ZoneType
  description?: string | null
  capacity?: number | null
  latitude?: number | null
  longitude?: number | null
  displayOrder?: number
}

export interface UpdateZoneRequest {
  name?: string
  description?: string | null
  capacity?: number | null
  latitude?: number | null
  longitude?: number | null
  displayOrder?: number
  isActive?: boolean
  config?: ZoneConfig | null
}

export interface ZoneThresholdOverride {
  id: string
  zoneId: string
  factor: WeatherFactor
  riskLevel: RiskLevel
  minValue: number
  maxValue: number | null
  unit: string
  reason: string
  isActive: boolean
  updatedByUserId: string
  updatedAt: string
}

export const ZONE_TYPE_LABELS: Record<ZoneType, string> = {
  DOCK: 'Cầu tàu',
  YARD: 'Bãi',
  GATE: 'Cổng',
  WAREHOUSE: 'Kho',
}
