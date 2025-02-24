import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export default function RecentlyRead() {
  const [recentBooks, setRecentBooks] = useState([]);

  useEffect(() => {
    const fetchRecentBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("User not authenticated");
        }

        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/books/`,
          {
            headers: {
              Authorization: token,
            },
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recent books");
        }

        const data = await response.json();
        setRecentBooks(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRecentBooks();
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mb-12"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gradient">Recently Read</h2>
        <Button variant="ghost" className="text-primary hover:text-primary/80">
          View All
        </Button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {recentBooks.map((book, index) => (
          <motion.div
            key={book.book_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
            <Link to={`/book/${book.book_id}`}>
              <Card className="modern-card group cursor-pointer">
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl">
                  <img
                    src={book.cover || "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg"}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-xs">
                    <p className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {book.timeLeft}
                    </p>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-primary/10 hover:bg-primary/20 text-primary rounded-full h-7 w-7 p-0"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">{book.chapter}</p>
                    <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${book.progress}%` }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{book.progress}% completed</span>
                      <span>{100 - book.progress}% left</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
