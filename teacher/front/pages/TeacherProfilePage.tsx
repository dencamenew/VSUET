"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { User, Moon, Sun, LogOut, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { translations, type Language } from "@/lib/translations"
import { useSession } from '@/hooks/useSession'

interface TeacherProfilePageProps {
  teacherName: string
  onLogout: () => void
  onClose: () => void
  onLanguageChange: (language: "ru" | "en") => void
  language: Language
}

interface LogoutResponse {
  message: string
  sessionInvalidated?: boolean
  error?: string
  code?: string
}

export default function TeacherProfilePage({
  teacherName,
  onLogout,
  onClose,
  onLanguageChange,
  language,
}: TeacherProfilePageProps) {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState("")
  const { sessionId, clearSession } = useSession()

  const t = translations[language] || translations.en

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark")
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")

    if (newTheme) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const toggleLanguage = () => {
    const newLanguage = language === "ru" ? "en" : "ru"
    localStorage.setItem("language", newLanguage)
    onLanguageChange(newLanguage)
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setLogoutError("")

    try {
      const response = await fetch("http://localhost:8081/api/auth/logout", {
        method: "POST",
        headers: {
          'X-Session-Id': sessionId || '',
          "Content-Type": "application/json",
        },
      })

      const data: LogoutResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.sessionInvalidated || data.message === "Logout successful") {
        clearSession()
        onLogout()
      } else if (data.message === "No active session found") {
        clearSession()
        onLogout()
      } else {
        setLogoutError(data.message || t.logoutError || "Logout failed")
      }
    } catch (err) {
      setLogoutError(err instanceof Error ? err.message : t.connectionError || "Connection error")
      console.error("Logout error:", err)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end" onClick={handleOverlayClick}>
      <div className="w-80 h-full bg-card rounded-l-3xl p-6 animate-slide-in-right border-l border-border overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center shadow-soft">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{t.profile}</h2>
              <p className="text-muted-foreground text-sm">{t.accountInfo}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Account Info */}
        <div className="space-y-6 mb-8">
          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <h3 className="text-foreground font-medium mb-3">{t.accountInfo}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.teacherName}</span>
                <span className="text-foreground font-medium">{teacherName}</span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <h3 className="text-foreground font-medium mb-3">{t.settings}</h3>
            <div className="space-y-4">
              {/* Theme Settings */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="text-muted-foreground">{isDarkMode ? t.darkTheme : t.lightTheme}</span>
                </div>
                <div className="relative">
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-8 w-18 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-soft ${
                      isDarkMode ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                        isDarkMode ? "translate-x-10" : "translate-x-1"
                      }`}
                    />
                    <Sun
                      className={`absolute left-2 w-4 transition-colors ${
                        !isDarkMode ? "text-yellow-500" : "text-muted-foreground/70"
                      }`}
                    />
                    <Moon
                      className={`absolute right-2 w-4 h-4 transition-colors ${
                        isDarkMode ? "text-white" : "text-muted-foreground/70"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">{t.language}</span>
                </div>
                <div className="relative">
                  <button
                    onClick={toggleLanguage}
                    className={`relative inline-flex h-8 w-18 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-soft ${
                      language === "en" ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                        language === "en" ? "translate-x-10" : "translate-x-1"
                      }`}
                    />
                    <span
                      className={`absolute left-2 text-xs font-semibold transition-colors ${
                        language === "ru" ? "text-white" : "text-muted-foreground/70"
                      }`}
                    >
                      RU
                    </span>
                    <span
                      className={`absolute right-2 text-xs font-semibold transition-colors ${
                        language === "en" ? "text-white" : "text-muted-foreground/70"
                      }`}
                    >
                      EN
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="space-y-2">
          {logoutError && (
            <p className="text-destructive text-sm text-center">{logoutError}</p>
          )}
          <Button
            onClick={handleLogout}
            variant="destructive"
            disabled={isLoggingOut}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg transition-all duration-200"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t.loggingOut || "Logging out..."}
              </>
            ) : (
              <>
                <LogOut className="w-5 h-5" />
                {t.logout}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}