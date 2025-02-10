const Profile = () => {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
          <p className="text-neutral-600">Manage your account settings and preferences.</p>
        </div>
  
        <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-neutral-100">
              <img
                src="/placeholder.svg?height=80&width=80"
                alt="Profile"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">John Doe</h2>
              <p className="text-neutral-600">john.doe@example.com</p>
            </div>
          </div>
  
          <div className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-neutral-600">Full Name</label>
                <input
                  type="text"
                  value="John Doe"
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-neutral-600">Email</label>
                <input
                  type="email"
                  value="john.doe@example.com"
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-neutral-600">Username</label>
                <input
                  type="text"
                  value="johndoe"
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-neutral-600">Location</label>
                <input
                  type="text"
                  value="New York, USA"
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2"
                />
              </div>
            </div>
  
            <div>
              <label className="text-sm text-neutral-600">Bio</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2"
                rows="4"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>
  
            <div className="flex justify-end">
              <button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  export default Profile
  
  