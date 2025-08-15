"use client"

import { useState, useEffect } from "react"
import { User, Moon, Sun, LogOut, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProfilePageProps {
  studentId: string
  onLogout: () => void
  onClose: () => void
}

export default function ProfilePage({ studentId, onLogout, onClose }: ProfilePageProps) {
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")

    // Apply theme to document
    if (newTheme) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Generate group number based on student ID (mock logic)
  const getGroupNumber = (id: string) => {
    const lastDigit = Number.parseInt(id.slice(-1)) || 1
    return `МПол24-${lastDigit}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
      <div className="w-80 h-full bg-card rounded-l-3xl p-6 animate-slide-in-right border-l border-border overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Профиль</h2>
              <p className="text-muted-foreground text-sm">Информация об аккаунте</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Account Info */}
        <div className="space-y-6 mb-8">
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <h3 className="text-foreground font-medium mb-3">Информация об аккаунте</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Номер зачетки:</span>
                <span className="text-foreground font-mono">{studentId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Группа:</span>
                <span className="text-foreground">{getGroupNumber(studentId)}</span>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <h3 className="text-foreground font-medium mb-3">Настройки</h3>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
                <span className="text-muted-foreground">{isDarkMode ? "Темная тема" : "Светлая тема"}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-primary hover:text-primary/80">
                Изменить
              </Button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={onLogout}
          variant="destructive"
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  )
}
