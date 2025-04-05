"use client"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import EnhancedBookGrid from "./EnhancedBookGrid"

const EnhancedRecommendations = ({ recommendedBooks, popularBooks, newReleases }) => {
  // Default books if not provided
  const defaultRecommended = [
    {
      id: "1",
      title: "The Great Adventure",
      author: "Jane Doe",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.5,
      category: "Adventure",
    },
    {
      id: "2",
      title: "Mystery of the Lost City",
      author: "John Smith",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.2,
      category: "Mystery",
    },
    {
      id: "3",
      title: "The Science of Everything",
      author: "Alan Johnson",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.8,
      category: "Science",
    },
    {
      id: "4",
      title: "Cooking Masterclass",
      author: "Maria Garcia",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.6,
      category: "Cooking",
    },
  ]

  const defaultPopular = [
    {
      id: "5",
      title: "The Art of War",
      author: "Sun Tzu",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.9,
      category: "Philosophy",
    },
    {
      id: "6",
      title: "Digital Marketing Strategies",
      author: "Mark Johnson",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.3,
      category: "Business",
    },
    {
      id: "7",
      title: "The Future of AI",
      author: "Sarah Chen",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.7,
      category: "Technology",
    },
    {
      id: "8",
      title: "Healthy Living",
      author: "Dr. Emily Brown",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.4,
      category: "Health",
    },
  ]

  const defaultNewReleases = [
    {
      id: "9",
      title: "Quantum Physics Explained",
      author: "Dr. Richard Feynman",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.6,
      category: "Science",
    },
    {
      id: "10",
      title: "Modern Architecture",
      author: "Frank Lloyd",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.5,
      category: "Architecture",
    },
    {
      id: "11",
      title: "Financial Freedom",
      author: "Robert Kiyosaki",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.4,
      category: "Finance",
    },
    {
      id: "12",
      title: "The Psychology of Success",
      author: "Carol Dweck",
      coverImage: "/placeholder.svg?height=400&width=300",
      rating: 4.7,
      category: "Psychology",
    },
  ]

  const booksToDisplay = {
    recommended: recommendedBooks || defaultRecommended,
    popular: popularBooks || defaultPopular,
    newReleases: newReleases || defaultNewReleases,
  }

  return (
    <Card className="border border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Recommended for You</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recommended" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="recommended">For You</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="newReleases">New Releases</TabsTrigger>
          </TabsList>

          <TabsContent value="recommended" className="mt-0">
            <EnhancedBookGrid books={booksToDisplay.recommended} columns={4} />
          </TabsContent>

          <TabsContent value="popular" className="mt-0">
            <EnhancedBookGrid books={booksToDisplay.popular} columns={4} />
          </TabsContent>

          <TabsContent value="newReleases" className="mt-0">
            <EnhancedBookGrid books={booksToDisplay.newReleases} columns={4} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default EnhancedRecommendations

