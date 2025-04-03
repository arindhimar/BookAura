"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ThumbsUp, Edit2, Trash2, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Pagination } from "./ui/pagination"

function Comment({ comment, onEdit, onDelete, onLike, onReply, isReply = false }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)

  const handleSave = async () => {
    try {
      await onEdit(comment.id, editedContent)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating comment:", error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg bg-card ${isReply ? "ml-12" : ""}`}
    >
      <div className="flex items-start gap-4">
        <Avatar>
          <AvatarImage src={comment.avatar || "/placeholder.svg?height=40&width=40"} />
          <AvatarFallback>{comment.user[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{comment.user}</h4>
              <p className="text-sm text-muted-foreground">{new Date(comment.timestamp).toLocaleDateString()}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(comment.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-foreground">{comment.content}</p>
          )}
          <div className="mt-2 flex items-center gap-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => onLike(comment.id)}>
              <ThumbsUp className="h-4 w-4" />
              {comment.likes}
            </Button>
            {!isReply && (
              <Button variant="ghost" size="sm" onClick={() => onReply(comment.id)}>
                Reply
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function BookComments({ bookId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState(null)

  const commentsPerPage = 5
  const totalPages = Math.ceil(comments.length / commentsPerPage)

  const paginatedComments = comments.slice((page - 1) * commentsPerPage, page * commentsPerPage)

  const handleAddComment = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/${bookId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: newComment,
          parentId: replyTo,
        }),
      })

      if (!response.ok) throw new Error("Failed to add comment")

      const data = await response.json()
      setComments((prev) => [...prev, data])
      setNewComment("")
      setReplyTo(null)
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleEditComment = async (id, content) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/${bookId}/comments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) throw new Error("Failed to update comment")

      const data = await response.json()
      setComments((prev) =>
        prev.map((comment) => (comment.id === id ? { ...comment, content: data.content } : comment)),
      )
    } catch (error) {
      console.error("Error updating comment:", error)
    }
  }

  const handleDeleteComment = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/${bookId}/comments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) throw new Error("Failed to delete comment")

      setComments((prev) => prev.filter((comment) => comment.id !== id))
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const handleLikeComment = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/books/${bookId}/comments/${id}/like`, {
        method: "POST",
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) throw new Error("Failed to like comment")

      const data = await response.json()
      setComments((prev) => prev.map((comment) => (comment.id === id ? { ...comment, likes: data.likes } : comment)))
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  if (loading) {
    return <div className="text-center">Loading comments...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>
  }

  return (
    <motion.div
      key="comments"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Textarea
          placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex justify-end gap-2">
          {replyTo && (
            <Button variant="outline" onClick={() => setReplyTo(null)}>
              Cancel Reply
            </Button>
          )}
          <Button onClick={handleAddComment}>{replyTo ? "Post Reply" : "Post Comment"}</Button>
        </div>
      </div>

      {paginatedComments.map((comment) => (
        <div key={comment.id} className="space-y-4">
          <Comment
            comment={comment}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
            onLike={handleLikeComment}
            onReply={(id) => setReplyTo(id)}
          />
          {comment.replies?.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onLike={handleLikeComment}
              isReply
            />
          ))}
        </div>
      ))}

      {totalPages > 1 && (
        <Pagination className="mt-4" currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </motion.div>
  )
}

