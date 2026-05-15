export default function AlertPage() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        {[
          { n: '12', l: 'Tổng hôm nay' },
          { n: '3', l: 'Chưa đọc', danger: true },
          { n: '1', l: 'CRITICAL', danger: true },
          { n: '4.2m', l: 'T.gian p.hồi TB' },
        ].map((x) => (
          <div key={x.l} className="rounded border border-gray-200 bg-white p-3 text-center">
            <div className={['text-2xl font-bold', x.danger ? 'text-risk-critical' : 'text-slate-900'].join(' ')}>
              {x.n}
            </div>
            <div className="mt-1 text-xs text-slate-400">{x.l}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select className="h-8 rounded border border-gray-200 bg-white px-2 text-sm text-slate-600">
          <option>Severity: Tất cả</option>
          <option>CRITICAL</option>
          <option>HIGH</option>
          <option>WARNING</option>
          <option>INFO</option>
        </select>
        <select className="h-8 rounded border border-gray-200 bg-white px-2 text-sm text-slate-600">
          <option>Loại: Tất cả</option>
          <option>RISK_LEVEL_CHANGED</option>
          <option>MODE_CHANGED</option>
          <option>SOP_EXECUTED</option>
          <option>RECOVERY_READY</option>
        </select>
        <input
          className="h-8 min-w-48 flex-1 rounded border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand"
          placeholder="🔍  Tìm kiếm alert..."
        />
        <button className="h-8 rounded-full border border-brand bg-blue-50 px-3 text-[11px] font-medium text-brand">
          Chưa đọc (3)
        </button>
        <button className="h-8 rounded-full border border-gray-200 bg-white px-3 text-[11px] font-medium text-slate-600">
          Tất cả (12)
        </button>
        <button className="h-8 rounded border border-gray-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50">
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="rounded border border-gray-200 bg-white overflow-hidden">
        {[
          {
            sev: 'CRITICAL',
            type: 'RISK_LEVEL_CHANGED',
            time: '14:47 hôm nay',
            title: '🚨 Gió HIGH — Dừng bốc xếp container Dock A',
            desc: 'Gió cấp 8 (17.5 m/s) vượt ngưỡng HIGH. Hệ thống đã tự động dừng bốc xếp. Hạ boom crane về vị trí an toàn.',
            critical: true,
            unread: true,
          },
          {
            sev: 'WARNING',
            type: 'MODE_CHANGED',
            time: '14:32 hôm nay',
            title: '⚠️ Cảng chuyển sang chế độ HẠN CHẾ — Gió cấp 7',
            desc: 'Chế độ vận hành chuyển từ NORMAL → LIMITED. Kiểm tra thiết bị và tăng cường neo buộc.',
            unread: true,
          },
          {
            sev: 'INFO',
            type: 'RECOVERY_READY',
            time: '13:10 hôm nay',
            title: '✅ Thời tiết về LOW — Khởi động kiểm tra phục hồi',
            desc: 'Cần hoàn thành 6 hạng mục kiểm tra trước khi khôi phục hoạt động bình thường.',
            read: true,
          },
        ].map((a) => (
          <div
            key={`${a.type}-${a.time}`}
            className={[
              'flex gap-3 px-4 py-3 border-b border-gray-200 last:border-b-0',
              a.unread ? (a.critical ? 'border-l-4 border-l-risk-critical bg-red-50/30' : 'border-l-4 border-l-amber-400 bg-amber-50/30') : '',
              a.read ? 'opacity-70' : '',
            ].join(' ')}
          >
            <div
              className={[
                'mt-1 h-2 w-2 rounded-full',
                a.critical ? 'bg-risk-critical' : a.sev === 'WARNING' ? 'bg-amber-500' : 'bg-risk-low',
              ].join(' ')}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      'rounded-full border px-2 py-0.5 text-[11px] font-bold',
                      a.critical
                        ? 'border-risk-critical/30 bg-risk-critical/10 text-risk-critical'
                        : a.sev === 'WARNING'
                          ? 'border-risk-medium/30 bg-risk-medium/10 text-risk-medium'
                          : 'border-risk-low/30 bg-risk-low/10 text-risk-low',
                    ].join(' ')}
                  >
                    {a.sev}
                  </span>
                  <span className="text-[10px] text-slate-400">{a.type}</span>
                </div>
                <span className="text-xs text-slate-400">{a.time}</span>
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{a.title}</div>
              <div className="mt-1 text-sm text-slate-600 leading-6">{a.desc}</div>
              {!a.read && (
                <div className="mt-2 flex gap-2">
                  <button className="h-7 rounded border border-gray-200 bg-white px-3 text-xs text-slate-600 hover:bg-slate-50">
                    Xem chi tiết
                  </button>
                  <button className="h-7 rounded border border-brand bg-brand px-3 text-xs font-medium text-white">
                    Đánh dấu đã đọc
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between bg-slate-50 px-4 py-2 border-t border-gray-200">
          <span className="text-xs text-slate-600">Hiển thị 3 / 12 alerts</span>
          <button className="h-8 rounded border border-gray-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50">
            Xem thêm
          </button>
        </div>
      </div>
    </div>
  )
}