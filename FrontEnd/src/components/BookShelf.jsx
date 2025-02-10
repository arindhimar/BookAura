import { ChevronRight } from "lucide-react"
import PropTypes from "prop-types"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const BookShelf = ({ title, books, onViewAll }) => {
  useEffect(() => {
    console.log("Received Books in BookShelf:", title, books)
  })

  const navigate = useNavigate()

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl">{title}</h2>
        <motion.button
          onClick={onViewAll}
          className="flex items-center text-sm text-gray-600 hover:text-indigo-600 group"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="hidden sm:inline">Full shelf</span>
          <span className="sm:hidden">View all</span>
          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      <div className="relative">
        {/* Shelf background */}
        <div className="relative bg-[#f0e7db] rounded-xl shadow-md overflow-hidden">
          {/* Books container */}
          <div className="relative px-6 py-2 mx-10 pt-10">
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar">
              {books.map((book, index) => (
                <motion.div
                  key={book.book_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex-shrink-0 w-[120px] sm:w-[140px] group"
                  style={{ perspective: "1000px" }}
                  onClick={() => {console.log("Book ID:", book.book_id); navigate(`/book/${String(book.book_id)}`)}} // Navigate to book details
                >
                  {/* Book cover with 3D effect */}
                  <motion.div
                    className="relative aspect-[2/3] rounded-lg bg-white"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: "translateZ(0)",
                    }}
                    whileHover={{
                      rotateY: -15,
                      rotateX: 5,
                      translateY: -8,
                      transition: { duration: 0.2 },
                    }}
                  >
                    {/* Book cover image */}
                    <img
                      src={book.coverUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e"}
                      alt={book.title}
                      className="w-full h-full object-cover rounded-lg shadow-md"
                    />

                    {/* Book spine effect */}
                    <div className="absolute inset-y-0 left-0 w-[4px] bg-gray-300 rounded-l-lg transform -translate-x-[2px]" />

                    {/* Book shadow */}
                    <div
                      className="absolute -bottom-[4px] left-1 right-1 h-[8px] bg-black/20 blur-[2px]"
                      style={{ transform: "rotateX(80deg)" }}
                    />

                    {/* Quick actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        className="p-2 bg-white/90 rounded-full shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Book info */}
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{book.title}</p>
                    <p className="text-xs text-gray-600 truncate">{book.author}</p>
                    {book.progress !== undefined && (
                      <div className="pt-1">
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-indigo-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${book.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Shelf base */}
          <div className="h-4 bg-[#d4c3a5] rounded-b-xl relative">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-[#b3a38a]" />
          </div>
        </div>

        {/* Shelf supports */}
        <div className="absolute -bottom-3 left-6 right-6 flex justify-between">
          <div className="w-4 h-12 bg-[#d4c3a5] rounded-b-xl relative">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-[#b3a38a]" />
          </div>
          <div className="w-4 h-12 bg-[#d4c3a5] rounded-b-xl relative">
            <div className="absolute inset-x-0 top-0 h-[1px] bg-[#b3a38a]" />
          </div>
        </div>

        {/* Gradient fades */}
        <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-[#f0e7db] to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-[#f0e7db] to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

BookShelf.propTypes = {
  title: PropTypes.string.isRequired,
  books: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      coverUrl: PropTypes.string.isRequired,
      progress: PropTypes.number,
    }),
  ).isRequired,
  onViewAll: PropTypes.func.isRequired,
}

export default BookShelf

