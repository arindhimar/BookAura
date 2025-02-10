"use client"

import { useState } from "react"
import { User, Heart, Bookmark, Users, Bell, Lock, LogOut, ChevronRight } from "lucide-react"

const sidebarItems = [
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Heart, label: "Liked Books", path: "/profile/liked" },
  { icon: Bookmark, label: "Favorites", path: "/profile/favorites" },
  { icon: Users, label: "Following", path: "/profile/following" },
  { icon: Bell, label: "Notifications", path: "/profile/notifications" },
  { icon: Lock, label: "Change Password", path: "/profile/password" },
  { icon: LogOut, label: "Logout", path: "/logout" },
]

const ProfileLayout = ({ children }) => {
  const [activePath, setActivePath] = useState("/profile")

  return (
    <div className="flex min-h-screen bg-[#FAF7F4]">
      <aside className="w-64 border-r border-neutral-200 bg-white">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-neutral-800">Settings</h2>
        </div>
        <nav className="space-y-1 p-2">
          {sidebarItems.map((item) => (
            <button
              key={item.path}
              onClick={() => setActivePath(item.path)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                activePath === item.path
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}

export default ProfileLayout

