import type { OperationMode, PortStatus, RiskLevel, WeatherSnapshot } from '@/types/port.types'
import type { ZoneStatus } from '@/types/zone.types'
import { MOCK_PORT_ID } from '@/mocks/ports.mock'
import { getMockZoneStatuses } from '@/mocks/zones.mock'

export const MOCK_WEATHER: WeatherSnapshot = {
  windSpeedMs: 14.2,
  beaufortNumber: 7,
  rainfall1hMm: 12,
  temperatureC: 28.5,
  humidityPct: 87,
  visibilityKm: 7.5,
  owWeatherDesc: 'Gió mạnh',
  owWeatherIcon: '50d',
  observedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
}

export const MOCK_PORT_STATUS: PortStatus = {
  portId: MOCK_PORT_ID,
  portName: 'Cảng Tiên Sa — Đà Nẵng',
  portCode: 'DNTSA',
  currentMode: 'LIMITED',
  currentRiskLevel: 'MEDIUM',
  unreadAlertCount: 3,
  assessmentSummary:
    'Gió Beaufort 7 (14.2 m/s) và mưa 12 mm/h — rủi ro MEDIUM. Khuyến nghị hạn chế thiết bị nâng cao tại Dock A/B.',
  lastAssessedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  weather: MOCK_WEATHER,
}

export const MOCK_MODE_SINCE = new Date(Date.now() - (2 * 60 + 15) * 60 * 1000).toISOString()

export const MOCK_RISK_TREND_24H: RiskLevel[] = [
  'LOW',
  'LOW',
  'LOW',
  'LOW',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'HIGH',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
  'MEDIUM',
]

export const MOCK_ZONE_STATUSES: ZoneStatus[] = getMockZoneStatuses(MOCK_PORT_ID)

export const MOCK_RECENT_TASKS = [
  {
    id: '1',
    title: 'Hạn chế thiết bị nâng cao >15m tại Dock A',
    meta: '14:32 · SOP MEDIUM-002 · Hệ thống',
    done: false,
  },
  {
    id: '2',
    title: 'Kiểm tra neo buộc tàu tại Dock B',
    meta: '14:32 · SOP MEDIUM-003 · Hệ thống',
    done: false,
  },
  {
    id: '3',
    title: 'Tăng tần suất giám sát khắp cảng',
    meta: '14:32 · SOP MEDIUM-001 · Hệ thống',
    done: true,
  },
]

export const MOCK_ASSESSMENT_FACTORS = [
  { label: 'Gió', value: '14.2 m/s (Beaufort 7)', level: 'MEDIUM' as RiskLevel },
  { label: 'Mưa', value: '12 mm/h', level: 'MEDIUM' as RiskLevel },
  { label: 'Tầm nhìn', value: '7.5 km', level: 'LOW' as RiskLevel },
]

export const MOCK_MODE: OperationMode = 'LIMITED'

export const MOCK_RESPONSE_TIME_MIN = 4.2

export const MOCK_ALERT_STATS = { today: 12, unread: 3 }
