import { Link } from 'react-router-dom'
import ModeIndicator from '@/components/dashboard/ModeIndicator'
import RiskBadge from '@/components/dashboard/RiskBadge'
import WeatherCard from '@/components/dashboard/WeatherCard'
import RiskTrendChart from '@/components/charts/RiskTrendChart'
import ZoneCard from '@/components/ports/ZoneCard'
import { useInterval } from '@/hooks/useInterval'
import { RISK_COLORS, RISK_LABELS_VI } from '@/hooks/useRiskColor'
import {
  MOCK_ALERT_STATS,
  MOCK_ASSESSMENT_FACTORS,
  MOCK_MODE,
  MOCK_MODE_SINCE,
  MOCK_PORT_STATUS,
  MOCK_RECENT_TASKS,
  MOCK_RESPONSE_TIME_MIN,
  MOCK_RISK_TREND_24H,
  MOCK_WEATHER,
  MOCK_ZONE_STATUSES,
} from '@/mocks/dashboard.mock'
import type { RiskLevel } from '@/types/port.types'

type Props = {
  subtitle?: string
}

export default function DashboardPage({ subtitle }: Props) {
  const status = MOCK_PORT_STATUS
  const weather = status.weather ?? MOCK_WEATHER

  // TODO Sprint 4: replace mock with GET /api/ports/{id}/status
  useInterval(() => {
    // Polling infrastructure ready — wire API in Sprint 4
  }, 30_000)

  return (
    <div className="space-y-3">
      {subtitle && (
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{subtitle}</div>
      )}

      <div
        className="rounded border px-4 py-2 text-sm font-semibold"
        style={{
          borderColor: `${RISK_COLORS[status.currentRiskLevel]}4d`,
          backgroundColor: `${RISK_COLORS[status.currentRiskLevel]}14`,
          color: '#78350f',
        }}
      >
        Chế độ vận hành: <strong>{MOCK_MODE}</strong> — Beaufort {weather.beaufortNumber} ·{' '}
        {weather.windSpeedMs} m/s
      </div>

      <div className="flex gap-3">
        <div className="flex-[1.6]">
          <WeatherCard weather={weather} />
        </div>
        <RiskBadge
          level={status.currentRiskLevel}
          subtitle={`Beaufort ${weather.beaufortNumber} → ${status.currentRiskLevel}`}
        />
        <ModeIndicator mode={MOCK_MODE} since={MOCK_MODE_SINCE} />
        <div className="flex flex-1 flex-col rounded border border-gray-200 bg-white px-4 py-4 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Thời gian phản hồi
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {MOCK_RESPONSE_TIME_MIN}
            <span className="text-sm font-medium text-slate-600">m</span>
          </div>
          <div className="mt-1 text-xs text-slate-600">Trung bình hôm nay</div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex-[2] rounded border border-gray-200 bg-white p-4">
          <div className="mb-3 text-[11px] font-bold tracking-wide text-slate-600 uppercase">
            Xu hướng rủi ro 24h
          </div>
          <RiskTrendChart data={MOCK_RISK_TREND_24H} />
        </div>

        <div className="flex-[1.4] rounded border border-gray-200 bg-white p-4">
          <div className="mb-3 text-[11px] font-bold tracking-wide text-slate-600 uppercase">
            Trạng thái zones
          </div>
          <div className="grid grid-cols-3 grid-rows-2 gap-2">
            {MOCK_ZONE_STATUSES.map(({ zone }) => (
              <ZoneCard key={zone.id} zone={zone} compact />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex-1 rounded border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[11px] font-bold tracking-wide text-slate-600 uppercase">
              Tasks vận hành gần nhất
            </div>
            <Link to="/logs" className="text-[11px] text-brand hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_RECENT_TASKS.map((task) => (
              <div
                key={task.id}
                className="flex gap-3 border-b border-gray-200 pb-3 last:border-b-0 last:pb-0"
              >
                <div
                  className={[
                    'h-6 w-6 rounded-full border',
                    task.done ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50',
                  ].join(' ')}
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900">{task.title}</div>
                  <div className="text-xs text-slate-400">{task.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 rounded border border-gray-200 bg-white p-4">
          <div className="mb-3 text-[11px] font-bold tracking-wide text-slate-600 uppercase">
            Lý do đánh giá rủi ro
          </div>
          <div className="rounded bg-slate-50 p-3 text-sm leading-7">
            {MOCK_ASSESSMENT_FACTORS.map((factor) => {
              const color = RISK_COLORS[factor.level]
              return (
                <div key={factor.label}>
                  {factor.label}: <strong>{factor.value}</strong> →{' '}
                  <span
                    className="rounded-full border px-2 py-0.5 text-xs font-bold"
                    style={{
                      color,
                      borderColor: `${color}4d`,
                      backgroundColor: `${color}1a`,
                    }}
                  >
                    {RISK_LABELS_VI[factor.level]}
                  </span>
                </div>
              )
            })}
            <hr className="my-2 border-gray-200" />
            Kết quả (MAX):{' '}
            <RiskLevelInline level={status.currentRiskLevel} />
            {status.assessmentSummary && (
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{status.assessmentSummary}</p>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex-1 rounded bg-slate-100 p-2 text-center">
              <div className="text-xs text-slate-400">Cảnh báo hôm nay</div>
              <div className="text-2xl font-bold text-slate-900">{MOCK_ALERT_STATS.today}</div>
            </div>
            <div className="flex-1 rounded bg-red-50 p-2 text-center">
              <div className="text-xs text-risk-critical">Chưa đọc</div>
              <div className="text-2xl font-bold text-risk-critical">{MOCK_ALERT_STATS.unread}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RiskLevelInline({ level }: { level: RiskLevel }) {
  const color = RISK_COLORS[level]
  return (
    <span
      className="rounded-full border px-2 py-0.5 text-xs font-bold"
      style={{ color, borderColor: `${color}4d`, backgroundColor: `${color}1a` }}
    >
      {RISK_LABELS_VI[level]}
    </span>
  )
}
