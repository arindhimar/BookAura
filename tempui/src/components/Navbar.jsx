import { Search, ShoppingCart, User } from "lucide-react"

function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-amber-900">BookWorm</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-amber-900 hover:text-amber-700">
              HOME
            </a>
            <a href="#" className="text-amber-900 hover:text-amber-700">
              WRITERS
            </a>
            <a href="#" className="text-amber-900 hover:text-amber-700">
              PUBLISHERS
            </a>
            <a href="#" className="text-amber-900 hover:text-amber-700">
              BLOG
            </a>
            <a href="#" className="text-amber-900 hover:text-amber-700">
              CONTACT
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Search className="h-5 w-5 text-amber-900" />
            <ShoppingCart className="h-5 w-5 text-amber-900" />
            <User className="h-5 w-5 text-amber-900" />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

