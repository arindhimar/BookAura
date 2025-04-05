"use client"

import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"
import { BookOpen } from "lucide-react"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { Skeleton } from "./ui/skeleton"
import BookCard from "./BookCard"

export default function Recommendations({ books = [], loading = false }) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <ScrollArea className="pb-4">
          <div className="flex space-x-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-[280px] w-[180px] rounded-xl flex-shrink-0" />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    )
  }

  if (!books.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <Button variant="ghost" onClick={() => navigate("/browse")} className="text-primary">
            View All
          </Button>
        </div>
        <div className="text-center py-12 border rounded-xl bg-card">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No recommendations available</h3>
          <p className="text-muted-foreground mb-4">Check back later for personalized recommendations</p>
          <Button onClick={() => navigate("/browse")}>Browse Books</Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Recommended for You</h2>
        <Button variant="ghost" onClick={() => navigate("/browse")} className="text-primary">
          View All
        </Button>
      </div>

      <ScrollArea className="pb-4">
        <div className="flex space-x-4">
          {books.slice(0, 10).map((book, index) => (
            <motion.div
              key={book.book_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="min-w-[180px] max-w-[180px]"
            >
              <BookCard book={book} index={index} onClick={() => navigate(`/book/${book.book_id}`)} />
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </motion.div>
  )
}

