import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Star } from "lucide-react"

const reviews = [
  { id: 1, book: "The Art of Writing", reviewer: "John Doe", rating: 5, comment: "Excellent book! Very insightful." },
  { id: 2, book: "Midnight Tales", reviewer: "Jane Smith", rating: 4, comment: "Thrilling and captivating." },
  { id: 3, book: "Love in Paris", reviewer: "Mike Johnson", rating: 3, comment: "Good story, but predictable ending." },
]

export default function Reviews() {
  const averageRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Reviews</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating}</div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(averageRating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Book</TableHead>
            <TableHead>Reviewer</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell className="font-medium">{review.book}</TableCell>
              <TableCell>{review.reviewer}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {review.rating} <Star className="h-3 w-3 ml-1 inline" />
                </Badge>
              </TableCell>
              <TableCell>{review.comment}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

