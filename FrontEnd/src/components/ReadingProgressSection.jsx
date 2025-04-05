"use client"

import { motion } from "framer-motion"
import { Progress } from "./ui/progress"
import { Button } from "./ui/button"
import { BookOpen, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { readingHistoryApi } from "../services/api"

export default function ReadingProgressSection({ book: propBook, loading: propLoading }) {
  const navigate = useNavigate()
  const [book, setBook] = useState(propBook)
  const [loading, setLoading] = useState(propLoading || !propBook)

  useEffect(() => {
    // If book is provided as prop, use it
    if (propBook) {
      // console.log("Using provided book:", propBook)
      setBook(propBook)
      setLoading(false)
      return
    }

    // Otherwise fetch the in-progress book
    const fetchInProgressBook = async () => {
      try {
        setLoading(true)
        const historyData = await readingHistoryApi.getUserHistory()

        if (historyData && historyData.length > 0) {
          // Sort by last read date
          historyData.sort((a, b) => new Date(b.last_read_at) - new Date(a.last_read_at))

          // Find the first book with progress < 100%
          const inProgress = historyData.find((item) => (item.progress || 0) < 100)

          if (inProgress) {
            setBook({
              ...inProgress.book_details,
              book_id: inProgress.book_id,
              progress: inProgress.progress || 0,
              last_read_at: inProgress.last_read_at,
            })
          }
        }
      } catch (error) {
        console.error("Error fetching in-progress book:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInProgressBook()
  }, [propBook])

  if (loading) {
    return <div className="w-full h-32 rounded-lg bg-muted animate-pulse"></div>
  }

  if (!book) {
    return null
  }

  const formattedDate = book.last_read_at
    ? new Date(book.last_read_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Continue Reading</h2>
        <Button variant="ghost" onClick={() => navigate("/library")} className="text-primary">
          View All
        </Button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 aspect-[3/4] md:aspect-auto">
            <img
              src={
                book.cover_url
                  ? `${import.meta.env.VITE_BASE_API_URL}/books/${book.cover_url}`
                  : "/placeholder.svg?height=300&width=200"
              }
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 flex flex-col justify-between flex-grow">
            <div>
              <h3 className="text-xl font-bold mb-2">{book.title}</h3>
              <p className="text-muted-foreground mb-4">{book.author_name || "Unknown Author"}</p>

              <div className="flex items-center text-sm text-muted-foreground mb-6">
                <Clock className="h-4 w-4 mr-2" />
                <span>Last read on {formattedDate}</span>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Progress</span>
                  <span className="font-medium text-foreground">{book.progress || 0}%</span>
                </div>
                <Progress value={book.progress || 0} className="h-2" />
              </div>
            </div>

            <Button onClick={() => navigate(`/book/${book.book_id}`)} className="w-full md:w-auto">
              <BookOpen className="mr-2 h-4 w-4" />
              Continue Reading
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

