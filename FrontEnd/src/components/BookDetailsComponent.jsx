"use client"

import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Star, Bookmark, Share2 } from "lucide-react"
import { motion } from "framer-motion"

const book = {
  id: 1,
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  genre: "Classic",
  rating: 4.5,
  cover: "/placeholder.svg?height=600&width=400",
  description:
    "The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
  progress: 75,
  reviews: [
    { id: 1, user: "John Doe", rating: 5, comment: "A timeless classic that never fails to captivate." },
    {
      id: 2,
      user: "Jane Smith",
      rating: 4,
      comment: "Beautifully written, but the characters can be frustrating at times.",
    },
  ],
}

export default function BookDetailsComponent({ id }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
    >
      <motion.div
        className="md:col-span-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <img
          src={book.cover || "/placeholder.svg"}
          alt={book.title}
          className="w-full rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
        />
        <div className="mt-4 space-y-4">
          <Progress value={book.progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">{book.progress}% completed</p>
          <Button className="w-full hover:bg-primary/90 transition-colors duration-300">Continue Reading</Button>
          <div className="flex justify-between">
            <Button variant="outline" size="icon" className="hover:bg-primary/10 transition-colors duration-300">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="hover:bg-primary/10 transition-colors duration-300">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="md:col-span-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2 hover:text-primary transition-colors duration-300">{book.title}</h1>
        <p className="text-xl text-muted-foreground mb-4">{book.author}</p>
        <div className="flex items-center mb-4">
          <Badge variant="secondary" className="mr-2 hover:bg-primary/20 transition-colors duration-300">
            {book.genre}
          </Badge>
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 mr-1" />
            <span className="text-lg font-medium">{book.rating}</span>
          </div>
        </div>
        <p className="text-muted-foreground mb-6">{book.description}</p>
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        <div className="space-y-4">
          {book.reviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="border-b border-border pb-4 hover:bg-primary/5 transition-colors duration-300 p-2 rounded"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + 0.1 * index, duration: 0.5 }}
            >
              <div className="flex items-center mb-2">
                <span className="font-medium mr-2">{review.user}</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-muted-foreground">{review.rating}</span>
                </div>
              </div>
              <p className="text-muted-foreground">{review.comment}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

