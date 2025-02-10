const Favorites = () => {
    const favorites = [
      {
        id: 1,
        title: "1984",
        author: "George Orwell",
        coverUrl: "/placeholder.svg?height=200&width=150",
        addedDate: "2024-01-15",
      },
      // Add more books as needed
    ]
  
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900">Favorites</h1>
          <p className="text-neutral-600">Your favorite books collection.</p>
        </div>
  
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((book) => (
            <div key={book.id} className="group rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="aspect-[3/4] overflow-hidden rounded-lg">
                <img
                  src={book.coverUrl || "/placeholder.svg"}
                  alt={book.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="font-medium text-neutral-900">{book.title}</h3>
                <p className="text-sm text-neutral-600">{book.author}</p>
                <p className="text-xs text-neutral-500">Added on {new Date(book.addedDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export default Favorites
  
  