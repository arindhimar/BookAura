import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { GradientButton } from './ui/GradientButton'

const books = [
  {
    title: "The Digital Mind",
    author: "Alex Johnson",
    cover: "/placeholder.svg?height=300&width=200",
    rating: 4.5,
  },
  {
    title: "Code & Creativity",
    author: "Sarah Smith",
    cover: "/placeholder.svg?height=300&width=200",
    rating: 4.8,
  },
  {
    title: "Future of AI",
    author: "Michael Brown",
    cover: "/placeholder.svg?height=300&width=200",
    rating: 4.6,
  },
  {
    title: "Data Driven Life",
    author: "Emily Davis",
    cover: "/placeholder.svg?height=300&width=200",
    rating: 4.7,
  },
]

export default function PopularBooks({ openRegister }) {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Popular{' '}
            <span className="text-blue-500">
              eBooks
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our top-rated eBooks and start your reading journey today
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {books.map((book, index) => (
            <motion.div
              key={book.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden group"
            >
              <div className="relative h-64">
                <img
                  src={book.cover || "/placeholder.svg"}
                  alt={book.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">{book.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{book.author}</p>
                <div className="flex items-center">
                  <Star className="text-yellow-400 w-5 h-5 fill-current" />
                  <span className="ml-1 text-gray-600 dark:text-gray-300">{book.rating}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Join the Publisher Community
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Are you an author or publisher? Join our community and share your books with millions of readers worldwide.
          </p>
          <GradientButton onClick={openRegister}>
            Become a Publisher
          </GradientButton>
        </motion.div>
      </div>
    </section>
  )
}

