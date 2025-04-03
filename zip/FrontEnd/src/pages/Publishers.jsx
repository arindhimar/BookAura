import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { FileText, Edit, Download, Upload } from 'lucide-react'

const agreements = [
  { title: "Publisher Agreement", icon: FileText, color: "text-blue-500", lastUpdated: "Jan 15, 2024" },
  { title: "Author Agreement", icon: FileText, color: "text-green-500", lastUpdated: "Jan 10, 2024" },
  { title: "User Agreement", icon: FileText, color: "text-purple-500", lastUpdated: "Jan 5, 2024" },
  { title: "Content Guidelines", icon: FileText, color: "text-orange-500", lastUpdated: "Feb 1, 2024" },
]

export default function Agreements() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-tight">Manage Agreements</h1>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload New Agreement
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agreements.map((agreement, index) => (
          <Card key={index} className="transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl font-semibold">{agreement.title}</CardTitle>
              <agreement.icon className={`h-6 w-6 ${agreement.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Last updated: {agreement.lastUpdated}</div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

