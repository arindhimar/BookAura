"use client"

import { useState } from "react"
import { Home, Library, ShoppingBag, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState("library")
  const [hoveredItem, setHoveredItem] = useState(null)

  const menuItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "library", icon: Library, label: "My library" },
    { id: "shop", icon: ShoppingBag, label: "Shop" },
    { id: "news", icon: MessageSquare, label: "News" },
  ]

  return (
    <motion.div
      className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-[#E5D5C5] flex flex-col"
      initial={{ x: -64 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Logo */}
      <motion.div className="p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1kq7NeghJEvU6r2Q9oT5XUfKm4MWvq.png"
          alt="Readowl"
          className="h-8"
        />
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const isHovered = hoveredItem === item.id
          const isActive = activeSection === item.id

          return (
            <motion.button
              key={item.id}
              onHoverStart={() => setHoveredItem(item.id)}
              onHoverEnd={() => setHoveredItem(null)}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg 
                       text-left mb-1 transition-colors relative ${
                         isActive ? "bg-[#F6F2EE] text-[#8B6E4F]" : "text-[#8B6E4F] hover:bg-[#F6F2EE]"
                       }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`h-5 w-5 transition-transform ${isHovered ? "scale-110" : "scale-100"}`} />
              <span className="text-sm font-medium">{item.label}</span>

              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-full bg-[#8B6E4F] rounded-r-full"
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
      <motion.div
        className="p-4 mx-4 mb-4 bg-[#F6F2EE] rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.02 }}
      >
        <h3 className="text-sm font-medium text-[#8B6E4F] mb-3">Continue reading</h3>
        <motion.div className="relative aspect-[3/4] mb-3" whileHover={{ y: -4 }}>
          <img
            src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e"
            alt="Current book"
            className="w-full h-full object-cover rounded-lg shadow-sm"
          />
        </motion.div>
        <div className="text-sm text-[#8B6E4F]">
          <p className="font-medium">Web Development</p>
          <p className="text-xs mt-1">Page 145 of 328</p>
        </div>
      </motion.div>

      {/* User Profile */}
      <motion.div
        className="p-4 border-t border-[#E5D5C5]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="flex items-center space-x-3 p-2 hover:bg-[#F6F2EE] rounded-lg 
                   transition-colors cursor-pointer"
          whileHover={{ x: 4, backgroundColor: "#F6F2EE" }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.img
            src="/placeholder.svg?height=32&width=32"
            alt="User"
            className="w-8 h-8 rounded-full"
            whileHover={{ scale: 1.1 }}
          />
          <span className="text-sm font-medium text-[#8B6E4F]">Stephan</span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

