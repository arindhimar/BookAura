import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Clock, Bookmark } from "lucide-react";
import UserNavbar from "../../components/UserNavbar";
import { useNavigate } from "react-router-dom";

const tabs = [
  { id: "history", label: "Reading History", icon: Clock },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
];

export default function Library() {
  const [activeTab, setActiveTab] = useState("history");
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }

    const fetchBookDetails = async (bookIds) => {
      const token = localStorage.getItem("token");

      const bookRequests = bookIds.map((bookId) =>
        fetch(`${import.meta.env.VITE_BASE_API_URL}/books/${bookId}`, {
          headers: { Authorization: `${token}` },
        }).then((res) => res.json())
      );

      return Promise.all(bookRequests);
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const [historyRes, bookmarksRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BASE_API_URL}/reading_history/user`, {
            headers: { Authorization: `${token}` },
          }),
          fetch(`${import.meta.env.VITE_BASE_API_URL}/bookmarks/user`, {
            headers: { Authorization: `${token}` },
          }),
        ]);

        if (!historyRes.ok || !bookmarksRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [historyData, bookmarksData] = await Promise.all([
          historyRes.json(),
          bookmarksRes.json(),
        ]);

        // Extract book IDs
        const historyBookIds = historyData.map((item) => item.book_id);
        const bookmarksBookIds = bookmarksData.map((item) => item.book_id);

        // Fetch book details
        const [historyBooks, bookmarkBooks] = await Promise.all([
          fetchBookDetails(historyBookIds),
          fetchBookDetails(bookmarksBookIds),
        ]);

        setHistory(historyBooks);
        setBookmarks(bookmarkBooks);
      } catch (error) {
        console.error("Error fetching library data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gradient">My Library</h1>
          <p className="text-lg text-muted-foreground">Track your reading journey and manage your books</p>
        </motion.div>

        <Tabs defaultValue="history" className="mb-8">
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

          <TabsContent value="history">
            <BookGrid books={history} loading={loading} title="Reading History" navigate={navigate} />
          </TabsContent>

          <TabsContent value="bookmarks">
            <BookGrid books={bookmarks} loading={loading} title="Bookmarks" navigate={navigate} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function BookGrid({ books, loading, title, navigate }) {
  if (loading) {
    return <p className="text-center text-muted-foreground">Loading {title}...</p>;
  }

  if (!books.length) {
    return <p className="text-center text-muted-foreground">No books in {title}.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {books.map((book, index) => (
        <motion.div
          key={book.book_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="modern-card group cursor-pointer">
            <div
              className="relative aspect-[3/4] overflow-hidden rounded-t-2xl"
              onClick={() => navigate(`/book/${book.book_id}`)}
            >
              <img
                src={book.cover || "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg"}
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
  );
}
