"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Sidebar from "../components/Sidebar"
import BookShelf from "../components/BookShelf"

const CURRENTLY_READING = [
  {
    id: "1",
    title: "The Man and the Mountain",
    author: "Unknown",
    coverUrl: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=600",
  },
  {
    id: "2",
    title: "Web Development",
    author: "Unknown",
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600",
  },
  {
    id: "3",
    title: "Strategic Writing for UX",
    author: "Torrey Podmajersky",
    coverUrl: "/placeholder.svg?height=300&width=200",
  },
]

const NEXT_UP = [
  {
    id: "4",
    title: "Lietuvos Pauksciai",
    author: "Unknown",
    coverUrl: "/placeholder.svg?height=300&width=200",
  },
  {
    id: "5",
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    coverUrl: "/placeholder.svg?height=300&width=200",
  },
  {
    id: "6",
    title: "The Kids World",
    author: "Unknown",
    coverUrl: "/placeholder.svg?height=300&width=200",
  },
  {
    id: "7",
    title: "Art Book",
    author: "Unknown",
    coverUrl: "/placeholder.svg?height=300&width=200",
  },
  {
    id: "8",
    title: "1984",
    author: "George Orwell",
    coverUrl: "/placeholder.svg?height=300&width=200",
  },
  {
    id: "9",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    coverUrl: "/placeholder.svg?height=300&width=200",
  },
]

const FINISHED = [
  {
    id: "10",
    title: "Steve Jobs",
    author: "Walter Isaacson",
    coverUrl: "/placeholder.svg?height=300&width=200",
  },
  {
    id: "11",
    title: "Professional Growth",
    author: "Unknown",
    coverUrl: "/placeholder.svg?height=300&width=200",
  },
  {
    id: "12",
    title: "One Year in a Minute",
    author: "Unknown",
    coverUrl: "/placeholder.svg?height=300&width=200",
  },
  {
    id: "13",
    title: "101 Amazing Facts",
    author: "Unknown",
    coverUrl: "/placeholder.svg?height=300&width=200",
  },
  {
    id: "14",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    coverUrl: "/placeholder.svg?height=300&width=200",
  },
  {
    id: "15",
    title: "Logo Design Love",
    author: "Unknown",
    coverUrl: "/placeholder.svg?height=300&width=200",
  },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState("shelves")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <div className="min-h-screen bg-[#FAF6F3]">
      <Sidebar />

      <motion.main
        className="lg:pl-64 p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header with search and tabs */}
          <motion.div
            className="flex items-center space-x-4 mb-12"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div className="flex bg-white rounded-lg shadow-sm overflow-hidden" whileHover={{ scale: 1.02 }}>
              <AnimatePresence mode="wait">
                <motion.button
                  key={`tab-${activeTab === "shelves"}`}
                  onClick={() => setActiveTab("shelves")}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors relative ${
                    activeTab === "shelves" ? "text-[#8B6E4F] font-medium" : "text-[#8B6E4F] hover:bg-[#F6F2EE]"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  Shelves
                  {activeTab === "shelves" && (
                    <motion.div
                      className="absolute inset-0 bg-[#F6F2EE] rounded-lg -z-10"
                      layoutId="activeTab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </motion.button>
                <motion.button
                  key={`tab-${activeTab === "all-books"}`}
                  onClick={() => setActiveTab("all-books")}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors relative ${
                    activeTab === "all-books" ? "text-[#8B6E4F] font-medium" : "text-[#8B6E4F] hover:bg-[#F6F2EE]"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  All Books
                  {activeTab === "all-books" && (
                    <motion.div
                      className="absolute inset-0 bg-[#F6F2EE] rounded-lg -z-10"
                      layoutId="activeTab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </motion.button>
              </AnimatePresence>
            </motion.div>

            <motion.div
              className="flex-1 relative"
              animate={{
                scale: searchFocused ? 1.02 : 1,
                transition: { duration: 0.2 },
              }}
            >
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                  searchFocused ? "text-[#6D563D]" : "text-[#8B6E4F]"
                }`}
              />
              <input
                type="text"
                placeholder="Search in My library"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-10 pr-4 py-2 bg-white border-none rounded-lg shadow-sm
                         text-[#8B6E4F] placeholder-[#8B6E4F] text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#E5D5C5]
                         transition-all duration-200"
              />
            </motion.div>
          </motion.div>

          {/* Book Shelves */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="space-y-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BookShelf
                title="Currently reading"
                books={CURRENTLY_READING}
                onViewAll={() => console.log("View all currently reading")}
              />
              <BookShelf title="Next up" books={NEXT_UP} onViewAll={() => console.log("View all next up")} />
              <BookShelf title="Finished" books={FINISHED} onViewAll={() => console.log("View all finished")} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  )
}

