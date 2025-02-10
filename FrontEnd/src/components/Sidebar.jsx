"\"use client"

import { useState } from "react"
import { Home, Library, ShoppingBag, MessageSquare, Menu, X, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { Book } from "lucide-react"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("library")

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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5 text-[#6D563D]" /> : <Menu className="h-5 w-5 text-[#6D563D]" />}
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
      <motion.aside
        className={`fixed left-0 top-0 h-screen w-[280px] bg-gray-50 z-50 
                   lg:translate-x-0 transition-transform duration-300 ease-in-out
                   border-r border-gray-200 flex flex-col
                   ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        initial={false}
      >
        {/* Logo section */}
        <div className=" ml-10 px-4 py-5 flex items-center">
          {/* <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1kq7NeghJEvU6r2Q9oT5XUfKm4MWvq.png"
            alt="Readowl"
            className="h-8"
          /> */}
          <motion.div
            whileHover={{ rotate: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Book className="h-8 w-8 text-blue-500" />
          </motion.div>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">
            BookAura
          </span>

        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                       transition-all relative group mb-1
                       ${activeSection === item.id ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className={`h-5 w-5 ${activeSection === item.id ? "text-indigo-700" : ""}`} />
              <span className="font-medium">{item.label}</span>
              {activeSection === item.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 w-1 h-full bg-indigo-600 rounded-r-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Continue reading section */}
        <div className="px-4 pb-4">
          <motion.div
            className="p-4 bg-white rounded-xl shadow-sm border border-gray-200"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-sm font-medium text-gray-700 mb-3">Continue reading</h3>
            <div className="relative aspect-[3/4] mb-3 rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e"
                alt="Current book"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Web Development</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Page 145 of 328</span>
                <span>44% complete</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "44%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <motion.button
            className="flex items-center w-full p-2 rounded-xl hover:bg-gray-100 transition-colors"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <img src="/placeholder.svg?height=32&width=32" alt="User avatar" className="w-8 h-8 rounded-full" />
            <div className="ml-3 flex-1 text-left">
              <p className="text-sm font-medium text-gray-700">Stephan</p>
              <p className="text-xs text-gray-500">Free Plan</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </motion.button>
        </div>
      </motion.aside>
    </>
  )
}

