import type { RiskLevel } from '@/types/port.types'
import { RISK_COLORS, RISK_LABELS_VI } from '@/hooks/useRiskColor'

type Props = {
  level: RiskLevel
  summary?: string | null
  subtitle?: string
}

export default function RiskBadge({ level, summary, subtitle }: Props) {
  const color = RISK_COLORS[level]
  const isCritical = level === 'CRITICAL'

  return (
    <div className="flex flex-1 flex-col rounded border border-gray-200 bg-white px-4 py-4 text-center">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Mức rủi ro</div>
      <div
        className={[
          'my-3 inline-flex self-center rounded-full border px-5 py-2 text-base font-bold transition-all duration-500',
          isCritical ? 'risk-critical-pulse' : '',
        ].join(' ')}
        style={{
          color,
          borderColor: `${color}4d`,
          backgroundColor: `${color}1a`,
        }}
      >
        {RISK_LABELS_VI[level]}
      </div>
      {subtitle && <div className="text-xs text-slate-600">{subtitle}</div>}
      {summary && <p className="mt-2 text-xs leading-relaxed text-slate-500">{summary}</p>}
    </div>
  )
}
