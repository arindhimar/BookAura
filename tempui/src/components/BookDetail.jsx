import { Share2, Bookmark } from "lucide-react"

function BookDetail() {
  return (
    <div className="mt-8">
      <div className="text-sm breadcrumbs mb-8">
        <span className="text-amber-900">To catalog</span>
        <span className="mx-2">←</span>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <img src="/placeholder.svg" alt="The Chronicles of Wisdom" className="w-full h-auto" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <span>Hardback</span>
              <span className="font-bold">$25</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <span>Digital</span>
              <span className="font-bold">$20</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <span>Audio</span>
              <span className="font-bold">$25</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-amber-900">The Chronicles of Wisdom</h1>
            <div className="flex items-center space-x-2">
              <span className="text-amber-900">By Sarah Anderson</span>
              <span>|</span>
              <div className="flex items-center">
                <span>5</span>
                <span className="text-amber-400">★</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-amber-900">Original</h3>
                <p>The Chronicles of Wisdom</p>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Format</h3>
                <p>170x215 mm</p>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Number of pages</h3>
                <p>368</p>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Year of issue</h3>
                <p>2023</p>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">ISBN</h3>
                <p>5-355-01395-5</p>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Circulation</h3>
                <p>15000</p>
              </div>
            </div>

            <button className="text-amber-900 flex items-center">
              More info <span className="ml-2">↓</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-amber-100 rounded-lg">
              <p className="text-amber-900">Dispatch from US in 3-5 business days</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-amber-900">$25</span>
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-amber-100 rounded-full">
                  <Share2 className="h-5 w-5 text-amber-900" />
                </button>
                <button className="p-2 hover:bg-amber-100 rounded-full">
                  <Bookmark className="h-5 w-5 text-amber-900" />
                </button>
                <button className="px-6 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800">Add to cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetail

