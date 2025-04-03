import { X } from "lucide-react"

export default function DialogHeader({ title, onClose }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 bg-transparent rounded-full p-1 transition-colors duration-200"
      >
        <X size={24} />
      </button>
    </div>
  )
}

