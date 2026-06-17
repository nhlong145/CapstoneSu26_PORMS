import type { Zone } from '@/types/zone.types'
import { ZONE_TYPE_LABELS } from '@/types/zone.types'
import { RISK_COLORS, RISK_LABELS_VI } from '@/hooks/useRiskColor'

type Props = {
  zone: Zone
  onClick?: () => void
  compact?: boolean
}

export default function ZoneCard({ zone, onClick, compact = false }: Props) {
  const color = RISK_COLORS[zone.currentRiskLevel]

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded border border-slate-200 text-left transition hover:border-brand hover:bg-blue-50',
        compact ? 'px-2.5 py-2' : 'px-3 py-3',
        onClick ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="truncate text-xs font-semibold text-slate-900">{zone.name}</div>
        {zone.hasThresholdOverride && (
          <span className="shrink-0 text-[10px]" title="Có threshold override">
            ⚙️
          </span>
        )}
      </div>
      <div className="mt-1 text-[10px] tracking-widest text-slate-400 uppercase">
        {ZONE_TYPE_LABELS[zone.zoneType]}
      </div>
      <div className="mt-1.5">
        <span
          className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold"
          style={{
            color,
            borderColor: `${color}4d`,
            backgroundColor: `${color}1a`,
          }}
        >
          {RISK_LABELS_VI[zone.currentRiskLevel]}
        </span>
      </div>
      {!compact && zone.capacity != null && (
        <div className="mt-1 text-[10px] text-slate-500">Sức chứa: {zone.capacity}</div>
      )}
    </button>
  )
}
