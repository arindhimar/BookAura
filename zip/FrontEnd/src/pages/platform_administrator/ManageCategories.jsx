import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { toast } from "react-toastify"
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function ManageCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({ category_name: "" })
  const [editingCategory, setEditingCategory] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/categories/`, {
        headers: {
          Authorization: ` ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data = await response.json()
    //   console.log(data)
      setCategories(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
      toast.error("Failed to fetch categories")
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/categories/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: ` ${token}`,
        },
        body: JSON.stringify(newCategory),
      })
      if (!response.ok) {
        throw new Error("Failed to add category")
      }
      await fetchCategories()
      setIsAddDialogOpen(false)
      setNewCategory({ category_name: ""})
      toast.success("Category added successfully")
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleEditCategory = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/categories/${editingCategory.category_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: ` ${token}`,
        },
        body: JSON.stringify(editingCategory),
      })
      if (!response.ok) {
        throw new Error("Failed to update category")
      }
      await fetchCategories()
      setIsEditDialogOpen(false)
      setEditingCategory(null)
      toast.success("Category updated successfully")
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/categories/${categoryId}`, {
          method: "DELETE",
          headers: {
            Authorization: ` ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error("Failed to delete category")
        }
        await fetchCategories()
        toast.success("Category deleted successfully")
      } catch (err) {
        toast.error(err.message)
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {/* <TableHead>Description</TableHead> */}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.category_id}>
              <TableCell>{category.category_name}</TableCell>
              {/* <TableCell>{category.description}</TableCell> */}
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingCategory(category)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteCategory(category.category_id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newCategory.category_name}
                  onChange={(e) => setNewCategory({ ...newCategory, category_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCategory}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingCategory?.category_name || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, category_name: e.target.value })}
                  required
                />
              </div>

            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

