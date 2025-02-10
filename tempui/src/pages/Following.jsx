const Following = () => {
    const following = [
      {
        id: 1,
        name: "Sarah Anderson",
        username: "@sarahanderson",
        avatar: "/placeholder.svg?height=64&width=64",
        bio: "Book lover | Fantasy & Sci-Fi enthusiast",
        followedDate: "2024-01-20",
      },
      // Add more users as needed
    ]
  
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900">Following</h1>
          <p className="text-neutral-600">People you follow and their reading activities.</p>
        </div>
  
        <div className="space-y-4">
          {following.map((user) => (
            <div key={user.id} className="flex items-start gap-4 rounded-lg bg-white p-4 shadow-sm">
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-900">{user.name}</h3>
                    <p className="text-sm text-neutral-600">{user.username}</p>
                  </div>
                  <button className="rounded-lg bg-neutral-100 px-3 py-1 text-sm text-neutral-600 hover:bg-neutral-200">
                    Unfollow
                  </button>
                </div>
                <p className="text-sm text-neutral-600">{user.bio}</p>
                <p className="text-xs text-neutral-500">
                  Following since {new Date(user.followedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export default Following
  
  