"use client"
import { EnhancedBookCard } from "./EnhancedBookCard"
import { motion } from "framer-motion"

const EnhancedBookGrid = ({ books, columns = 4, showRating = true, showAuthor = true, showCategory = false }) => {
  // Default books if not provided
  const defaultBooks = [
    {
      id: "1",
      title: "The Great Adventure",
      author: "Jane Doe",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.5,
      category: "Adventure",
    },
    {
      id: "2",
      title: "Mystery of the Lost City",
      author: "John Smith",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.2,
      category: "Mystery",
    },
    {
      id: "3",
      title: "The Science of Everything",
      author: "Alan Johnson",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.8,
      category: "Science",
    },
    {
      id: "4",
      title: "Cooking Masterclass",
      author: "Maria Garcia",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.6,
      category: "Cooking",
    },
  ]

  const booksToDisplay = books || defaultBooks

  // Determine grid columns based on the columns prop
  const gridClass =
    {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
      5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
      6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
    }[columns] || "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div className={`grid ${gridClass} gap-6`} variants={container} initial="hidden" animate="show">
      {booksToDisplay.map((book) => (
        <motion.div key={book.id} variants={item}>
          <EnhancedBookCard book={book} showRating={showRating} showAuthor={showAuthor} showCategory={showCategory} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default EnhancedBookGrid

