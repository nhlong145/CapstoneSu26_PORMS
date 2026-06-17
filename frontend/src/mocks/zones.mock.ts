import type { Zone, ZoneStatus } from '@/types/zone.types'
import { MOCK_PORT_ID } from '@/mocks/ports.mock'

export const MOCK_ZONES: Zone[] = [
  {
    id: 'z1-dock-a',
    portId: MOCK_PORT_ID,
    name: 'Cầu tàu số 1 (Dock A)',
    zoneType: 'DOCK',
    description: 'Cầu tàu chính — container 30,000 DWT',
    capacity: 450,
    latitude: 16.1055,
    longitude: 108.234,
    config: { enabled: true, priority: 1 },
    currentRiskLevel: 'MEDIUM',
    displayOrder: 1,
    isActive: true,
    createdAt: '2025-01-01T00:00:00+07:00',
    hasThresholdOverride: true,
  },
  {
    id: 'z2-dock-b',
    portId: MOCK_PORT_ID,
    name: 'Cầu tàu số 2 (Dock B)',
    zoneType: 'DOCK',
    description: 'Cầu tàu phụ — hàng rời',
    capacity: 200,
    latitude: 16.1058,
    longitude: 108.2345,
    config: null,
    currentRiskLevel: 'MEDIUM',
    displayOrder: 2,
    isActive: true,
    createdAt: '2025-01-01T00:00:00+07:00',
    hasThresholdOverride: false,
  },
  {
    id: 'z3-yard-a',
    portId: MOCK_PORT_ID,
    name: 'Bãi Container (Yard A)',
    zoneType: 'YARD',
    description: '1,200 TEU',
    capacity: 1200,
    latitude: null,
    longitude: null,
    config: null,
    currentRiskLevel: 'LOW',
    displayOrder: 3,
    isActive: true,
    createdAt: '2025-01-01T00:00:00+07:00',
    hasThresholdOverride: false,
  },
  {
    id: 'z4-yard-b',
    portId: MOCK_PORT_ID,
    name: 'Bãi Hàng Rời (Yard B)',
    zoneType: 'YARD',
    description: '5,000 m²',
    capacity: null,
    latitude: null,
    longitude: null,
    config: null,
    currentRiskLevel: 'LOW',
    displayOrder: 4,
    isActive: true,
    createdAt: '2025-01-01T00:00:00+07:00',
    hasThresholdOverride: false,
  },
  {
    id: 'z5-gate-1',
    portId: MOCK_PORT_ID,
    name: 'Cổng Chính (Gate 1)',
    zoneType: 'GATE',
    description: 'Kiểm soát xe tải',
    capacity: 20,
    latitude: null,
    longitude: null,
    config: null,
    currentRiskLevel: 'LOW',
    displayOrder: 5,
    isActive: true,
    createdAt: '2025-01-01T00:00:00+07:00',
    hasThresholdOverride: false,
  },
  {
    id: 'z6-cfs',
    portId: MOCK_PORT_ID,
    name: 'Kho CFS',
    zoneType: 'WAREHOUSE',
    description: 'Container Freight Station',
    capacity: null,
    latitude: null,
    longitude: null,
    config: null,
    currentRiskLevel: 'LOW',
    displayOrder: 6,
    isActive: true,
    createdAt: '2025-01-01T00:00:00+07:00',
    hasThresholdOverride: false,
  },
]

let mockZones = [...MOCK_ZONES]

export function getMockZonesByPort(portId: string): Zone[] {
  return mockZones.filter((z) => z.portId === portId).sort((a, b) => a.displayOrder - b.displayOrder)
}

export function upsertMockZone(zone: Zone): void {
  const idx = mockZones.findIndex((z) => z.id === zone.id)
  if (idx >= 0) mockZones[idx] = zone
  else mockZones.push(zone)
}

export function getMockZoneStatuses(portId: string): ZoneStatus[] {
  return getMockZonesByPort(portId).map((zone) => ({
    zone,
    activeRestrictions: [],
  }))
}

export function getMockZone(zoneId: string): Zone | undefined {
  return mockZones.find((z) => z.id === zoneId)
}
