import { useState, type FormEvent } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import type { CreateZoneRequest, ZoneType } from '@/types/zone.types'
import { ZONE_TYPE_LABELS } from '@/types/zone.types'

const ZONE_TYPES: ZoneType[] = ['DOCK', 'YARD', 'GATE', 'WAREHOUSE']

type Props = {
  open: boolean
  onClose: () => void
  onSave: (request: CreateZoneRequest) => Promise<void>
}

export default function CreateZoneModal({ open, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [zoneType, setZoneType] = useState<ZoneType>('DOCK')
  const [description, setDescription] = useState('')
  const [capacity, setCapacity] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [displayOrder, setDisplayOrder] = useState('0')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  function resetForm() {
    setName('')
    setZoneType('DOCK')
    setDescription('')
    setCapacity('')
    setLatitude('')
    setLongitude('')
    setDisplayOrder('0')
    setErrors({})
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!name.trim()) nextErrors.name = 'Tên zone là bắt buộc'

    if (capacity && (Number.isNaN(Number(capacity)) || Number(capacity) < 1)) {
      nextErrors.capacity = 'Sức chứa phải ≥ 1'
    }
    if (latitude) {
      const lat = Number(latitude)
      if (Number.isNaN(lat) || lat < -90 || lat > 90) nextErrors.latitude = 'Latitude không hợp lệ'
    }
    if (longitude) {
      const lng = Number(longitude)
      if (Number.isNaN(lng) || lng < -180 || lng > 180) nextErrors.longitude = 'Longitude không hợp lệ'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        zoneType,
        description: description.trim() || null,
        capacity: capacity ? Number(capacity) : null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        displayOrder: Number(displayOrder) || 0,
      })
      resetForm()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title="Thêm zone mới"
      onClose={() => {
        resetForm()
        onClose()
      }}
    >
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs font-semibold text-slate-600">Tên zone *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand"
          />
          {errors.name && <p className="mt-1 text-xs text-risk-critical">{errors.name}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Loại zone *</label>
          <select
            value={zoneType}
            onChange={(e) => setZoneType(e.target.value as ZoneType)}
            className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand"
          >
            {ZONE_TYPES.map((t) => (
              <option key={t} value={t}>
                {ZONE_TYPE_LABELS[t]} ({t})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Sức chứa</label>
            <input
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              type="number"
              min={1}
              className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand"
            />
            {errors.capacity && <p className="mt-1 text-xs text-risk-critical">{errors.capacity}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Thứ tự hiển thị</label>
            <input
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              type="number"
              className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Latitude</label>
            <input
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand"
            />
            {errors.latitude && <p className="mt-1 text-xs text-risk-critical">{errors.latitude}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Longitude</label>
            <input
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand"
            />
            {errors.longitude && <p className="mt-1 text-xs text-risk-critical">{errors.longitude}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              resetForm()
              onClose()
            }}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Đang tạo...' : 'Tạo zone'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
