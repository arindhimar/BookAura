import { Button } from "../ui/button"
import { PublisherTable } from "@/components/publishers/PublisherTable"
import { Plus } from 'lucide-react'

export default function Publishers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Publishers</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Publisher
        </Button>
      </div>
      
      <div className="space-y-4">
        <PublisherTable />
      </div>
    </div>
  )
}

