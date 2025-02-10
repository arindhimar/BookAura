const ChangePassword = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900">Change Password</h1>
          <p className="text-neutral-600">Update your password to keep your account secure.</p>
        </div>
  
        <div className="max-w-md rounded-lg bg-white p-6 shadow-sm">
          <form className="space-y-4">
            <div>
              <label className="text-sm text-neutral-600">Current Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2"
                placeholder="Enter current password"
              />
            </div>
  
            <div>
              <label className="text-sm text-neutral-600">New Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2"
                placeholder="Enter new password"
              />
            </div>
  
            <div>
              <label className="text-sm text-neutral-600">Confirm New Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2"
                placeholder="Confirm new password"
              />
            </div>
  
            <div className="pt-2">
              <button type="submit" className="w-full rounded-lg bg-neutral-900 py-2 text-white hover:bg-neutral-800">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
  
  export default ChangePassword
  
  