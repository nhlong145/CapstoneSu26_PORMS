import type { Port, PortStatus } from '@/types/port.types'

export const MOCK_PORT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

const mockWeather = {
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

export const MOCK_PORTS: Port[] = [
  {
    id: MOCK_PORT_ID,
    name: 'Cảng Tiên Sa — Đà Nẵng',
    code: 'DNTSA',
    address: 'Sơn Trà, Đà Nẵng',
    latitude: 16.1051,
    longitude: 108.2338,
    timezone: 'Asia/Ho_Chi_Minh',
    currentMode: 'LIMITED',
    currentRiskLevel: 'MEDIUM',
    defaultWeatherSourceId: 'ws-openweather-001',
    owStationId: '1583992',
    isActive: true,
    zoneCount: 6,
    createdAt: '2025-01-01T00:00:00+07:00',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    name: 'Cảng Sài Gòn — TP.HCM',
    code: 'SGPORT',
    address: 'Quận 4, TP.HCM',
    latitude: 10.7769,
    longitude: 106.7009,
    timezone: 'Asia/Ho_Chi_Minh',
    currentMode: 'NORMAL',
    currentRiskLevel: 'LOW',
    defaultWeatherSourceId: null,
    owStationId: '1566083',
    isActive: true,
    zoneCount: 4,
    createdAt: '2025-01-01T00:00:00+07:00',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    name: 'Cảng Hải Phòng',
    code: 'HPHPT',
    address: 'Hải Phòng',
    latitude: 20.8449,
    longitude: 106.6881,
    timezone: 'Asia/Ho_Chi_Minh',
    currentMode: 'STOP',
    currentRiskLevel: 'CRITICAL',
    defaultWeatherSourceId: null,
    owStationId: null,
    isActive: true,
    zoneCount: 5,
    createdAt: '2025-01-01T00:00:00+07:00',
    updatedAt: new Date().toISOString(),
  },
]

export const MOCK_PORTS_STATUS: PortStatus[] = MOCK_PORTS.map((port) => ({
  portId: port.id,
  portName: port.name,
  portCode: port.code,
  currentMode: port.currentMode,
  currentRiskLevel: port.currentRiskLevel,
  unreadAlertCount: port.id === MOCK_PORT_ID ? 3 : port.currentRiskLevel === 'CRITICAL' ? 8 : 0,
  assessmentSummary:
    port.id === MOCK_PORT_ID
      ? 'Gió Beaufort 7 và mưa 12 mm/h đẩy rủi ro lên MEDIUM — chế độ LIMITED.'
      : null,
  lastAssessedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  weather: port.id === MOCK_PORT_ID ? mockWeather : null,
}))

export function getMockPortStatus(portId: string): PortStatus | undefined {
  return MOCK_PORTS_STATUS.find((p) => p.portId === portId)
}

export function getMockPort(portId: string): Port | undefined {
  return MOCK_PORTS.find((p) => p.id === portId)
}

let mockPorts = [...MOCK_PORTS]

export function getMockPortsMutable(): Port[] {
  return mockPorts
}

export function setMockPorts(ports: Port[]): void {
  mockPorts = ports
}

export function upsertMockPort(port: Port): void {
  const idx = mockPorts.findIndex((p) => p.id === port.id)
  if (idx >= 0) mockPorts[idx] = port
  else mockPorts.push(port)
}

export function removeMockPort(portId: string): void {
  mockPorts = mockPorts.filter((p) => p.id !== portId)
}
