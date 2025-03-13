import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import BookDetailsComponent from "../../components/BookDetailsComponent";
import RelatedBooks from "../../components/RelatedBooks";
import { useEffect, useState } from "react";
import Navbar from "../../components/UserNavbar"; // Import Navbar

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [relatedByAuthor, setRelatedByAuthor] = useState([]);
  const [relatedByCategory, setRelatedByCategory] = useState([]);

  useEffect(() => {

    if(!localStorage.getItem("token")) {
      navigate("/");
      return;
    }

    const fetchCurrentBook = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/books/full/${id}`,
          {
            headers: { Authorization: `${localStorage.getItem("token")}` },
            method: "GET",
          }
        );

        if (!response.ok) throw new Error("Failed to fetch book data");

        const data = await response.json();

        setBook(data.book);
        setRelatedByAuthor(data.related_books_by_author || []); 
        setRelatedByCategory(data.related_books_by_category || []);
      } catch (error) {
        console.error(error);
        setBook(null);
      }
    };

    fetchCurrentBook();
  }, [id, navigate]);

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar /> 

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-grow container mx-auto px-4 py-8"
      >
        {/* Back Button */}
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-4 hover:bg-primary/10 transition-colors duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Book Details */}
        <BookDetailsComponent book={book} />

        {/* Pass related books to RelatedBooks component */}
        <RelatedBooks relatedByAuthor={relatedByAuthor} relatedByCategory={relatedByCategory} />
      </motion.div>
    </main>
  );
}
