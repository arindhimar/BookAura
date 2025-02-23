import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function RelatedBooks(id) {
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
     
    const fetchRelatedBooks = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_BASE_API_URL + "/books/related", {
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch related books");
        }

        const data = await response.json();
        setRelatedBooks(data);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // fetchRelatedBooks();
  }, []);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : relatedBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedBooks.map((book, index) => (
            <motion.div
              key={book.book_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <img
                  src={book.cover || "/placeholder.svg"}
                  alt={book.title}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                />
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-1 hover:text-primary transition-colors duration-300">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{book.author}</p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                  >
                    <Link to={`/book/${book.book_id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No related books found.</p>
      )}
    </section>
  );
}
