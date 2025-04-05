"use client"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Star } from "lucide-react"
import { motion } from "framer-motion"

export const EnhancedBookCard = ({
  book,
  showRating = true,
  showAuthor = true,
  showCategory = false,
  className = "",
}) => {
  // Default book data if not provided
  const defaultBook = {
    id: "1",
    title: "The Great Adventure",
    author: "Jane Doe",
    coverImage: "/placeholder.svg?height=400&width=300",
    rating: 4.5,
    category: "Adventure",
  }

  const bookData = book || defaultBook

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`h-full ${className}`}
    >
      <Card className="overflow-hidden h-full bg-background border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={bookData.coverImage || "/placeholder.svg"}
            alt={bookData.title}
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
          />

          {showCategory && bookData.category && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs font-medium"
            >
              {bookData.category}
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-base line-clamp-1 mb-1">{bookData.title}</h3>

          {showAuthor && <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{bookData.author}</p>}

          {showRating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="text-sm font-medium">{bookData.rating}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

