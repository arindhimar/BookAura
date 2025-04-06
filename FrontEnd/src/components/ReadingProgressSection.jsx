"use client"

import { motion } from "framer-motion"
import { Progress } from "./ui/progress"
import { Button } from "./ui/button"
import { BookOpen, Clock, Calendar, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { readingHistoryApi } from "../services/api"
import { Badge } from "./ui/badge"

export default function ReadingProgressSection({ book: propBook, loading: propLoading }) {
  const navigate = useNavigate()
  const [book, setBook] = useState(propBook)
  const [loading, setLoading] = useState(propLoading || !propBook)

  useEffect(() => {
    if (propBook) {
      setBook(propBook)
      setLoading(false)
      return
    }

    const fetchInProgressBook = async () => {
      try {
        setLoading(true)
        const historyData = await readingHistoryApi.getUserHistory()

        if (historyData?.length > 0) {
          historyData.sort((a, b) => new Date(b.last_read_at) - new Date(a.last_read_at))
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
    return (
      <div className="w-full rounded-xl overflow-hidden border shadow-sm">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 aspect-[3/4] bg-muted">
            <div className="w-full h-full animate-pulse bg-muted-foreground/20" />
          </div>
          <div className="p-6 flex-grow space-y-4">
            <div className="h-8 w-3/4 rounded bg-muted-foreground/20 animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted-foreground/20 animate-pulse" />
            <div className="h-4 w-full rounded bg-muted-foreground/20 animate-pulse" />
            <div className="h-4 w-full rounded bg-muted-foreground/20 animate-pulse" />
            <div className="h-10 w-40 rounded bg-muted-foreground/20 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!book) return null

  const formattedDate = book.last_read_at
    ? new Date(book.last_read_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently"

  const categories = book.categories
    ? typeof book.categories === "string"
      ? book.categories.split(",").map((c) => c.trim())
      : book.categories
    : []

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

      <div className="bg-card rounded-xl overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          {/* Book Cover Section */}
          <div className="relative w-full md:w-1/4 min-w-[200px] max-w-[300px] aspect-[3/4] bg-muted">
            {book.cover_url ? (
              <img
                src={`${import.meta.env.VITE_BASE_API_URL}/books/${book.cover_url}`}
                alt={book.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = '/placeholder-book.svg'
                  e.target.className = 'w-full h-full object-contain p-8 bg-muted'
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-muted">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <span className="text-muted-foreground/50 text-sm text-center">
                  No cover image available
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:hidden">
              <Badge className="bg-primary/90 hover:bg-primary text-white mb-2">Continue Reading</Badge>
              <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{book.title}</h3>
              <p className="text-white/80 line-clamp-1">{book.author_name || "Unknown Author"}</p>
            </div>
          </div>

          {/* Book Details */}
          <div className="p-6 flex flex-col justify-between flex-grow">
            <div>
              <div className="hidden md:block">
                <Badge className="bg-primary/90 hover:bg-primary text-white mb-3">Continue Reading</Badge>
                <h3 className="text-2xl font-bold mb-2 line-clamp-2">{book.title}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-1">{book.author_name || "Unknown Author"}</p>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Last read on {formattedDate}</span>
                </div>

                {book.uploaded_at && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Published {new Date(book.uploaded_at).getFullYear()}</span>
                  </div>
                )}

                {book.uploaded_by_role && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-2" />
                    <span>Added by {book.uploaded_by_role}</span>
                  </div>
                )}
              </div>

              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((category, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Reading Progress</span>
                  <span className="font-medium text-primary">{book.progress || 0}%</span>
                </div>
                <Progress value={book.progress || 0} className="h-2" />
              </div>
            </div>

            <Button 
              onClick={() => navigate(`/book/${book.book_id}`)} 
              className="w-full md:w-auto" 
              size="lg"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Continue Reading
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}