"use client"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { Button } from "./ui/button"
import { BookOpen, Clock } from "lucide-react"
import { motion } from "framer-motion"

const ReadingProgressSection = ({ books }) => {
  // Default books if not provided
  const defaultBooks = [
    {
      id: "1",
      title: "The Great Adventure",
      author: "Jane Doe",
      coverImage: "/placeholder.svg?height=400&width=300",
      progress: 65,
      lastRead: "2023-10-15T14:30:00",
      timeLeft: "3 hours",
    },
    {
      id: "2",
      title: "Mystery of the Lost City",
      author: "John Smith",
      coverImage: "/placeholder.svg?height=400&width=300",
      progress: 32,
      lastRead: "2023-10-14T20:15:00",
      timeLeft: "5 hours",
    },
    {
      id: "3",
      title: "The Science of Everything",
      author: "Alan Johnson",
      coverImage: "/placeholder.svg?height=400&width=300",
      progress: 89,
      lastRead: "2023-10-16T09:45:00",
      timeLeft: "1 hour",
    },
  ]

  const booksToDisplay = books || defaultBooks

  // Format the last read date
  const formatLastRead = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else {
      return `${diffDays} days ago`
    }
  }

  return (
    <Card className="border border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Continue Reading</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {booksToDisplay.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4"
          >
            <div className="flex-shrink-0 w-16 h-24 overflow-hidden rounded-md">
              <img
                src={book.coverImage || "/placeholder.svg"}
                alt={book.title}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base line-clamp-1">{book.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{book.author}</p>

              <div className="flex items-center text-xs text-muted-foreground mb-2">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  Last read {formatLastRead(book.lastRead)} • {book.timeLeft} left
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Progress value={book.progress} className="h-2 flex-1" />
                <span className="text-xs font-medium">{book.progress}%</span>
              </div>

              <Button size="sm" variant="ghost" className="text-xs px-2 py-1 h-auto">
                <BookOpen className="h-3 w-3 mr-1" />
                Continue
              </Button>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

export default ReadingProgressSection

