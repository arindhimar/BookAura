import { motion, AnimatePresence } from "framer-motion";
import { Book, Users, TrendingUp, ChevronRight, Loader2 } from "lucide-react";
import UserNavbar from "../../components/UserNavbar";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [categoryBooks, setCategoryBooks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("User not authenticated");
        }

        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/categories/`, {
          headers: { Authorization: token },
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data);

        // Fetch books for each category
        data.forEach((category) => {
          fetchCategoryBooks(category.category_id);
        });
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const validateUser = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        localStorage.clear();
      }
      fetchCategories();
    };

    validateUser();
  }, []);

  const fetchCategoryBooks = async (categoryId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/category/${categoryId}`, {
        headers: { Authorization: token },
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch books for category ${categoryId}`);
      }

      const data = await response.json();
      setCategoryBooks((prev) => ({
        ...prev,
        [categoryId]: data,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleBookClick = (book) => {
    console.log(book)
    setSelectedBook(selectedBook?.book_id === book.book_id ? null : book);
    navigate(`/book/${book.book_id}`);
  };

  const handleCategoryClick = (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      setSelectedBook(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <UserNavbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <UserNavbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-red-500 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Categories</h1>
          <p className="text-lg text-muted-foreground">Find your next favorite book by category</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.category_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => handleCategoryClick(category.category_id)}
            >
              <div className="modern-card relative overflow-hidden p-6">
                <h3 className="text-xl font-semibold">{category.category_name}</h3>

                <AnimatePresence>
                  {expandedCategory === category.category_id && categoryBooks[category.category_id]?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4"
                    >
                      <ScrollArea className="h-[300px] rounded-md border p-4">
                        <div className="grid grid-cols-2 gap-4">
                          {categoryBooks[category.category_id].map((book) => (
                            <motion.div
                              key={book.book_id}
                              className={`relative cursor-pointer ${
                                selectedBook?.book_id === book.book_id ? "scale-110 shadow-lg" : "scale-100"
                              } transition-transform duration-300`}
                              
                            >
                              <img
                                src={book.cover || "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg"}
                                alt={book.title}
                                className="object-cover w-full h-full transition-transform duration-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookClick(book);
                                }}
                              />
                              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                                {book.title}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                      <Button
                        variant="ghost"
                        className="w-full mt-4 text-primary"
                        onClick={() => navigate(`/books/${selectedBook?.book_id}`)}
                      >
                        View Details <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
