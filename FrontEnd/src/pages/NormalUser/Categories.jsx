import { motion } from "framer-motion"
import { Book, Users, TrendingUp } from "lucide-react"
import UserNavbar from "../../components/UserNavbar"

const categories = [
  {
    id: 1,
    name: "Fiction",
    icon: Book,
    color: "from-purple-500 to-pink-500",
    books: 1234,
    readers: "2.3M",
    trending: true,
  },
  {
    id: 2,
    name: "Mystery & Thriller",
    icon: Book,
    color: "from-blue-500 to-cyan-500",
    books: 856,
    readers: "1.8M",
    trending: true,
  },
  // Add more categories...
]

export default function Categories() {
  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Explore Categories</h1>
          <p className="text-lg text-muted-foreground">Find your next favorite book by category</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="modern-card relative overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
                />
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-primary/10">
                      <category.icon className="h-6 w-6 text-primary" />
                    </div>
                    {category.trending && (
                      <div className="flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Trending
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                    {category.name}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Book className="h-4 w-4 mr-1" />
                    <span className="mr-4">{category.books} Books</span>
                    <Users className="h-4 w-4 mr-1" />
                    <span>{category.readers} Readers</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-12 rounded-md overflow-hidden opacity-75 hover:opacity-100 transition-opacity duration-300"
                      >
                        <img
                          src="/placeholder.svg?height=150&width=100"
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}

