"use client"

import { motion } from "framer-motion"
import { Search, TrendingUp, Clock, Star } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export default function ExploreBooks() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 animated-bg opacity-10" />
        <div className="relative px-6 py-12 sm:px-12 sm:py-16 md:py-20 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            >
              Discover Your Next
              <span className="text-gradient"> Favorite Book</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg sm:text-xl text-muted-foreground mb-8"
            >
              Explore thousands of books from fiction to non-fiction, mystery to romance
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by title, author, or genre..."
                  className="w-full h-14 pl-12 pr-4 rounded-full text-lg shadow-lg focus:ring-2 focus:ring-primary/50"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-6 bg-gradient hover:opacity-90">
                  Search
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>100k+ Books</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Updated Daily</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                <span>Curated Collections</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

