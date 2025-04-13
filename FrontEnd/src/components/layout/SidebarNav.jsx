import { title } from "process"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { LayoutDashboard, Users, FileText, Settings, BookOpen, DollarSign, Star, X ,Book} from "lucide-react"
import { useLocation, Link } from "react-router-dom"

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
    title: "Manage Categories",
    href: "/admin/manage-categories",
    icon: BookOpen,
  },
  {
    title: "Agreements",
    href: "/admin/agreements",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

const moderatorItems = [
  {
    title: "Dashboard",
    href: "/moderator",
    icon: LayoutDashboard,
  },
  {
    title: "Pending Reviews",
    href: "/moderator/pending-reviews",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/settings",
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
    href: "/publisher/manage-books",
    icon: BookOpen,
  },
  {
    title: "Analytics",
    href: "/publisher/analytics",
    icon: DollarSign,
  },
  {
    title: "Settings",
    href: "/settings",
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
    href: "/settings",
    icon: Settings,
  },
]

export function SidebarNav({ isOpen, onClose, userRole }) {
  const location = useLocation()

  const items = userRole === "admin" ? adminItems : userRole === "publisher" ? publisherItems : authorItems ? moderatorItems : authorItems

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Book className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-semibold text-gray-800 dark:text-white">BookAura</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
          <X className="h-6 w-6" />
        </Button>
      </div>
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {items.map((item) => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link to={item.href}>
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  )
}

