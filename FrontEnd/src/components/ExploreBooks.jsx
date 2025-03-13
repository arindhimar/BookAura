import { motion } from "framer-motion";
import { Search, TrendingUp, Clock, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ExploreBooks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        fetch(`${import.meta.env.VITE_BASE_API_URL}/books/search/${searchQuery}`, {
          headers: { "Authorization": `${localStorage.getItem("token")}` },
        })
          .then((res) => res.json())
          .then((data) => setSearchResults(data))
          .catch((err) => console.error("Search error:", err));
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

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
            <motion.h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Discover Your Next <span className="text-gradient">Favorite Book</span>
            </motion.h1>
            <motion.p className="text-lg sm:text-xl text-muted-foreground mb-8">
              Explore thousands of books from fiction to non-fiction, mystery to romance
            </motion.p>
            <motion.div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by title, author, or genre..."
                  className="w-full h-14 pl-12 pr-4 rounded-full text-lg shadow-lg focus:ring-2 focus:ring-primary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
              </div>
              {isFocused && searchResults.length > 0 && (
                <div className="absolute top-16 left-0 w-full bg-background border border-primary/20 shadow-lg rounded-lg p-2">
                  {searchResults.map((book) => (
                    <div
                      key={book.book_id}
                      className="p-2 cursor-pointer hover:bg-primary/10 rounded-md flex items-center space-x-3"
                      onMouseDown={() => navigate(`/book/${book.book_id}`)} // Change onClick to onMouseDown
                    >
                      <img
                        src={book.cover || "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg"}
                        alt={book.title}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <span className="text-sm font-medium">{book.title}</span>
                    </div>
                  ))}
                </div>
              )}

            </motion.div>
            <motion.div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>100+ Books</span>
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
  );
}
