import { useState, useEffect } from "react"
import { SidebarNav } from "./SidebarNav"
import { Header } from "./Header"
// import { useMediaQuery } from "../../hooks/useMediaQuery"

export default function DashboardLayout({ children, userRole }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  // const isDesktop = useMediaQuery("(min-width: 1024px)")

  // useEffect(() => {
  //   setSidebarOpen(isDesktop)
  // }, [isDesktop])

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen)

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <SidebarNav isOpen={isSidebarOpen} onClose={toggleSidebar} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

