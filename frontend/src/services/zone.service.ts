import { api } from './api'
import type { CreateZoneRequest, UpdateZoneRequest, Zone, ZoneStatus } from '@/types/zone.types'
import { MOCK_ZONES, getMockZone, getMockZonesByPort, upsertMockZone } from '@/mocks/zones.mock'

async function tryApi<T>(call: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await call()
  } catch {
    return fallback
  }
}

export async function getZones(portId: string): Promise<Zone[]> {
  return tryApi(
    async () => {
      const { data } = await api.get<Zone[]>(`/api/ports/${portId}/zones`)
      return data
    },
    getMockZonesByPort(portId),
  )
}

export async function createZone(portId: string, request: CreateZoneRequest): Promise<Zone> {
  try {
    const { data } = await api.post<Zone>(`/api/ports/${portId}/zones`, request)
    upsertMockZone(data)
    return data
  } catch {
    const zone: Zone = {
      id: crypto.randomUUID(),
      portId,
      name: request.name,
      zoneType: request.zoneType,
      description: request.description ?? null,
      capacity: request.capacity ?? null,
      latitude: request.latitude ?? null,
      longitude: request.longitude ?? null,
      config: null,
      currentRiskLevel: 'LOW',
      displayOrder: request.displayOrder ?? 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      hasThresholdOverride: false,
    }
    upsertMockZone(zone)
    return zone
  }
}

export async function updateZone(zoneId: string, request: UpdateZoneRequest): Promise<Zone> {
  try {
    const { data } = await api.put<Zone>(`/api/zones/${zoneId}`, request)
    upsertMockZone(data)
    return data
  } catch {
    const existing = getMockZone(zoneId)
    if (!existing) throw new Error('Zone not found')
    const updated: Zone = { ...existing, ...request }
    upsertMockZone(updated)
    return updated
  }
}

export async function getZoneStatus(zoneId: string): Promise<ZoneStatus> {
  const fallbackZone = getMockZone(zoneId) ?? getMockZonesByPort(MOCK_ZONES[0]?.portId ?? '')[0]
  return tryApi(
    async () => {
      const { data } = await api.get<ZoneStatus>(`/api/zones/${zoneId}/status`)
      return data
    },
    {
      zone: fallbackZone,
      activeRestrictions: [],
    },
  )
}

export async function getZonesStatus(portId: string): Promise<ZoneStatus[]> {
  return tryApi(
    async () => {
      const { data } = await api.get<ZoneStatus[]>(`/api/ports/${portId}/zones/status`)
      return data
    },
    getMockZonesByPort(portId).map((zone) => ({ zone, activeRestrictions: [] })),
  )
}
