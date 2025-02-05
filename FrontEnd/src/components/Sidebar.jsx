import { useState } from "react"
import { Home, Library, ShoppingBag, MessageSquare, Menu, X } from "lucide-react"
import PropTypes from "prop-types"
import { motion, AnimatePresence } from "framer-motion"

const Sidebar = ({ activeSection, onSectionChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "library", icon: Library, label: "My library" },
    { id: "shop", icon: ShoppingBag, label: "Shop" },
    { id: "news", icon: MessageSquare, label: "News" },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed left-0 top-0 h-screen bg-[#FAF6F1] border-r 
                  border-[#E5D5C5] flex flex-col z-50 w-64
                  lg:translate-x-0 transition-transform duration-300
                  ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        initial={false}
      >
        {/* Logo */}
        <div className="p-6">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1kq7NeghJEvU6r2Q9oT5XUfKm4MWvq.png"
            alt="Readowl"
            className="h-8"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id)
                  setIsOpen(false) // Close sidebar on mobile after selection
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
                         transition-all relative group ${
                           activeSection === item.id
                             ? "bg-[#E5D5C5] text-[#6D563D]"
                             : "text-[#8B6E4F] hover:bg-[#E5D5C5]/50"
                         }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`h-5 w-5 ${activeSection === item.id ? "text-[#6D563D]" : ""}`} />
                <span className="font-medium">{item.label}</span>

                {/* Active indicator */}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-full bg-[#6D563D] rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.button>
            )
          })}
        </nav>

        {/* Continue reading section */}
        <div className="p-4 mx-4 mb-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-[#6D563D] mb-3">Continue reading</h3>
          <div className="relative aspect-[3/4] mb-3">
            <img
              src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e"
              alt="Current book"
              className="w-full h-full object-cover rounded-md shadow-md"
            />
          </div>
          <div className="text-sm text-[#8B6E4F]">
            <p className="font-medium">1984</p>
            <p className="text-xs mt-1">Page 145 of 328</p>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-[#E5D5C5]">
          <motion.div
            className="flex items-center space-x-3 p-2 hover:bg-[#E5D5C5]/50 rounded-lg 
                     transition-colors cursor-pointer"
            whileHover={{ x: 4 }}
          >
            <img
              src="/placeholder.svg?height=32&width=32"
              alt="User"
              className="w-8 h-8 rounded-full border border-[#E5D5C5]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#6D563D] truncate">Stephan</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  )
}

Sidebar.propTypes = {
  activeSection: PropTypes.string.isRequired,
  onSectionChange: PropTypes.func.isRequired,
}

export default Sidebar

