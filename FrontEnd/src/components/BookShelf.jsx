import { ChevronRight } from "lucide-react"
import PropTypes from "prop-types"
import { motion } from "framer-motion"

const BookShelf = ({ title, books, onViewAll }) => {
  return (
    <div className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-medium text-[#8B6E4F]">{title}</h2>
        <button onClick={onViewAll} className="text-[#8B6E4F] hover:text-[#6D563D] flex items-center text-sm group">
          Full shelf
          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="relative overflow-hidden pt-6">
        {" "}
        {/* Added padding-top for hover space */}
        {/* Inner shelf container with inward border */}
        <div
          className="relative bg-white rounded-lg p-6 mb-8 shadow-inner"
          style={{
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #E5D5C5",
          }}
        >
          {/* Books container with enhanced perspective */}
          <div className="relative perspective-[2000px]">
            <div className="flex gap-8 overflow-x-auto pb-8 -mx-4 px-4 no-scrollbar">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    y: -15, // Reduced hover height
                    rotateX: -5,
                    rotateY: 5,
                    transition: { duration: 0.4, ease: "easeOut" },
                  }}
                  className="flex-shrink-0 w-32 group cursor-pointer relative"
                >
                  {/* Enhanced book cover with deeper 3D effect */}
                  <div className="relative aspect-[3/4] transform-gpu transition-all duration-300">
                    <img
                      src={book.coverUrl || "/placeholder.svg"}
                      alt={book.title}
                      className="w-full h-full object-cover rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.15)] 
                               group-hover:shadow-[0_20px_30px_rgba(0,0,0,0.2)]
                               transition-all duration-300"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: "translateZ(0)",
                      }}
                    />

                    {/* Enhanced book spine effect */}
                    <div
                      className="absolute left-0 top-0 w-[4px] h-full bg-gradient-to-r 
                               from-black/30 to-transparent rounded-l-md"
                    />

                    {/* Enhanced book reflection */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-white/40 via-white/20 to-transparent 
                               opacity-0 group-hover:opacity-100 transition-opacity rounded-md
                               pointer-events-none"
                    />
                  </div>

                  {/* Book info with enhanced hover effect */}
                  <motion.div
                    className="mt-4 transform-gpu"
                    variants={{
                      hover: { y: -5, opacity: 1 }, // Reduced movement
                      initial: { y: 0, opacity: 0.8 },
                    }}
                    initial="initial"
                    whileHover="hover"
                  >
                    <h3 className="text-sm font-medium text-[#6D563D] truncate">{book.title}</h3>
                    <p className="text-xs text-[#8B6E4F] truncate mt-1">{book.author}</p>

                    {/* Reading progress with enhanced styling */}
                    {book.progress && (
                      <div className="mt-3">
                        <div className="h-1 bg-[#E5D5C5] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-[#8B6E4F] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${book.progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                        <p className="text-xs text-[#8B6E4F] mt-1">{book.progress}% complete</p>
                      </div>
                    )}
                  </motion.div>

                  {/* Enhanced quick actions */}
                  <motion.div
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 
                             transition-opacity"
                    initial={{ scale: 0.8 }}
                    whileHover={{ scale: 1 }}
                  >
                    <button
                      className="p-2 bg-white/95 rounded-full shadow-lg hover:bg-white
                               transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        book.onFavorite?.()
                      }}
                    >
                      <svg className="w-4 h-4 text-[#8B6E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Shelf base with wood texture */}
          <div
            className="absolute left-0 right-0 bottom-0 h-8 bg-gradient-to-b from-[#E5D5C5] to-[#C4B5A2] rounded-b-lg"
            style={{
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  rgba(139, 110, 79, 0.1) 0px,
                  rgba(139, 110, 79, 0.1) 2px,
                  transparent 2px,
                  transparent 20px
                )
              `,
            }}
          />
        </div>
        {/* Enhanced shelf supports */}
        <div
          className="absolute bottom-0 left-4 w-6 h-16 bg-gradient-to-b from-[#E5D5C5] to-[#C4B5A2] rounded-b-lg"
          style={{
            boxShadow: "inset -2px 2px 4px rgba(0,0,0,0.1)",
            backgroundImage: `
                 repeating-linear-gradient(
                   0deg,
                   rgba(139, 110, 79, 0.1) 0px,
                   rgba(139, 110, 79, 0.1) 2px,
                   transparent 2px,
                   transparent 20px
                 )
               `,
          }}
        />
        <div
          className="absolute bottom-0 right-4 w-6 h-16 bg-gradient-to-b from-[#E5D5C5] to-[#C4B5A2] rounded-b-lg"
          style={{
            boxShadow: "inset 2px 2px 4px rgba(0,0,0,0.1)",
            backgroundImage: `
                 repeating-linear-gradient(
                   0deg,
                   rgba(139, 110, 79, 0.1) 0px,
                   rgba(139, 110, 79, 0.1) 2px,
                   transparent 2px,
                   transparent 20px
                 )
               `,
          }}
        />
        {/* Enhanced gradient fade effect */}
        <div className="absolute top-6 bottom-8 left-0 w-12 bg-gradient-to-r from-[#FAF6F1] to-transparent pointer-events-none" />
        <div className="absolute top-6 bottom-8 right-0 w-12 bg-gradient-to-l from-[#FAF6F1] to-transparent pointer-events-none" />
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
      onFavorite: PropTypes.func,
    }),
  ).isRequired,
  onViewAll: PropTypes.func.isRequired,
}

export default BookShelf

