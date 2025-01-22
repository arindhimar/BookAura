import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Plus, Pencil, Trash } from "lucide-react"

const initialBooks = [
  { id: 1, title: "The Great Adventure", author: "John Doe", status: "Published", sales: 1500 },
  { id: 2, title: "Mystery of the Lost City", author: "Jane Smith", status: "Draft", sales: 0 },
  { id: 3, title: "Cooking Masterclass", author: "Chef Gordon", status: "Published", sales: 2200 },
]

export default function ManageBooks() {
  const [books, setBooks] = useState(initialBooks)
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  const [newBook, setNewBook] = useState({ title: "", author: "", status: "Draft" })

  const handleAddBook = () => {
    setBooks([...books, { ...newBook, id: books.length + 1, sales: 0 }])
    setIsAddBookOpen(false)
    setNewBook({ title: "", author: "", status: "Draft" })
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Books</h1>
        <Button onClick={() => setIsAddBookOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Book
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sales</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell className="font-medium">{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>{book.status}</TableCell>
              <TableCell>{book.sales}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash className="h-4 w-4 mr-1" /> Delete
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
              <Label htmlFor="author" className="text-right">
                Author
              </Label>
              <Input
                id="author"
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
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

