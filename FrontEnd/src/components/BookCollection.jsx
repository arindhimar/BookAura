"use client"

import React from "react"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { EnhancedBookCard } from '/src/components/EnhancedBookCard'
import { Button } from "./ui/button"

const BookCollection = ({
  title,
  books = [],
  viewAllLink,
  emptyMessage = "No books found",
  showProgress = false,
  layout = "grid", // grid or carousel
}) => {
  const containerRef = React.useRef(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const checkScrollability = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  React.useEffect(() => {
    checkScrollability()
    window.addEventListener("resize", checkScrollability)
    return () => window.removeEventListener("resize", checkScrollability)
  }, [books])

  const scroll = (direction) => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current
      const scrollAmount = direction === "left" ? -clientWidth / 2 : clientWidth / 2
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
      setTimeout(checkScrollability, 500)
    }
  }

  if (!books.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {viewAllLink && (
          <Button variant="ghost" size="sm" asChild>
            <a href={viewAllLink} className="flex items-center gap-1">
              View all <ChevronRight size={16} />
            </a>
          </Button>
        )}
      </div>

      {layout === "carousel" ? (
        <div className="relative">
          {canScrollLeft && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg"
              onClick={() => scroll("left")}
            >
              <ChevronRight className="rotate-180 h-4 w-4" />
            </Button>
          )}

          <div
            ref={containerRef}
            className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x"
            onScroll={checkScrollability}
          >
            {books.map((book) => (
              <div key={book.id} className="min-w-[180px] max-w-[180px] snap-start">
                <EnhancedBookCard book={book} showProgress={showProgress} />
              </div>
            ))}
          </div>

          {canScrollRight && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          {books.map((book) => (
            <motion.div key={book.id} variants={item}>
              <EnhancedBookCard book={book} showProgress={showProgress} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default BookCollection

