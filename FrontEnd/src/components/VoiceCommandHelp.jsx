"use client"

import { useState } from "react"
import { Mic, HelpCircle } from "lucide-react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog"
import { ScrollArea } from "./ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

export default function VoiceCommandHelp() {
  const [open, setOpen] = useState(false)

  const globalCommands = [
    { command: "Go to home", description: "Navigate to the homepage" },
    { command: "Open my library", description: "Go to your saved books" },
    { command: "Go to browse", description: "Navigate to browse books page" },
    { command: "Go to categories", description: "Navigate to categories page" },
    { command: "Logout", description: "Sign out of your account" },
  ]

  const homeCommands = [
    { command: "Continue reading", description: "Open your in-progress book" },
    { command: "Show recommendations", description: "Scroll to recommended books" },
    { command: "Show categories", description: "Scroll to categories section" },
    { command: "Show history", description: "Scroll to recently read books" },
  ]

  const browseCommands = [
    { command: "Search for [term]", description: "Search for books by title or author" },
    { command: "Filter by", description: "Open the filters panel" },
    { command: "Sort by newest", description: "Sort books by newest first" },
    { command: "Sort by title", description: "Sort books alphabetically" },
    { command: "Sort by popular", description: "Sort books by most viewed" },
    { command: "Clear filters", description: "Reset all filters" },
    { command: "Open book", description: "Open the first book in results" },
  ]

  const categoryCommands = [
    { command: "Search for [term]", description: "Search for categories or books" },
    { command: "Clear search", description: "Clear the search input" },
    { command: "Show category [name]", description: "Open a specific category" },
    { command: "Close category", description: "Close the category view" },
    { command: "Featured category", description: "Open the featured category" },
  ]

  const libraryCommands = [
    { command: "Show history", description: "Switch to reading history tab" },
    { command: "Show bookmarks", description: "Switch to bookmarks tab" },
    { command: "Search for [term]", description: "Search your library" },
    { command: "Clear search", description: "Clear the search input" },
    { command: "Grid view", description: "Switch to grid view" },
    { command: "List view", description: "Switch to list view" },
    { command: "Sort by recent", description: "Sort by most recent" },
    { command: "Sort by title", description: "Sort alphabetically by title" },
    { command: "Sort by author", description: "Sort by author name" },
  ]

  const bookCommands = [
    { command: "Read this book", description: "Open the book reader" },
    { command: "Bookmark", description: "Add or remove bookmark" },
    { command: "Listen", description: "Play audio version (if available)" },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
      <Button
  variant="outline"
  size="icon"
  className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-40 bg-background border-primary hover:bg-primary/10 hover:text-primary"
>
  <HelpCircle className="h-6 w-6 text-primary" />
</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-primary" />
            Voice Command Help
          </DialogTitle>
          <DialogDescription>
            Use these voice commands to navigate and control the BookAura application.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <Tabs defaultValue="global" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="page">Page Specific</TabsTrigger>
              <TabsTrigger value="book">Book Commands</TabsTrigger>
            </TabsList>
            <TabsContent value="global" className="space-y-4">
              <div className="rounded-md border">
                <div className="bg-muted px-4 py-2 rounded-t-md border-b">
                  <h3 className="font-medium">Global Navigation Commands</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {globalCommands.map((cmd, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-primary">"{cmd.command}"</span>
                        <span className="text-muted-foreground">{cmd.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="page" className="space-y-4">
              <div className="rounded-md border">
                <div className="bg-muted px-4 py-2 rounded-t-md border-b">
                  <h3 className="font-medium">Home Page Commands</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {homeCommands.map((cmd, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-primary">"{cmd.command}"</span>
                        <span className="text-muted-foreground">{cmd.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="bg-muted px-4 py-2 rounded-t-md border-b">
                  <h3 className="font-medium">Browse Page Commands</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {browseCommands.map((cmd, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-primary">"{cmd.command}"</span>
                        <span className="text-muted-foreground">{cmd.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="bg-muted px-4 py-2 rounded-t-md border-b">
                  <h3 className="font-medium">Categories Page Commands</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {categoryCommands.map((cmd, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-primary">"{cmd.command}"</span>
                        <span className="text-muted-foreground">{cmd.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="bg-muted px-4 py-2 rounded-t-md border-b">
                  <h3 className="font-medium">Library Page Commands</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {libraryCommands.map((cmd, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-primary">"{cmd.command}"</span>
                        <span className="text-muted-foreground">{cmd.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="book" className="space-y-4">
              <div className="rounded-md border">
                <div className="bg-muted px-4 py-2 rounded-t-md border-b">
                  <h3 className="font-medium">Book Detail Commands</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {bookCommands.map((cmd, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-primary">"{cmd.command}"</span>
                        <span className="text-muted-foreground">{cmd.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
        <div className="flex justify-end">
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
