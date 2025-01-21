import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { LayoutDashboard, Users, FileText, Settings, BookOpen, DollarSign, Star } from "lucide-react"
import { useLocation, Link } from "react-router-dom"
import { X } from "lucide-react"

const adminItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Publishers",
    href: "/admin/manage-publishers",
    icon: Users,
  },
  {
    title: "Content Library",
    href: "/admin/content",
    icon: BookOpen,
  },
  {
    title: "Agreements",
    href: "/admin/agreements",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

const publisherItems = [
  {
    title: "Dashboard",
    href: "/publisher",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Books",
    href: "/publisher/books",
    icon: BookOpen,
  },
  {
    title: "Analytics",
    href: "/publisher/analytics",
    icon: DollarSign,
  },
  {
    title: "Settings",
    href: "/publisher/settings",
    icon: Settings,
  },
]

const authorItems = [
  {
    title: "Dashboard",
    href: "/author",
    icon: LayoutDashboard,
  },
  {
    title: "My Books",
    href: "/author/books",
    icon: BookOpen,
  },
  {
    title: "Reviews",
    href: "/author/reviews",
    icon: Star,
  },
  {
    title: "Settings",
    href: "/author/settings",
    icon: Settings,
  },
]

export function SidebarNav({ isOpen, onClose, userRole }) {
  const location = useLocation()

  const items = userRole === "admin" ? adminItems : userRole === "publisher" ? publisherItems : authorItems

  return (
    <nav
      className={cn(
        "fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r bg-background transition-all duration-300 ease-in-out md:sticky",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
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
            {items.map((item) => (
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

