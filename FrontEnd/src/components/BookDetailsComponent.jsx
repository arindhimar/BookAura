import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Star, Bookmark, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function BookDetailsComponent({ id }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState(null);

  const handleReadNow = async () => {
    try {
      console.log(book.file_url.replace("uploads/", ""))
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/${book.file_url.replace("uploads/", "")}`)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      window.open(`${import.meta.env.VITE_BASE_API_URL}/books/${book.file_url.replace("uploads/", "")}`, '_blank', 'noopener, noreferrer');
      addView();
      
      const pdfBlob = await response.blob()
      const pdfUrl = URL.createObjectURL(pdfBlob)
      

      setPdfUrl(pdfUrl)
      setIsReaderOpen(true)


    } catch (err) {
      console.error("Error fetching PDF:", err)
    }
  }

  const addView = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books_views/${book.book_id}/add-view`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },

        body: JSON.stringify({ book_id: book.book_id })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
    } catch (err) {
      console.error("Error adding view:", err)
    }

  }



  useEffect(() => {

    const fetchAuthor = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/${id}/author`, {
          headers: { Authorization: `${localStorage.getItem("token")}` },
          method: "GET",
        });

        if (!response.ok) throw new Error("Failed to fetch author data");

        const data = await response.json();
        setAuthor(data);
      } catch (error) {
        console.error(error);
        setAuthor(null);
      } finally {
        setLoading(false);
      }
    };


    if (!id) return;

    const fetchCurrentBook = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/${id}`, {
          headers: { Authorization: `${localStorage.getItem("token")}` },
          method: "GET",
        });

        if (!response.ok) throw new Error("Failed to fetch book data");

        const data = await response.json();
        setBook(data);
      } catch (error) {
        console.error(error);
        setBook(null);
      } finally {
        setLoading(false);
        // fetchAuthor();

      }
    };

    fetchCurrentBook();
    fetchAuthor();
  }, [id]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading book details...</p>;
  }

  if (!book) {
    return <p className="text-center text-red-500">Book not found.</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
    >
      {/* Book Cover & Actions */}
      <motion.div className="md:col-span-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <img
          src={book.cover || "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg"}
          alt={book.title}
          className="w-full rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
        />
        <div className="mt-4 space-y-4">
          <Progress value={book.progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">{book.progress || 0}% completed</p>
          <Button className="w-full hover:bg-primary/90 transition-colors duration-300" onClick={handleReadNow}>Continue Reading</Button>
          <div className="flex justify-between">
            <Button variant="outline" size="icon" className="hover:bg-primary/10 transition-colors duration-300">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="hover:bg-primary/10 transition-colors duration-300">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Book Details */}
      <motion.div className="md:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <h1 className="text-3xl font-bold mb-2 hover:text-primary transition-colors duration-300">{book.title}</h1>
        <p className="text-xl text-muted-foreground mb-4">{"Unknown Author"}</p>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {book.categories?.length > 0 ? (
            book.categories.map((category, index) => (
              <Badge key={index} variant="outline" className="hover:bg-primary/20 transition-colors duration-300">
                {category}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-muted-foreground">No Category</Badge>
          )}
        </div>

        <p className="text-muted-foreground mb-6">{book.description}</p>

        {/* Reviews Section */}
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        <div className="space-y-4">
          {book.reviews?.length > 0 ? (
            book.reviews.map((review, index) => (
              <motion.div
                key={review.id}
                className="border-b border-border pb-4 hover:bg-primary/5 transition-colors duration-300 p-2 rounded"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + 0.1 * index, duration: 0.5 }}
              >
                <div className="flex items-center mb-2">
                  <span className="font-medium mr-2">{review.user}</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-muted-foreground">{review.rating}</span>
                  </div>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-muted-foreground">No reviews available.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

