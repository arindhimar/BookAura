import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { LayoutDashboard, Users, FileText, Settings, BookOpen, X } from 'lucide-react'
import { useLocation, Link } from "react-router-dom"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Publishers",
    href: "/dashboard/publishers",
    icon: Users,
  },
  {
    title: "Content Library",
    href: "/dashboard/content",
    icon: BookOpen,
  },
  {
    title: "Agreements",
    href: "/dashboard/agreements",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function SidebarNav({ isOpen, onClose }) {
  const location = useLocation()

  return (
    <nav
      className={cn(
        "fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r bg-background transition-all duration-300 ease-in-out md:sticky",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex justify-between items-center p-4 md:hidden">
        <img src="/bookaura-logo.png" alt="BookAura Logo" className="h-8 w-auto" />
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Button
                key={item.href}
                variant={location.pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link to={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

