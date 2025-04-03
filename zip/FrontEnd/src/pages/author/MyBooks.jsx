import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Plus, Pencil, Eye } from "lucide-react"

const initialBooks = [
  { id: 1, title: "The Art of Writing", genre: "Non-fiction", status: "Published", rating: 4.5 },
  { id: 2, title: "Midnight Tales", genre: "Horror", status: "Draft", rating: 0 },
  { id: 3, title: "Love in Paris", genre: "Romance", status: "Published", rating: 4.2 },
]

export default function MyBooks() {
  const [books, setBooks] = useState(initialBooks)
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  const [newBook, setNewBook] = useState({ title: "", genre: "", status: "Draft" })

  const handleAddBook = () => {
    setBooks([...books, { ...newBook, id: books.length + 1, rating: 0 }])
    setIsAddBookOpen(false)
    setNewBook({ title: "", genre: "", status: "Draft" })
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Books</h1>
        <Button onClick={() => setIsAddBookOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Book
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell className="font-medium">{book.title}</TableCell>
              <TableCell>{book.genre}</TableCell>
              <TableCell>{book.status}</TableCell>
              <TableCell>{book.rating > 0 ? book.rating.toFixed(1) : "N/A"}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newBook.title}
                onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="genre" className="text-right">
                Genre
              </Label>
              <Input
                id="genre"
                value={newBook.genre}
                onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddBook}>Add Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

