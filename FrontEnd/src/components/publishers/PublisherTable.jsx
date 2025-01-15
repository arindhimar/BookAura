import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Badge } from "@/components/ui/badge"
  import { Button } from "@/components/ui/button"
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { MoreHorizontal, Flag } from 'lucide-react'
  
  const publishers = [
    {
      id: "1",
      name: "John Publisher",
      email: "john@publisher.com",
      status: "pending",
      contentCount: 5,
      joinDate: "2024-01-15",
    },
    {
      id: "2",
      name: "Sarah Books",
      email: "sarah@books.com",
      status: "active",
      contentCount: 12,
      joinDate: "2024-01-10",
    },
  ]
  
  export function PublisherTable() {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publishers.map((publisher) => (
              <TableRow key={publisher.id}>
                <TableCell className="font-medium">
                  <div>
                    <div>{publisher.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {publisher.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={publisher.status === "active" ? "success" : "secondary"}
                  >
                    {publisher.status}
                  </Badge>
                </TableCell>
                <TableCell>{publisher.contentCount}</TableCell>
                <TableCell>{publisher.joinDate}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>View Content</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Flag className="mr-2 h-4 w-4" />
                        Flag Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
  
  