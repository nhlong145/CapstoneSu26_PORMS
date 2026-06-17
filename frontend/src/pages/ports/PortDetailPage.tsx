import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '@/components/common/Button'
import Spinner from '@/components/common/Spinner'
import CreateZoneModal from '@/components/ports/CreateZoneModal'
import EditPortModal from '@/components/ports/EditPortModal'
import { useAuth } from '@/hooks/useAuth'
import { RISK_COLORS, RISK_LABELS_VI } from '@/hooks/useRiskColor'
import { getPort, updatePort } from '@/services/port.service'
import { createZone, getZones } from '@/services/zone.service'
import type { Port, UpdatePortRequest } from '@/types/port.types'
import type { CreateZoneRequest, Zone } from '@/types/zone.types'
import { ZONE_TYPE_LABELS } from '@/types/zone.types'

export default function PortDetailPage() {
  const { portId = '' } = useParams()
  const { user } = useAuth()
  const [port, setPort] = useState<Port | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [zoneOpen, setZoneOpen] = useState(false)

  const canEditPort = user?.role === 'ADMIN'
  const canManageZones = user?.role === 'ADMIN' || user?.role === 'PORT_MANAGER'

  const load = useCallback(async () => {
    if (!portId) return
    setLoading(true)
    const [portData, zoneData] = await Promise.all([getPort(portId), getZones(portId)])
    setPort(portData)
    setZones(zoneData)
    setLoading(false)
  }, [portId])

  useEffect(() => {
    void load()
  }, [load])

  async function handleUpdatePort(request: UpdatePortRequest) {
    if (!port) return
    const updated = await updatePort(port.id, request)
    setPort(updated)
  }

  async function handleCreateZone(request: CreateZoneRequest) {
    if (!port) return
    const zone = await createZone(port.id, request)
    setZones((prev) => [...prev, zone].sort((a, b) => a.displayOrder - b.displayOrder))
  }

  if (loading || !port) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/ports" className="text-brand hover:underline">
          ← Danh sách cảng
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{port.name}</h1>
            <div className="mt-1 text-sm text-slate-600">
              Mã: <strong>{port.code}</strong> · {port.address ?? '—'}
            </div>
          </div>
          <div className="flex gap-2">
            {canManageZones && (
              <Button variant="secondary" onClick={() => setZoneOpen(true)}>
                + Thêm zone
              </Button>
            )}
            {canEditPort && (
              <Button variant="primary" onClick={() => setEditOpen(true)}>
                Chỉnh sửa cảng
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <InfoItem label="Tọa độ" value={`${port.latitude}, ${port.longitude}`} />
          <InfoItem label="Timezone" value={port.timezone} />
          <InfoItem
            label="Weather source"
            value={port.defaultWeatherSourceId ? 'OpenWeather (configured)' : 'Chưa cấu hình'}
          />
          <InfoItem label="OW Station" value={port.owStationId ?? '—'} />
          <InfoItem label="Chế độ" value={port.currentMode} />
          <InfoItem label="Rủi ro" value={port.currentRiskLevel} />
          <InfoItem label="Zones" value={String(zones.length)} />
          <InfoItem label="Trạng thái" value={port.isActive ? 'Hoạt động' : 'Vô hiệu'} />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Danh sách zones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-2">Tên</th>
                <th className="px-4 py-2">Loại</th>
                <th className="px-4 py-2">Rủi ro</th>
                <th className="px-4 py-2">Sức chứa</th>
                <th className="px-4 py-2">Override</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => {
                const color = RISK_COLORS[zone.currentRiskLevel]
                return (
                  <tr key={zone.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-slate-900">{zone.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {ZONE_TYPE_LABELS[zone.zoneType]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex rounded-full border px-2 py-0.5 text-xs font-bold"
                        style={{
                          color,
                          borderColor: `${color}4d`,
                          backgroundColor: `${color}1a`,
                        }}
                      >
                        {RISK_LABELS_VI[zone.currentRiskLevel]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{zone.capacity ?? '—'}</td>
                    <td className="px-4 py-3">
                      {zone.hasThresholdOverride ? (
                        <span className="text-xs text-amber-700" title="Có threshold override">
                          ⚙️ Có override
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {zones.length === 0 && (
          <div className="p-6 text-center text-sm text-slate-500">Chưa có zone nào trong cảng này.</div>
        )}
      </div>

      {canEditPort && (
        <EditPortModal
          open={editOpen}
          port={port}
          onClose={() => setEditOpen(false)}
          onSave={handleUpdatePort}
        />
      )}
      {canManageZones && (
        <CreateZoneModal open={zoneOpen} onClose={() => setZoneOpen(false)} onSave={handleCreateZone} />
      )}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">{label}</div>
      <div className="mt-0.5 text-slate-800">{value}</div>
    </div>
  )
}
