"use client"

import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { BookOpen, Clock } from "lucide-react"

const recentBooks = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    progress: 75,
    cover: "/placeholder.svg?height=300&width=200",
    timeLeft: "2 hours left",
    chapter: "Chapter 7",
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    progress: 30,
    cover: "/placeholder.svg?height=300&width=200",
    timeLeft: "4 hours left",
    chapter: "Chapter 3",
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    progress: 50,
    cover: "/placeholder.svg?height=300&width=200",
    timeLeft: "3 hours left",
    chapter: "Chapter 5",
  },
]

export default function RecentlyRead() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mb-12"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gradient">Recently Read</h2>
        <Button variant="ghost" className="text-primary hover:text-primary/80">
          View All
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentBooks.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
            <Link to={`/book/${book.id}`}>
              <Card className="modern-card group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
                  <img
                    src={book.cover || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="font-medium flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {book.timeLeft}
                    </p>
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
                    <Button
                      size="sm"
                      className="bg-primary/10 hover:bg-primary/20 text-primary rounded-full h-8 w-8 p-0"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{book.chapter}</p>
                    <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${book.progress}%` }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{book.progress}% completed</span>
                      <span>{100 - book.progress}% remaining</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

