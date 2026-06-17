export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type OperationMode = 'NORMAL' | 'LIMITED' | 'STOP'

export interface WeatherSnapshot {
  windSpeedMs: number
  beaufortNumber: number
  rainfall1hMm: number | null
  temperatureC: number | null
  humidityPct: number | null
  visibilityKm: number | null
  owWeatherDesc: string | null
  owWeatherIcon: string | null
  observedAt: string
}

export interface Port {
  id: string
  name: string
  code: string
  address: string | null
  latitude: number
  longitude: number
  timezone: string
  currentMode: OperationMode
  currentRiskLevel: RiskLevel
  defaultWeatherSourceId: string | null
  owStationId: string | null
  isActive: boolean
  zoneCount: number
  createdAt: string
  updatedAt: string
}

export interface PortStatus {
  portId: string
  portName: string
  portCode: string
  currentMode: OperationMode
  currentRiskLevel: RiskLevel
  unreadAlertCount: number
  assessmentSummary: string | null
  lastAssessedAt: string | null
  weather: WeatherSnapshot | null
}

export interface CreatePortRequest {
  name: string
  code: string
  latitude: number
  longitude: number
  address?: string | null
  timezone?: string
  owStationId?: string | null
  defaultWeatherSourceId?: string | null
}

export interface UpdatePortRequest {
  name?: string
  address?: string | null
  latitude?: number
  longitude?: number
  timezone?: string
  owStationId?: string | null
  isActive?: boolean
}
