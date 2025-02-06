"use client"

import { ChevronRight } from "lucide-react"
import PropTypes from "prop-types"
import { motion } from "framer-motion"

const BookShelf = ({ title, books, onViewAll }) => {
  return (
    <div className="mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-[#8B6E4F]">{title}</h2>
        <motion.button
          onClick={onViewAll}
          className="flex items-center text-sm text-[#8B6E4F] hover:text-[#6D563D] group"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.95 }}
        >
          Full shelf
          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      <div className="relative">
        {/* Shelf background with wood texture */}
        <div
          className="relative bg-[#F6F2EE] rounded-lg p-6 mb-2"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                rgba(139, 110, 79, 0.01) 0px,
                rgba(139, 110, 79, 0.01) 2px,
                transparent 2px,
                transparent 20px
              )
            `,
          }}
        >
          {/* Books container */}
          <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="relative flex-shrink-0 w-[120px] group cursor-pointer"
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px",
                }}
              >
                {/* Book cover with 3D effect */}
                <motion.div
                  className="relative aspect-[3/4] bg-white rounded-lg"
                  style={{
                    transformStyle: "preserve-3d",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    transform: "translateY(-8px)", // Float above shelf
                  }}
                  whileHover={{
                    rotateY: -10,
                    rotateX: 5,
                    translateY: -16,
                    transition: {
                      duration: 0.2,
                      ease: "easeOut",
                    },
                  }}
                >
                  <img
                    src={book.coverUrl || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-lg"
                    style={{
                      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
                    }}
                  />

                  {/* Book spine shadow */}
                  <div className="absolute inset-y-0 right-0 w-[2px] bg-black/10 rounded-r-lg" />

                  {/* Book bottom shadow */}
                  <div
                    className="absolute -bottom-2 left-2 right-2 h-4 bg-black/10 blur-sm rounded-full"
                    style={{
                      transform: "rotateX(80deg)",
                    }}
                  />
                </motion.div>

                {/* Book info */}
                <motion.div
                  className="mt-4 transition-opacity"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <h3 className="text-sm font-medium text-[#6D563D] truncate">{book.title}</h3>
                  <p className="text-xs text-[#8B6E4F] truncate mt-0.5">{book.author}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Shelf base with enhanced depth */}
        <div
          className="h-3 bg-[#E5D5C5] rounded-b-lg mx-2"
          style={{
            boxShadow: `
              inset 0 1px 2px rgba(0,0,0,0.1),
              0 2px 4px rgba(0,0,0,0.05)
            `,
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                rgba(139, 110, 79, 0.03) 0px,
                rgba(139, 110, 79, 0.03) 2px,
                transparent 2px,
                transparent 20px
              )
            `,
          }}
        />

        {/* Enhanced shelf supports */}
        <div
          className="absolute bottom-0 left-4 w-3 h-12 bg-[#E5D5C5] rounded-b-lg"
          style={{
            boxShadow: `
              inset -1px 1px 2px rgba(0,0,0,0.1),
              2px 2px 4px rgba(0,0,0,0.05)
            `,
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                rgba(139, 110, 79, 0.03) 0px,
                rgba(139, 110, 79, 0.03) 2px,
                transparent 2px,
                transparent 20px
              )
            `,
          }}
        />
        <div
          className="absolute bottom-0 right-4 w-3 h-12 bg-[#E5D5C5] rounded-b-lg"
          style={{
            boxShadow: `
              inset 1px 1px 2px rgba(0,0,0,0.1),
              -2px 2px 4px rgba(0,0,0,0.05)
            `,
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                rgba(139, 110, 79, 0.03) 0px,
                rgba(139, 110, 79, 0.03) 2px,
                transparent 2px,
                transparent 20px
              )
            `,
          }}
        />

        {/* Enhanced gradient fade effect */}
        <div className="absolute top-0 bottom-8 left-0 w-12 bg-gradient-to-r from-[#FAF6F3] to-transparent pointer-events-none" />
        <div className="absolute top-0 bottom-8 right-0 w-12 bg-gradient-to-l from-[#FAF6F3] to-transparent pointer-events-none" />
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
    }),
  ).isRequired,
  onViewAll: PropTypes.func.isRequired,
}

export default BookShelf

