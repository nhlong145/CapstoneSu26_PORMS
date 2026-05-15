export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-54px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand text-white flex items-center justify-center font-extrabold">
            P
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">PORMS</div>
            <div className="text-xs text-slate-500">Hệ thống Cảnh báo Rủi ro Vận hành Cảng</div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Email</label>
            <input className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Password</label>
            <input
              type="password"
              className="mt-1 h-9 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-brand"
            />
          </div>
          <button
            className="mt-2 h-9 w-full rounded bg-brand text-white font-semibold hover:brightness-95"
            onClick={() => alert('Login (placeholder)')}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}