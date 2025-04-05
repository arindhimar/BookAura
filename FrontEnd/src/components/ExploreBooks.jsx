"use client"

import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { Skeleton } from "./ui/skeleton"
import { Card, CardContent } from "./ui/card"

export default function ExploreBooks({ categories = {}, loading = false }) {
  const navigate = useNavigate()

  // Get top 5 categories with most books
  const topCategories = Object.entries(categories)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)

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
              <Skeleton key={i} className="h-[180px] w-[250px] rounded-xl flex-shrink-0" />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    )
  }

  if (!topCategories.length) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Explore by Category</h2>
        <Button variant="ghost" onClick={() => navigate("/categories")} className="text-primary">
          View All
        </Button>
      </div>

      <ScrollArea className="pb-4">
        <div className="flex space-x-4">
          {topCategories.map(([categoryName, books], index) => (
            <motion.div
              key={categoryName}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="min-w-[250px]"
            >
              <Card
                className="overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300"
                onClick={() => navigate("/categories")}
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {books.length > 0 && (
                    <img
                      src={
                        books[0].cover_url
                          ? `${import.meta.env.VITE_BASE_API_URL}/books/${books[0].cover_url}`
                          : "/placeholder.svg?height=200&width=350"
                      }
                      alt={categoryName}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="font-bold text-lg">{categoryName}</h3>
                      <p className="text-sm opacity-80">{books.length} books</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    Explore Category
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </motion.div>
  )
}

