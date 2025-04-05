"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Checkbox } from "../../components/ui/checkbox"
import { Switch } from "../../components/ui/switch"
import { Plus, Pencil, Trash, Loader2, AlertCircle } from "lucide-react"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { Badge } from "../../components/ui/badge"

export default function ManageBooks() {
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [isAddBookOpen, setIsAddBookOpen] = useState(false)
  const [isEditBookOpen, setIsEditBookOpen] = useState(false)
  const [newBook, setNewBook] = useState({
    title: "",
    description: "",
    category_ids: [],
    is_public: false,
    file: null,
    coverUrl: "",
    uploaded_by_role: "Publisher",
  })
  const [editingBook, setEditingBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchBooks()
    fetchCategories()
  }, [])

  const fetchBooks = async () => {
    if (localStorage.getItem("token") === null) {
      navigate("/")
      toast.error("You are not authorized to view this page")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/publisher/`, {
        headers: {
          Authorization: token,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch books")
      }

      const data = await response.json()
      setBooks(data)
      setError(null)
    } catch (error) {
      console.error("Error fetching books:", error)
      setError("Failed to load books. Please try again.")
      toast.error("Failed to load books")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/categories/`, {
        headers: {
          Authorization: token,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }

      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to load categories")
    }
  }

  const handleAddBook = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")
      const formData = new FormData()

      // Append all fields
      formData.append("title", newBook.title)
      formData.append("description", newBook.description)
      formData.append("is_public", newBook.is_public)
      formData.append("uploaded_by_role", newBook.uploaded_by_role)
      formData.append("category_ids", JSON.stringify(newBook.category_ids))

      if (newBook.file) {
        formData.append("file", newBook.file)
      }
      if (newBook.coverUrl instanceof File) {
        formData.append("cover", newBook.coverUrl)
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/`, {
        method: "POST",
        headers: {
          Authorization: token,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add book")
      }

      // Reset form
      setNewBook({
        title: "",
        description: "",
        category_ids: [],
        is_public: false,
        file: null,
        coverUrl: "",
        uploaded_by_role: "Publisher",
      })

      await fetchBooks()
      setIsAddBookOpen(false)
      toast.success("Book added successfully")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditBook = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const token = localStorage.getItem("token")
      const formData = new FormData()

      for (const key in editingBook) {
        if (key === "category_ids") {
          formData.append(key, JSON.stringify(editingBook[key]))
        } else if (key !== "file" || (key === "file" && editingBook[key])) {
          formData.append(key, editingBook[key])
        }
      }

      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/${editingBook.book_id}`, {
        method: "PUT",
        headers: {
          Authorization: token,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to update book")
      }

      await fetchBooks()
      setIsEditBookOpen(false)
      setEditingBook(null)
      toast.success("Book updated successfully")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBook = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/${bookId}`, {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to delete book")
        }

        await fetchBooks()
        toast.success("Book deleted successfully")
      } catch (error) {
        toast.error(error.message)
      }
    }
  }

  const handleCategoryChange = (categoryId, isChecked, isNewBook = true) => {
    if (isNewBook) {
      setNewBook((prev) => ({
        ...prev,
        category_ids: isChecked
          ? [...prev.category_ids, categoryId]
          : prev.category_ids.filter((id) => id !== categoryId),
      }))
    } else {
      setEditingBook((prev) => ({
        ...prev,
        category_ids: isChecked
          ? [...prev.category_ids, categoryId]
          : prev.category_ids.filter((id) => id !== categoryId),
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Books</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchBooks}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Books</h1>
        <Button onClick={() => setIsAddBookOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Book
        </Button>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-medium mb-2">No Books Found</h2>
          <p className="text-muted-foreground mb-6">You haven't published any books yet.</p>
          <Button onClick={() => setIsAddBookOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Book
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.book_id}>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell>{book.description ? book.description.substring(0, 50) + "..." : "No description"}</TableCell>
                <TableCell>{book.categories || "Uncategorized"}</TableCell>
                <TableCell>
                  <Badge variant={book.is_approved ? "success" : "warning"}>
                    {book.is_approved ? "Approved" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingBook({
                          ...book,
                          category_ids: book.category_ids || [],
                        })
                        setIsEditBookOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteBook(book.book_id)}>
                      <Trash className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBook}>
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
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Categories</Label>
                <div className="col-span-3 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <div key={category.category_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.category_id}`}
                        checked={newBook.category_ids.includes(category.category_id)}
                        onCheckedChange={(checked) => handleCategoryChange(category.category_id, checked)}
                      />
                      <label htmlFor={`category-${category.category_id}`}>{category.category_name}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="coverUrl" className="text-right">
                  Cover Image
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    id="coverUrl"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewBook({ ...newBook, coverUrl: e.target.files[0] })}
                    className="col-span-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload a high-quality cover image (recommended size: 600x900px). A good cover significantly
                    increases reader interest. Use JPG or PNG format with clear, attractive visuals that represent your
                    book's content.
                  </p>
                  {newBook.coverUrl && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Preview:</p>
                      <img
                        src={
                          newBook.coverUrl instanceof File ? URL.createObjectURL(newBook.coverUrl) : newBook.coverUrl
                        }
                        alt="Cover preview"
                        className="h-40 object-cover rounded-md border border-border"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  File
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.epub,.mobi"
                  onChange={(e) => setNewBook({ ...newBook, file: e.target.files[0] })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_public" className="text-right">
                  Public
                </Label>
                <Switch
                  id="is_public"
                  checked={newBook.is_public}
                  onCheckedChange={(checked) => setNewBook({ ...newBook, is_public: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddBookOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Book"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditBookOpen} onOpenChange={setIsEditBookOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditBook}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  value={editingBook?.title || ""}
                  onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingBook?.description || ""}
                  onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Categories</Label>
                <div className="col-span-3 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <div key={category.category_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-category-${category.category_id}`}
                        checked={editingBook?.category_ids?.includes(category.category_id)}
                        onCheckedChange={(checked) => handleCategoryChange(category.category_id, checked, false)}
                      />
                      <label htmlFor={`edit-category-${category.category_id}`}>{category.category_name}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-coverUrl" className="text-right">
                  Cover Image
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    id="edit-coverUrl"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditingBook({ ...editingBook, coverUrl: e.target.files[0] })}
                    className="col-span-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload a high-quality cover image (recommended size: 600x900px). A good cover significantly
                    increases reader interest. Use JPG or PNG format with clear, attractive visuals that represent your
                    book's content.
                  </p>
                  {editingBook?.coverUrl && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Current cover:</p>
                      <img
                        src={
                          editingBook.coverUrl instanceof File
                            ? URL.createObjectURL(editingBook.coverUrl)
                            : `${import.meta.env.VITE_BASE_API_URL}/books/${editingBook.coverUrl}`
                        }
                        alt="Cover preview"
                        className="h-40 object-cover rounded-md border border-border"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-file" className="text-right">
                  File
                </Label>
                <Input
                  id="edit-file"
                  type="file"
                  accept=".pdf,.epub,.mobi"
                  onChange={(e) => setEditingBook({ ...editingBook, file: e.target.files[0] })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-is_public" className="text-right">
                  Public
                </Label>
                <Switch
                  id="edit-is_public"
                  checked={editingBook?.is_public || false}
                  onCheckedChange={(checked) => setEditingBook({ ...editingBook, is_public: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditBookOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Book"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

