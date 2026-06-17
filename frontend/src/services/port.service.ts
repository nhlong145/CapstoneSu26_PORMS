import { api } from './api'
import type { CreatePortRequest, Port, PortStatus, UpdatePortRequest } from '@/types/port.types'
import {
  MOCK_PORTS_STATUS,
  getMockPort,
  getMockPortStatus,
  getMockPortsMutable,
  removeMockPort,
  upsertMockPort,
} from '@/mocks/ports.mock'

async function tryApi<T>(call: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await call()
  } catch {
    return fallback
  }
}

export async function getPorts(): Promise<Port[]> {
  return tryApi(
    async () => {
      const { data } = await api.get<Port[]>('/api/ports')
      return data
    },
    getMockPortsMutable(),
  )
}

export async function getPortsStatus(): Promise<PortStatus[]> {
  return tryApi(
    async () => {
      const { data } = await api.get<PortStatus[]>('/api/ports/status')
      return data
    },
    MOCK_PORTS_STATUS,
  )
}

export async function getPortStatus(portId: string): Promise<PortStatus> {
  return tryApi(
    async () => {
      const { data } = await api.get<PortStatus>(`/api/ports/${portId}/status`)
      return data
    },
    getMockPortStatus(portId) ?? MOCK_PORTS_STATUS[0],
  )
}

export async function getPort(portId: string): Promise<Port> {
  return tryApi(
    async () => {
      const { data } = await api.get<Port>(`/api/ports/${portId}`)
      return data
    },
    getMockPort(portId) ?? getMockPortsMutable()[0],
  )
}

export async function createPort(request: CreatePortRequest): Promise<Port> {
  try {
    const { data } = await api.post<Port>('/api/ports', request)
    upsertMockPort(data)
    return data
  } catch {
    const now = new Date().toISOString()
    const port: Port = {
      id: crypto.randomUUID(),
      name: request.name,
      code: request.code,
      address: request.address ?? null,
      latitude: request.latitude,
      longitude: request.longitude,
      timezone: request.timezone ?? 'Asia/Ho_Chi_Minh',
      currentMode: 'NORMAL',
      currentRiskLevel: 'LOW',
      defaultWeatherSourceId: request.defaultWeatherSourceId ?? null,
      owStationId: request.owStationId ?? null,
      isActive: true,
      zoneCount: 0,
      createdAt: now,
      updatedAt: now,
    }
    upsertMockPort(port)
    return port
  }
}

export async function updatePort(portId: string, request: UpdatePortRequest): Promise<Port> {
  try {
    const { data } = await api.put<Port>(`/api/ports/${portId}`, request)
    upsertMockPort(data)
    return data
  } catch {
    const existing = getMockPort(portId) ?? getMockPortsMutable()[0]
    const updated: Port = {
      ...existing,
      ...request,
      updatedAt: new Date().toISOString(),
    }
    upsertMockPort(updated)
    return updated
  }
}

export async function disablePort(portId: string): Promise<void> {
  try {
    await api.delete(`/api/ports/${portId}`)
  } finally {
    removeMockPort(portId)
  }
}
