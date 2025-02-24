import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function RelatedBooks({ book }) {
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!book || !book.categories) return;

    const fetchRelatedBooks = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("User not authenticated");
        }

        const categoryQuery = encodeURIComponent(book.categories.join(","));

        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/books/related?categories=${categoryQuery}`,
          {
            headers: {
              Authorization: token,
            },
            method: "GET",
          }
        );

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

    fetchRelatedBooks();
  }, [book]);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>

      {loading ? (
        <p className="text-muted-foreground">Fetching related books...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : relatedBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedBooks.map((relatedBook, index) => (
            <motion.div
              key={relatedBook.book_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <img
                  src={
                    relatedBook.cover ||
                    "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg"
                  }
                  alt={relatedBook.title}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                />
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-1 hover:text-primary transition-colors duration-300">
                    {relatedBook.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {relatedBook.author_name || "Unknown Author"}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
                  >
                    <Link to={`/book/${relatedBook.book_id}`}>View Details</Link>
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
