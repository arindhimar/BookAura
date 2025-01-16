import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { FileText, Edit } from 'lucide-react'

export default function Agreements() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Agreements</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Publisher Agreement</CardTitle>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <div className="font-medium">Publisher Terms & Conditions</div>
                <div className="text-sm text-muted-foreground">Last updated: Jan 15, 2024</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Author Agreement</CardTitle>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <div className="font-medium">Author Terms & Conditions</div>
                <div className="text-sm text-muted-foreground">Last updated: Jan 10, 2024</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>User Agreement</CardTitle>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-purple-500" />
              <div>
                <div className="font-medium">User Terms & Conditions</div>
                <div className="text-sm text-muted-foreground">Last updated: Jan 5, 2024</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

