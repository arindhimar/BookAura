"use client"

import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

const relatedBooks = [
  {
    id: 2,
    title: "This Side of Paradise",
    author: "F. Scott Fitzgerald",
    cover: "/placeholder.svg?height=300&width=200",
  },
  {
    id: 3,
    title: "Tender Is the Night",
    author: "F. Scott Fitzgerald",
    cover: "/placeholder.svg?height=300&width=200",
  },
  {
    id: 4,
    title: "The Beautiful and Damned",
    author: "F. Scott Fitzgerald",
    cover: "/placeholder.svg?height=300&width=200",
  },
]

export default function RelatedBooks() {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedBooks.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <img
                src={book.cover || "/placeholder.svg"}
                alt={book.title}
                className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
              />
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-1 hover:text-primary transition-colors duration-300">
                  {book.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{book.author}</p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                >
                  <Link to={`/book/${book.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

