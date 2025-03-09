import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function RelatedBooks({ relatedByAuthor = [], relatedByCategory = [] }) {
  // Combine and deduplicate related books
  const relatedBooks = [...relatedByAuthor, ...relatedByCategory].reduce((acc, current) => {
    if (!acc.find(item => item.book_id === current.book_id)) {
      acc.push(current)
    }
    
    return acc
  }, [])

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>

      {relatedBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedBooks.map((relatedBook, index) => (
            <motion.div
              key={relatedBook.book_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <img
                  src={relatedBook.cover || "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg"}
                  alt={relatedBook.title}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{relatedBook.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {relatedBook.author_name || "Unknown Author"}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/book/${relatedBook.book_id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No related books found</p>
      )}
    </section>
  )
}
