import type { WeatherSnapshot } from '@/types/port.types'
import { formatTimeAgo, isOlderThanMinutes } from '@/utils/dateFormatter'

type Props = {
  weather: WeatherSnapshot
}

export default function WeatherCard({ weather }: Props) {
  const stale = isOlderThanMinutes(weather.observedAt, 20)
  const iconUrl = weather.owWeatherIcon
    ? `https://openweathermap.org/img/wn/${weather.owWeatherIcon}@2x.png`
    : null

  return (
    <div className="rounded border border-gray-200 bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Thời tiết hiện tại
        </div>
        {stale && (
          <span className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            Dữ liệu cũ (&gt;20 phút)
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-brand to-sky-400">
          {iconUrl ? (
            <img src={iconUrl} alt={weather.owWeatherDesc ?? 'Weather'} className="h-12 w-12" />
          ) : (
            <span className="text-2xl">🌬️</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-[17px] font-bold text-slate-900">
            Gió cấp {weather.beaufortNumber} — {weather.windSpeedMs} m/s
          </div>
          <div className="mt-1 text-xs text-slate-600">
            Mưa: {weather.rainfall1hMm ?? '—'} mm/h · Tầm nhìn: {weather.visibilityKm ?? '—'} km · Độ
            ẩm: {weather.humidityPct ?? '—'}%
            {weather.temperatureC != null && <> · Nhiệt độ: {weather.temperatureC}°C</>}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Cập nhật {formatTimeAgo(weather.observedAt)} · Nguồn: OpenWeatherMap
          </div>
        </div>
      </div>
    </div>
  )
}
