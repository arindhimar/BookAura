"use client"

import { Moon, Sun, Laptop, Palette } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { motion } from "framer-motion"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { name: "light", icon: Sun, color: "bg-orange-400" },
    { name: "dark", icon: Moon, color: "bg-blue-900" },
    { name: "system", icon: Laptop, color: "bg-gray-400" },
  ]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors duration-300">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass">
        {themes.map(({ name, icon: Icon, color }) => (
          <DropdownMenuItem
            key={name}
            onClick={() => setTheme(name)}
            className="group cursor-pointer relative flex items-center"
          >
            <div className={`mr-2 h-4 w-4 rounded-full ${color}`} />
            <span className="capitalize">{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
