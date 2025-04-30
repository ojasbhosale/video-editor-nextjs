// components/header.tsx
"use client"

import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon, Film, Settings } from "lucide-react"
import { useTheme } from "next-themes"

export default function Header() {
  const { setTheme, theme } = useTheme()

  return (
    <header className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800 mb-4">
      <div className="flex items-center">
        <div className="bg-blue-500 p-3 rounded-lg mr-4 shadow-md">
          <Film className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Move 37 Productions
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Professional video editing in your browser
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button variant="outline" size="icon" className="rounded-full border-gray-300 dark:border-gray-700">
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <span className="sr-only">Settings</span>
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full border-gray-300 dark:border-gray-700"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <SunIcon className="h-5 w-5 text-amber-500" /> : <MoonIcon className="h-5 w-5 text-blue-600" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  )
}
