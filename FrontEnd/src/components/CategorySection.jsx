"use client"
import { Card } from "./ui/card"
import { motion } from "framer-motion"

const CategorySection = ({ categories }) => {
  // Default categories if not provided
  const defaultCategories = [
    {
      id: "1",
      name: "Fiction",
      image: "/placeholder.svg?height=200&width=300",
      count: 1245,
    },
    {
      id: "2",
      name: "Science",
      image: "/placeholder.svg?height=200&width=300",
      count: 856,
    },
    {
      id: "3",
      name: "Business",
      image: "/placeholder.svg?height=200&width=300",
      count: 743,
    },
    {
      id: "4",
      name: "Biography",
      image: "/placeholder.svg?height=200&width=300",
      count: 532,
    },
    {
      id: "5",
      name: "History",
      image: "/placeholder.svg?height=200&width=300",
      count: 621,
    },
    {
      id: "6",
      name: "Self-Help",
      image: "/placeholder.svg?height=200&width=300",
      count: 489,
    },
  ]

  const categoriesToDisplay = categories || defaultCategories

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
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {categoriesToDisplay.map((category) => (
        <motion.div key={category.id} variants={item}>
          <Card className="overflow-hidden h-full hover:shadow-md transition-all duration-300 group cursor-pointer">
            <div className="relative h-40">
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div>
                  <h3 className="text-white font-semibold text-xl">{category.name}</h3>
                  <p className="text-white/80 text-sm">{category.count} books</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default CategorySection

