export default function LogPage() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        {[
          { n: '248', l: 'Tổng events hôm nay' },
          { n: '231', l: 'Automated', tint: 'text-brand' },
          { n: '17', l: 'Manual (human)' },
          { n: '5', l: 'Risk level changes', tint: 'text-risk-medium' },
        ].map((x) => (
          <div key={x.l} className="rounded border border-gray-200 bg-white p-3 text-center">
            <div className={['text-2xl font-bold text-slate-900', x.tint ?? ''].join(' ')}>{x.n}</div>
            <div className="mt-1 text-xs text-slate-400">{x.l}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select className="h-8 rounded border border-gray-200 bg-white px-2 text-sm text-slate-600">
          <option>Event type: Tất cả</option>
          <option>RISK_LEVEL_CHANGED</option>
          <option>SOP_EXECUTED</option>
          <option>MODE_CHANGED</option>
          <option>WEATHER_FETCHED</option>
          <option>MODE_OVERRIDDEN</option>
        </select>
        <select className="h-8 rounded border border-gray-200 bg-white px-2 text-sm text-slate-600">
          <option>Actor: Tất cả</option>
          <option>System</option>
          <option>Nguyễn V.H</option>
          <option>Trần T.Lan</option>
        </select>
        <input className="h-8 w-40 rounded border border-gray-200 bg-white px-2 text-sm text-slate-600" type="date" />
        <input
          className="h-8 min-w-48 flex-1 rounded border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand"
          placeholder="🔍  Tìm trong payload..."
        />
        <button className="h-8 rounded-full border border-gray-200 bg-white px-3 text-[11px] font-medium text-slate-600">
          Auto only
        </button>
        <button className="h-8 rounded-full border border-gray-200 bg-white px-3 text-[11px] font-medium text-slate-600">
          Manual only
        </button>
        <button className="h-8 rounded border border-gray-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50">
          Export CSV
        </button>
      </div>

      <div className="rounded border border-gray-200 bg-white p-4">
        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-600 mb-3">
          Timeline — mới nhất lên đầu
        </div>

        <div className="space-y-3">
          {[
            {
              type: 'RISK_LEVEL_CHANGED',
              actor: 'System',
              time: '14:47:02',
              title: 'Risk level thay đổi: MEDIUM → HIGH (Beaufort 8, 17.5 m/s)',
              tint: 'bg-red-50 border-red-200 text-risk-critical',
            },
            {
              type: 'SOP_EXECUTED',
              actor: 'System',
              time: '14:47:03',
              title: 'SOP HIGH-001 executed: Dừng bốc xếp Dock A · status=COMPLETED',
              tint: 'bg-orange-50 border-orange-200 text-risk-high',
            },
            {
              type: 'MODE_OVERRIDDEN',
              actor: 'Trần Thị Lan (CA)',
              time: '15:30:11',
              title: 'Manual override: STOP → NORMAL · Lý do: "Đội kiểm tra đã hoàn thành 6 hạng mục an toàn"',
              tint: 'bg-blue-50 border-blue-200 text-brand',
            },
          ].map((e) => (
            <div key={`${e.type}-${e.time}`} className="flex gap-3 border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
              <div className="h-6 w-6 rounded-full border border-gray-200 bg-slate-50" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={['rounded-full border px-2 py-0.5 text-[10px] font-bold', e.tint].join(' ')}>
                      {e.type}
                    </span>
                    <span className="rounded-full border border-gray-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">
                      {e.actor}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 tabular-nums">{e.time}</span>
                </div>
                <div className="mt-1 text-sm font-medium text-slate-900">{e.title}</div>
                <div className="mt-1 text-[11px] text-brand cursor-pointer hover:underline">→ Xem payload JSON đầy đủ</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 mt-3 border-t border-gray-200 text-center">
          <button className="h-8 rounded border border-gray-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50">
            Tải thêm 20 events
          </button>
        </div>
      </div>
    </div>
  )
}