import Sidebar from './Sidebar'
import Navbar from './Navbar'
import type { ReactNode } from 'react'

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}