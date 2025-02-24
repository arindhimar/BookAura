import { useState } from "react"
import { motion } from "framer-motion"
import { Star, ThumbsUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Pagination } from "./ui/pagination"

export default function BookReviews({ reviews = [], loading = false }) {
  const [page, setPage] = useState(1)
  const reviewsPerPage = 5
  const totalPages = Math.ceil((reviews?.length || 0) / reviewsPerPage)

  const paginatedReviews = reviews?.slice((page - 1) * reviewsPerPage, page * reviewsPerPage)

  if (loading) {
    return <div className="text-center">Loading reviews...</div>
  }

  return (
    <motion.div
      key="reviews"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {paginatedReviews?.length > 0 ? (
        paginatedReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="p-4 rounded-lg bg-card"
          >
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={review.avatar || "/placeholder.svg?height=40&width=40"} />
                <AvatarFallback>{review.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{review.user}</h4>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                <p className="mt-2">{review.comment}</p>
                <Button variant="ghost" size="sm" className="mt-2 flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {review.likes || 0}
                </Button>
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <p className="text-muted-foreground text-center">No reviews available.</p>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-4" currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </motion.div>
  )
}

