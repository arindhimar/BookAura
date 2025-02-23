import { motion } from "framer-motion"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { BookOpen, Clock, Star, Heart } from "lucide-react"
import UserNavbar from "../../components/UserNavbar"

const tabs = [
  { id: "reading", label: "Currently Reading", icon: BookOpen },
  { id: "completed", label: "Completed", icon: Star },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "history", label: "Reading History", icon: Clock },
]

const books = {
  reading: [
    {
      id: 1,
      title: "The Midnight Library",
      author: "Matt Haig",
      cover: "/placeholder.svg?height=400&width=300",
      progress: 45,
      lastRead: "2 hours ago",
    },
    // Add more books...
  ],
  completed: [
    // Add completed books...
  ],
  wishlist: [
    // Add wishlist books...
  ],
  history: [
    // Add history books...
  ],
}

export default function Library() {
  const [activeTab, setActiveTab] = useState("reading")

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gradient">My Library</h1>
          <p className="text-lg text-muted-foreground">Track your reading journey and manage your books</p>
        </motion.div>

        <Tabs defaultValue="reading" className="mb-8">
          <TabsList className="w-full flex-wrap justify-start h-auto p-2 bg-background">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-4 py-2 rounded-full data-[state=active]:bg-gradient data-[state=active]:text-white"
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {books[tab.id]?.map((book, index) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="modern-card group cursor-pointer">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
                        <img
                          src={book.cover || "/placeholder.svg"}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {book.progress && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                            <div className="h-full bg-gradient" style={{ width: `${book.progress}%` }} />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">
                          {book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                        {book.progress && (
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{book.progress}% complete</span>
                            <span className="text-muted-foreground">{book.lastRead}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )
}

