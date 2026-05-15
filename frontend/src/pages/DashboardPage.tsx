export default function DashboardPage() {
  return (
    <div className="space-y-3">
      {/* Mode banner */}
      <div className="rounded border border-risk-medium/30 bg-risk-medium/10 px-4 py-2 text-sm font-semibold text-amber-900">
        Chế độ vận hành: <strong>HẠN CHẾ (LIMITED)</strong> — Hiệu lực từ 14:32 hôm nay · Beaufort 7 · 14.2 m/s
      </div>

      {/* Row 1: KPIs */}
      <div className="flex gap-3">
        <div className="flex-[1.6] rounded border border-gray-200 bg-white px-4 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Thời tiết hiện tại</div>
          <div className="mt-3 flex items-center gap-4">
            <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-brand to-sky-400 flex items-center justify-center text-2xl">
              🌬️
            </div>
            <div className="min-w-0">
              <div className="text-[17px] font-bold text-slate-900">Gió cấp 7 — 14.2 m/s</div>
              <div className="mt-1 text-xs text-slate-600">
                Mưa: 12 mm/h · Tầm nhìn: 7.5 km · Độ ẩm: 87%
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Cập nhật lúc 14:32 · Nguồn: OpenWeatherMap</div>
            </div>
          </div>
        </div>

        <div className="flex-1 rounded border border-gray-200 bg-white px-4 py-4 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Mức rủi ro</div>
          <div className="my-3 inline-flex rounded-full border border-risk-medium/30 bg-risk-medium/10 px-5 py-2 text-base font-bold text-risk-medium">
            MEDIUM
          </div>
          <div className="text-xs text-slate-600">Beaufort 7 → MEDIUM</div>
        </div>

        <div className="flex-1 rounded border border-gray-200 bg-white px-4 py-4 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Chế độ vận hành</div>
          <div className="my-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-5 py-2 text-base font-bold text-amber-700">
            LIMITED
          </div>
          <div className="text-xs text-slate-600">Từ 14:32 (2 giờ trước)</div>
        </div>

        <div className="flex-1 rounded border border-gray-200 bg-white px-4 py-4 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Thời gian phản hồi</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            4.2<span className="text-sm font-medium text-slate-600">m</span>
          </div>
          <div className="mt-1 text-xs text-slate-600">Trung bình hôm nay</div>
        </div>
      </div>

      {/* Row 2: Chart placeholder + Zones */}
      <div className="flex gap-3 items-start">
        <div className="flex-[2] rounded border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Xu hướng rủi ro 24h</div>
            <div className="flex gap-2">
              <span className="h-7 px-3 rounded-full text-[11px] font-medium border border-brand bg-blue-50 text-brand flex items-center">
                24h
              </span>
              <span className="h-7 px-3 rounded-full text-[11px] font-medium border border-gray-200 bg-white text-slate-600 flex items-center">
                7 ngày
              </span>
              <span className="h-7 px-3 rounded-full text-[11px] font-medium border border-gray-200 bg-white text-slate-600 flex items-center">
                30 ngày
              </span>
            </div>
          </div>
          <div className="h-40 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-sm text-slate-500">
            Chart.js placeholder (Sprint 1)
          </div>
        </div>

        <div className="flex-[1.4] rounded border border-gray-200 bg-white p-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-600 mb-3">Trạng thái zones</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Dock A', risk: 'MEDIUM' },
              { name: 'Dock B', risk: 'MEDIUM' },
              { name: 'Yard A', risk: 'LOW' },
              { name: 'Yard B', risk: 'LOW' },
              { name: 'Gate 1', risk: 'LOW' },
              { name: 'Kho CFS', risk: 'LOW' },
            ].map((z) => (
              <div
                key={z.name}
                className="rounded border border-slate-200 px-2.5 py-2 hover:border-brand hover:bg-blue-50 transition cursor-pointer"
              >
                <div className="text-xs font-semibold text-slate-900">{z.name}</div>
                <div className="mt-1 text-[10px]">
                  <span
                    className={[
                      'inline-flex rounded-full border px-2 py-0.5 font-bold',
                      z.risk === 'MEDIUM'
                        ? 'border-risk-medium/30 bg-risk-medium/10 text-risk-medium'
                        : 'border-risk-low/30 bg-risk-low/10 text-risk-low',
                    ].join(' ')}
                  >
                    {z.risk}
                  </span>
                </div>
                <div className="mt-1 text-[10px] tracking-widest text-slate-400 uppercase">ZONE</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Tasks + Assessment */}
      <div className="flex gap-3 items-start">
        <div className="flex-1 rounded border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Tasks vận hành gần nhất</div>
            <span className="text-[11px] text-brand cursor-pointer hover:underline">Xem tất cả →</span>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Hạn chế thiết bị nâng cao >15m tại Dock A', meta: '14:32 · SOP MEDIUM-002 · Hệ thống' },
              { title: 'Kiểm tra neo buộc tàu tại Dock B', meta: '14:32 · SOP MEDIUM-003 · Hệ thống' },
              { title: 'Tăng tần suất giám sát khắp cảng', meta: '14:32 · SOP MEDIUM-001 · Hệ thống' },
            ].map((t) => (
              <div key={t.title} className="flex gap-3 border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                <div className="h-6 w-6 rounded-full border border-slate-200 bg-slate-50" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900">{t.title}</div>
                  <div className="text-xs text-slate-400">{t.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 rounded border border-gray-200 bg-white p-4">
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-600 mb-3">Lý do đánh giá rủi ro</div>
          <div className="rounded bg-slate-50 p-3 text-sm leading-7">
            Gió: <strong>14.2 m/s</strong> (Beaufort 7) →{' '}
            <span className="rounded-full border border-risk-medium/30 bg-risk-medium/10 px-2 py-0.5 text-xs font-bold text-risk-medium">
              MEDIUM
            </span>
            <br />
            Mưa: <strong>12 mm/h</strong> →{' '}
            <span className="rounded-full border border-risk-medium/30 bg-risk-medium/10 px-2 py-0.5 text-xs font-bold text-risk-medium">
              MEDIUM
            </span>
            <br />
            Tầm nhìn: <strong>7.5 km</strong> →{' '}
            <span className="rounded-full border border-risk-low/30 bg-risk-low/10 px-2 py-0.5 text-xs font-bold text-risk-low">
              LOW
            </span>
            <hr className="my-2 border-gray-200" />
            Kết quả (MAX):{' '}
            <span className="rounded-full border border-risk-medium/30 bg-risk-medium/10 px-2 py-0.5 text-xs font-bold text-risk-medium">
              MEDIUM
            </span>
            &nbsp;· Chế độ →{' '}
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
              LIMITED
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex-1 rounded bg-slate-100 p-2 text-center">
              <div className="text-xs text-slate-400">Cảnh báo hôm nay</div>
              <div className="text-2xl font-bold text-slate-900">12</div>
            </div>
            <div className="flex-1 rounded bg-red-50 p-2 text-center">
              <div className="text-xs text-risk-critical">Chưa đọc</div>
              <div className="text-2xl font-bold text-risk-critical">3</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}