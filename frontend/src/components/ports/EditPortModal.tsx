import { useEffect, useState, type FormEvent } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import type { Port, UpdatePortRequest } from '@/types/port.types'

type Props = {
  open: boolean
  port: Port
  onClose: () => void
  onSave: (request: UpdatePortRequest) => Promise<void>
}

export default function EditPortModal({ open, port, onClose, onSave }: Props) {
  const [name, setName] = useState(port.name)
  const [address, setAddress] = useState(port.address ?? '')
  const [latitude, setLatitude] = useState(String(port.latitude))
  const [longitude, setLongitude] = useState(String(port.longitude))
  const [timezone, setTimezone] = useState(port.timezone)
  const [owStationId, setOwStationId] = useState(port.owStationId ?? '')
  const [isActive, setIsActive] = useState(port.isActive)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setName(port.name)
      setAddress(port.address ?? '')
      setLatitude(String(port.latitude))
      setLongitude(String(port.longitude))
      setTimezone(port.timezone)
      setOwStationId(port.owStationId ?? '')
      setIsActive(port.isActive)
      setErrors({})
    }
  }, [open, port])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!name.trim()) nextErrors.name = 'Tên cảng là bắt buộc'
    const lat = Number(latitude)
    const lng = Number(longitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90) nextErrors.latitude = 'Latitude từ -90 đến 90'
    if (Number.isNaN(lng) || lng < -180 || lng > 180) nextErrors.longitude = 'Longitude từ -180 đến 180'
    if (!timezone.trim()) nextErrors.timezone = 'Timezone là bắt buộc'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        address: address.trim() || null,
        latitude: lat,
        longitude: lng,
        timezone: timezone.trim(),
        owStationId: owStationId.trim() || null,
        isActive,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} title="Chỉnh sửa cảng" onClose={onClose}>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="text-xs font-semibold text-slate-600">Mã cảng</label>
          <input
            value={port.code}
            disabled
            className="mt-1 h-9 w-full rounded border border-gray-200 bg-slate-50 px-3 text-sm text-slate-500"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Tên cảng *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand"
          />
          {errors.name && <p className="mt-1 text-xs text-risk-critical">{errors.name}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Địa chỉ</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Latitude *</label>
            <input
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand"
            />
            {errors.latitude && <p className="mt-1 text-xs text-risk-critical">{errors.latitude}</p>}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Longitude *</label>
            <input
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand"
            />
            {errors.longitude && <p className="mt-1 text-xs text-risk-critical">{errors.longitude}</p>}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Timezone *</label>
          <input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand"
          />
          {errors.timezone && <p className="mt-1 text-xs text-risk-critical">{errors.timezone}</p>}
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">OpenWeather Station ID</label>
          <input
            value={owStationId}
            onChange={(e) => setOwStationId(e.target.value)}
            className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Cảng đang hoạt động
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
