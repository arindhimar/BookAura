const Notifications = () => {
    const notifications = [
      {
        id: 1,
        type: "like",
        message: "Sarah Anderson liked your reading list",
        time: "2 hours ago",
        isRead: false,
      },
      // Add more notifications as needed
    ]
  
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
          <p className="text-neutral-600">Manage your notification preferences.</p>
        </div>
  
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">Notification Settings</h2>
  
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-800">Email Notifications</h3>
                  <p className="text-sm text-neutral-600">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-neutral-900 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                </label>
              </div>
  
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-800">Push Notifications</h3>
                  <p className="text-sm text-neutral-600">Receive push notifications</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" defaultChecked />
                  <div className="h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-neutral-900 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                </label>
              </div>
            </div>
          </div>
  
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Notifications</h2>
  
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg p-4 ${notification.isRead ? "bg-neutral-50" : "bg-neutral-100"}`}
                >
                  <p className="text-neutral-800">{notification.message}</p>
                  <p className="text-sm text-neutral-500">{notification.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  export default Notifications
  
  