import { GradientButton } from './ui/GradientButton'

export default function PublisherCTA() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Join BookAura as a Publisher
            </h2>
            <p className="mt-3 max-w-3xl text-lg text-gray-500 dark:text-gray-300">
              Empower your stories to reach a global audience. With BookAura, your publications get the spotlight they deserve. Join us in shaping the future of digital reading.
            </p>
            <div className="mt-8 sm:flex">
              <div className="rounded-md shadow">
                <GradientButton>
                  Become a Publisher
                </GradientButton>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10">
                  Learn More
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-0 lg:grid-cols-2">
            <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50 dark:bg-gray-800">
              <img className="max-h-12" src="/publisher-logo-1.svg" alt="Publisher 1" />
            </div>
            <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50 dark:bg-gray-800">
              <img className="max-h-12" src="/publisher-logo-2.svg" alt="Publisher 2" />
            </div>
            <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50 dark:bg-gray-800">
              <img className="max-h-12" src="/publisher-logo-3.svg" alt="Publisher 3" />
            </div>
            <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50 dark:bg-gray-800">
              <img className="max-h-12" src="/publisher-logo-4.svg" alt="Publisher 4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

