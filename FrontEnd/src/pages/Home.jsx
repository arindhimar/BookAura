import { useState } from "react"
import { Search } from "lucide-react"
import { motion } from "framer-motion"
import Sidebar from "../components/Sidebar"
import BookShelf from "../components/BookShelf"

const SAMPLE_BOOKS = [
  {
    id: "1",
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    coverUrl: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=600",
    progress: 75,
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600",
    progress: 30,
  },
  // Add more sample books as needed
]

export default function Home() {
  const [activeSection, setActiveSection] = useState("library")
  const [activeTab, setActiveTab] = useState("shelves")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="lg:pl-64 p-4 lg:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header with search and tabs */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => setActiveTab("shelves")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "shelves" ? "bg-[#E5D5C5] text-[#6D563D]" : "text-[#8B6E4F] hover:bg-[#E5D5C5]/50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Shelves
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab("all-books")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "all-books" ? "bg-[#E5D5C5] text-[#6D563D]" : "text-[#8B6E4F] hover:bg-[#E5D5C5]/50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  All Books
                </motion.button>
              </div>

              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search in My library"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-[#E5D5C5] 
                           focus:outline-none focus:ring-2 focus:ring-[#E5D5C5] 
                           text-[#6D563D] placeholder-[#8B6E4F]"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B6E4F]" />
              </div>
            </div>
          </div>

          {/* Book Shelves */}
          <div className="space-y-16">
            <BookShelf
              title="Currently reading"
              books={SAMPLE_BOOKS}
              onViewAll={() => console.log("View all currently reading")}
            />
            <BookShelf title="Next up" books={SAMPLE_BOOKS} onViewAll={() => console.log("View all next up")} />
            <BookShelf title="Finished" books={SAMPLE_BOOKS} onViewAll={() => console.log("View all finished")} />
          </div>
        </div>
      </main>
    </div>
  )
}

