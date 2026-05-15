export default function AdminPage() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="h-8 min-w-52 flex-1 rounded border border-gray-200 bg-white px-3 text-sm outline-none focus:border-brand"
          placeholder="🔍  Tìm người dùng..."
        />
        <select className="h-8 rounded border border-gray-200 bg-white px-2 text-sm text-slate-600">
          <option>Role: Tất cả</option>
          <option>PORT_OPERATOR</option>
          <option>COMPANY_ADMIN</option>
          <option>VIEWER</option>
        </select>
        <button className="h-8 rounded border border-brand bg-brand px-3 text-sm font-medium text-white">
          Thêm người dùng
        </button>
      </div>

      <div className="rounded border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs text-slate-600">
              <th className="px-4 py-2 text-left font-semibold">Họ tên</th>
              <th className="px-4 py-2 text-left font-semibold">Email</th>
              <th className="px-4 py-2 text-left font-semibold">Role</th>
              <th className="px-4 py-2 text-left font-semibold">Port</th>
              <th className="px-4 py-2 text-left font-semibold">Trạng thái</th>
              <th className="px-4 py-2 text-left font-semibold">Đăng nhập gần nhất</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Nguyễn Văn Hùng', email: 'hung@example.com', role: 'PORT_OPERATOR', port: 'Tiên Sa', last: 'Vừa xong' },
              { name: 'Trần Thị Lan', email: 'lan@example.com', role: 'COMPANY_ADMIN', port: 'Tất cả', last: '15:30 hôm nay' },
              { name: 'Phạm Minh Đức', email: 'duc@example.com', role: 'PORT_OPERATOR', port: 'Tiên Sa', last: '13:20 hôm nay' },
            ].map((u, idx) => (
              <tr key={u.email} className={['border-t border-gray-200', idx % 2 ? 'bg-slate-50/40' : ''].join(' ')}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold">
                      {u.name
                        .split(' ')
                        .slice(-2)
                        .map((x) => x[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div className="font-semibold text-slate-900">{u.name}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-gray-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-700">{u.port}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-risk-low/30 bg-risk-low/10 px-2 py-0.5 text-[10px] font-bold text-risk-low">
                    Active
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{u.last}</td>
                <td className="px-4 py-3 text-right">
                  <button className="h-7 w-7 rounded border border-gray-200 bg-white text-slate-600 hover:bg-slate-50">
                    ✎
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}