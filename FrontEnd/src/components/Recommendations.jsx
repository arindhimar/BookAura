"use client"

import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Link } from "react-router-dom"
import { Star, BookOpen, Heart } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

const recommendedBooks = [
  {
    id: 4,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    rating: 4.7,
    cover: "/placeholder.svg?height=300&width=200",
    genre: "Classic Romance",
    readers: "2.3M readers",
  },
  {
    id: 5,
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    rating: 4.3,
    cover: "/placeholder.svg?height=300&width=200",
    genre: "Coming-of-age",
    readers: "1.8M readers",
  },
  {
    id: 6,
    title: "To the Lighthouse",
    author: "Virginia Woolf",
    rating: 4.5,
    cover: "/placeholder.svg?height=300&width=200",
    genre: "Modernist",
    readers: "980K readers",
  },
]

export default function Recommendations() {
  const [hoveredBook, setHoveredBook] = useState(null)

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gradient">Recommended for You</h2>
        <Button variant="ghost" className="text-primary hover:text-primary/80">
          View All
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedBooks.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
            onHoverStart={() => setHoveredBook(book.id)}
            onHoverEnd={() => setHoveredBook(null)}
          >
            <Card className="modern-card overflow-hidden group">
              <div className="relative aspect-[3/4]">
                <img
                  src={book.cover || "/placeholder.svg"}
                  alt={book.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 right-4 space-y-2 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30"
                  >
                    <Heart className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{book.genre}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{book.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm opacity-75">{book.readers}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Button asChild variant="default" className="w-full bg-gradient hover:opacity-90 transition-opacity">
                    <Link to={`/book/${book.id}`}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Read Now
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

