import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MODE_LABELS_VI, RISK_COLORS, RISK_LABELS_VI } from '@/hooks/useRiskColor'
import { getPortsStatus } from '@/services/port.service'
import type { PortStatus } from '@/types/port.types'
import type { OperationMode, RiskLevel } from '@/types/port.types'

function ModeBadge({ mode }: { mode: OperationMode }) {
  const colors: Record<OperationMode, string> = {
    NORMAL: 'var(--color-mode-normal)',
    LIMITED: 'var(--color-mode-limited)',
    STOP: 'var(--color-mode-stop)',
  }
  const color = colors[mode]
  return (
    <span
      className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold"
      style={{ color, borderColor: `${color}4d`, backgroundColor: `${color}1a` }}
    >
      {MODE_LABELS_VI[mode]}
    </span>
  )
}

function RiskPill({ level }: { level: RiskLevel }) {
  const color = RISK_COLORS[level]
  return (
    <span
      className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold"
      style={{ color, borderColor: `${color}4d`, backgroundColor: `${color}1a` }}
    >
      {RISK_LABELS_VI[level]}
    </span>
  )
}

function PortCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
      <div className="h-4 w-2/3 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-1/3 rounded bg-slate-100" />
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-slate-100" />
        <div className="h-6 w-16 rounded-full bg-slate-100" />
      </div>
    </div>
  )
}

export default function PortListPage() {
  const navigate = useNavigate()
  const [ports, setPorts] = useState<PortStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      const data = await getPortsStatus()
      if (!cancelled) {
        setPorts(data)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <PortCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Danh sách cảng</h1>
        <p className="text-sm text-slate-600">Trạng thái vận hành real-time — click để xem chi tiết</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ports.map((port) => (
          <button
            key={port.portId}
            type="button"
            onClick={() => navigate(`/ports/${port.portId}`)}
            className="rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-brand hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-slate-900">{port.portName}</div>
                <div className="text-xs text-slate-500">{port.portCode}</div>
              </div>
              {port.unreadAlertCount > 0 && (
                <span className="rounded-full bg-risk-critical px-2 py-0.5 text-[10px] font-bold text-white">
                  {port.unreadAlertCount} alert
                </span>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <ModeBadge mode={port.currentMode} />
              <RiskPill level={port.currentRiskLevel} />
            </div>
            {port.assessmentSummary && (
              <p className="mt-3 line-clamp-2 text-xs text-slate-500">{port.assessmentSummary}</p>
            )}
          </button>
        ))}
      </div>

      {ports.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-slate-500">
          Chưa có cảng nào.
        </div>
      )}
    </div>
  )
}
