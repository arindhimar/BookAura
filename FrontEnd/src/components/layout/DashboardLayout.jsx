import { useState } from "react"
import { SidebarNav } from "./SidebarNav"
import { Header } from "./Header"

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  const onMenuClick = () => setSidebarOpen(!isSidebarOpen)
  const onClose = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header isSidebarOpen={isSidebarOpen} onMenuClick={onMenuClick} />
      <div className="flex">
        <SidebarNav isOpen={isSidebarOpen} onClose={onClose} />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

