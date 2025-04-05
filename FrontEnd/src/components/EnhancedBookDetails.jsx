"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"
import { BookOpen, Bookmark, Heart, Share2, Star, Clock, Download } from "lucide-react"
import { Separator } from "./ui/separator"
import BookComments from "./BookComments"
import BookReviews from "./BookReviews"
import RelatedBooks from "./RelatedBooks"

const EnhancedBookDetails = ({ book }) => {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [readingProgress, setReadingProgress] = useState(book?.progress || 0)

  // Default book data if not provided
  const defaultBook = {
    id: "1",
    title: "The Great Adventure",
    author: "Jane Doe",
    coverImage: "/placeholder.svg?height=400&width=300",
    rating: 4.5,
    reviewCount: 128,
    description: "An epic journey through uncharted territories, filled with danger, discovery, and personal growth.",
    publishDate: "2023-05-15",
    publisher: "Horizon Publishing",
    pages: 342,
    categories: ["Adventure", "Fiction", "Coming of Age"],
    progress: 35,
  }

  const bookData = book || defaultBook

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleContinueReading = () => {
    // Logic to continue reading
    console.log("Continue reading...")
  }

  const handleDownload = () => {
    // Logic to download the book
    console.log("Downloading book...")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Book Cover and Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <Card className="w-full max-w-[300px] overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={bookData.coverImage || "/placeholder.svg"}
                      alt={bookData.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Card>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    onClick={handleContinueReading}
                    className="bg-primary hover:bg-primary/90 text-white rounded-full px-6"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Read Now
                  </Button>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 w-full max-w-[300px]">
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 mr-2 ${isBookmarked ? "bg-primary/10 border-primary/30 text-primary" : ""}`}
                    onClick={handleBookmark}
                  >
                    <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked ? "fill-primary" : ""}`} />
                    {isBookmarked ? "Bookmarked" : "Bookmark"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex-1 ml-2 ${isLiked ? "bg-red-50 border-red-200 text-red-500" : ""}`}
                    onClick={handleLike}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-red-500" : ""}`} />
                    {isLiked ? "Liked" : "Like"}
                  </Button>
                </div>

                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>

                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>

                {readingProgress > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Reading Progress</span>
                      <span className="font-medium">{readingProgress}%</span>
                    </div>
                    <Progress value={readingProgress} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Book Details and Tabs */}
        <div className="lg:col-span-2">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {bookData.categories.map((category, index) => (
                <Badge key={index} variant="secondary" className="text-xs font-medium">
                  {category}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-2">{bookData.title}</h1>

            <div className="flex items-center mb-4">
              <span className="text-lg text-muted-foreground">by </span>
              <span className="text-lg font-medium ml-1">{bookData.author}</span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="font-medium">{bookData.rating}</span>
                <span className="text-muted-foreground ml-1">({bookData.reviewCount} reviews)</span>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 text-muted-foreground mr-1" />
                <span className="text-muted-foreground">{bookData.pages} pages</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">About this book</h2>
              <p className="text-muted-foreground leading-relaxed">{bookData.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Publisher</h3>
                  <p className="font-medium">{bookData.publisher}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Published Date</h3>
                  <p className="font-medium">
                    {new Date(bookData.publishDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Language</h3>
                  <p className="font-medium">English</p>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <Tabs defaultValue="reviews" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="reviews" className="text-sm">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="comments" className="text-sm">
                  Comments
                </TabsTrigger>
                <TabsTrigger value="related" className="text-sm">
                  Related Books
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reviews" className="mt-0">
                <BookReviews bookId={bookData.id} />
              </TabsContent>

              <TabsContent value="comments" className="mt-0">
                <BookComments bookId={bookData.id} />
              </TabsContent>

              <TabsContent value="related" className="mt-0">
                <RelatedBooks bookId={bookData.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedBookDetails

