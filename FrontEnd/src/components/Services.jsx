"use client"

import { motion } from "framer-motion"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { useNavigate } from "react-router-dom"
import { Card } from "./ui/card"

export default function RelatedBooks({ relatedByAuthor = [], relatedByCategory = [] }) {
  const navigate = useNavigate()

  const hasRelatedBooks = relatedByAuthor.length > 0 || relatedByCategory.length > 0

  if (!hasRelatedBooks) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="mt-12 space-y-8"
    >
      <h2 className="text-2xl font-bold">You might also like</h2>

      {relatedByAuthor.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">More from this author</h3>
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex space-x-4">
              {relatedByAuthor.map((book, index) => (
                <BookCard
                  key={book.book_id}
                  book={book}
                  index={index}
                  onClick={() => navigate(`/book/${book.book_id}`)}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {relatedByCategory.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Similar books</h3>
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex space-x-4">
              {relatedByCategory.map((book, index) => (
                <BookCard
                  key={book.book_id}
                  book={book}
                  index={index}
                  onClick={() => navigate(`/book/${book.book_id}`)}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
    </motion.div>
  )
}

function BookCard({ book, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="min-w-[180px] max-w-[180px]"
    >
      <Card
        className="overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 border-border/40 hover:border-primary/20"
        onClick={onClick}
      >
        <div className="aspect-[2/3] relative overflow-hidden">
          <img
            src={
              book.coverUrl || book.cover_url
                ? `${import.meta.env.VITE_BASE_API_URL}/books/${book.coverUrl || book.cover_url}`
                : "/placeholder.svg?height=270&width=180"
            }
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-3">
          <h4 className="font-medium text-sm line-clamp-1">{book.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-1">{book.author_name}</p>
        </div>
      </Card>
    </motion.div>
  )
}

