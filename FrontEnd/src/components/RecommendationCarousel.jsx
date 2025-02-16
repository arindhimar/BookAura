import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

const RecommendationCarousel = ({ recommendations }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === recommendations.length - 1 ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? recommendations.length - 1 : prevIndex - 1))
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {recommendations.map((book, index) => (
            <div key={book.book_id} className="w-full flex-shrink-0 px-4">
              <Link to={`/book/${book.book_id}`} className="block">
                <img
                  src={book.coverUrl || "/placeholder.svg"}
                  alt={book.title}
                  className="w-48 h-72 object-cover rounded-lg shadow-md mx-auto"
                />
                <h3 className="mt-2 text-center font-semibold text-gray-900">{book.title}</h3>
                <p className="text-center text-gray-600">{book.author}</p>
              </Link>
            </div>
          ))}
        </motion.div>
      </div>
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
      >
        <ChevronLeft className="h-6 w-6 text-gray-600" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
      >
        <ChevronRight className="h-6 w-6 text-gray-600" />
      </button>
    </div>
  )
}

export default RecommendationCarousel

