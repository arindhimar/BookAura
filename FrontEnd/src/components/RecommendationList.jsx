import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const RecommendationList = ({ recommendations }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {recommendations.map((book, index) => (
        <motion.div
          key={book.book_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Link to={`/book/${book.book_id}`} className="block group">
            <div className="aspect-w-2 aspect-h-3 rounded-lg overflow-hidden">
              <img
                src={book.coverUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e"}
                alt={book.title}
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900 group-hover:text-indigo-600">{book.title}</h3>
            <p className="text-sm text-gray-500">{book.author}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

export default RecommendationList

