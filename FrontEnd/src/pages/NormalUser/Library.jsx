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

    const fetchReadingHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch reading history
        const historyRes = await fetch(`${import.meta.env.VITE_BASE_API_URL}/reading_history/user`, {
          headers: { Authorization: `${token}` },
        });

        if (!historyRes.ok) {
          throw new Error("Failed to fetch reading history");
        }

        const historyData = await historyRes.json();

        // Map the response to match the expected format
        const formattedHistory = historyData.map((historyItem) => ({
          ...historyItem.book_details, // Spread book details
          history_id: historyItem.history_id,
          last_read_at: historyItem.last_read_at,
        }));

        setHistory(formattedHistory);
      } catch (error) {
        console.error("Error fetching reading history:", error);
      }
    };

    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch bookmarks
        const bookmarksRes = await fetch(`${import.meta.env.VITE_BASE_API_URL}/user`, {
          headers: { Authorization: `${token}` },
        });

        if (!bookmarksRes.ok) {
          throw new Error("Failed to fetch bookmarks");
        }

        const bookmarksData = await bookmarksRes.json();

        // Map the response to match the expected format
        const formattedBookmarks = bookmarksData.map((bookmark) => ({
          ...bookmark.book_details, // Spread book details
          bookmark_id: bookmark.bookmark_id,
          created_at: bookmark.created_at,
        }));

        setBookmarks(formattedBookmarks);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      }
    };

    const fetchData = async () => {
      setLoading(true);

      // Fetch reading history and bookmarks
      await Promise.all([fetchReadingHistory(), fetchBookmarks()]);

      setLoading(false);
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
                src={book.coverUrl || "https://marketplace.canva.com/EAFjYY88pEE/1/0/1003w/canva-white%2C-green-and-yellow-minimalist-business-book-cover-cjr8n1BH2lY.jpg"}
                alt={book.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground">{book.author_name || "Unknown Author"}</p>
              {/* <p className="text-sm text-muted-foreground">{book.description || "No description available"}</p> */}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}