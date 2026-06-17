import type { OperationMode } from '@/types/port.types'
import { MODE_COLORS, MODE_LABELS_VI } from '@/hooks/useRiskColor'
import { formatDurationFrom, formatTimeVi } from '@/utils/dateFormatter'

type Props = {
  mode: OperationMode
  since: string
}

export default function ModeIndicator({ mode, since }: Props) {
  const color = MODE_COLORS[mode]
  const sinceTime = formatTimeVi(since)
  const duration = formatDurationFrom(since)

  return (
    <div className="flex flex-1 flex-col rounded border border-gray-200 bg-white px-4 py-4 text-center">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Chế độ vận hành
      </div>
      <div
        className="my-3 inline-flex self-center rounded-full border px-5 py-2 text-base font-bold transition-colors duration-500"
        style={{
          color,
          borderColor: `${color}4d`,
          backgroundColor: `${color}1a`,
        }}
      >
        {MODE_LABELS_VI[mode]}
      </div>
      <div className="text-xs text-slate-600">
        {MODE_LABELS_VI[mode]} từ {sinceTime} hôm nay ({duration})
      </div>
    </div>
  )
}
