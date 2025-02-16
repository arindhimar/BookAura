import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Sidebar from "../../components/Sidebar"
import BookShelf from "../../components/BookShelf"

export default function Home() {
  const [activeTab, setActiveTab] = useState("shelves")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)
  const [books, setBooks] = useState({
    currentlyReading: [],
    nextUp: [],
    finished: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/`)
        if (!response.ok) throw new Error("Failed to fetch books")

        const data = await response.json()
        console.log(data)
        setBooks({ currentlyReading: data, nextUp: data, finished: data })
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooks()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Sidebar />

      <main className="lg:pl-[280px] min-h-screen transition-all duration-300">
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Tabs */}
              <motion.div
                className="flex bg-white rounded-full shadow-lg p-1"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="wait">
                  {["shelves", "all-books"].map((tab) => (
                    <motion.button
                      key={`tab-${tab}`}
                      onClick={() => setActiveTab(tab)}
                      className={`relative px-6 py-2 text-sm font-medium rounded-full transition-colors ${
                        activeTab === tab ? "text-white" : "text-gray-600"
                      } hover:text-indigo-600`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {tab === "shelves" ? "Shelves" : "All Books"}
                      {activeTab === tab && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full -z-10"
                          layoutId="activeTab"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Search */}
              <motion.div
                className="relative flex-1 sm:max-w-md"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                    searchFocused ? "text-indigo-600" : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search your favorite books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-9 pr-9 py-2 bg-white border-2 border-transparent rounded-full shadow-lg
                           text-gray-800 placeholder-gray-400 text-sm
                           focus:outline-none focus:border-indigo-500
                           transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full
                             hover:bg-gray-100 text-gray-400"
                    title="Clear search"
                  >
                    <X className="h-3 w-3 transition-all duration-200" />
                  </button>
                )}
              </motion.div>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center h-64"
              >
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-red-500"
              >
                {error}
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                className="space-y-12 sm:space-y-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BookShelf
                  title="Currently Reading"
                  books={books.currentlyReading || []}
                  onViewAll={() => console.log("View all currently reading")}
                />
                <BookShelf
                  title="Next Up"
                  books={books.nextUp || []}
                  onViewAll={() => console.log("View all next up")}
                />
                <BookShelf
                  title="Finished"
                  books={books.finished || []}
                  onViewAll={() => console.log("View all finished")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

