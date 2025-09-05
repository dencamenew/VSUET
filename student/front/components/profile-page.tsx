"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { User, Moon, Sun, LogOut, X, Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TimetableResponse {
  zachNumber: string
  groupName: string
  timetable: {
    Числитель: Record<string, Record<string, string>>
    Знаменатель: Record<string, Record<string, string>>
  }
}

interface ProfilePageProps {
  studentId: string
  onLogout: () => void
  onClose: () => void
  onLanguageChange: (language: "ru" | "en") => void
}

// Кеш данных студентов вне компонента
interface StudentCache {
  groupName: string
  timestamp: number
}

const studentDataCache = new Map<string, StudentCache>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

export default function ProfilePage({ studentId, onLogout, onClose, onLanguageChange }: ProfilePageProps) {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [language, setLanguage] = useState<"ru" | "en">("ru")
  const [groupName, setGroupName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const URL = process.env.NEXT_PUBLIC_API_URL

  const fetchStudentData = useCallback(async () => {
    // Проверяем кеш
    const cachedData = studentDataCache.get(studentId)
    const now = Date.now()
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      setGroupName(cachedData.groupName)
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${URL}/info/${studentId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch timetable data")
      }
      const data: TimetableResponse = await response.json()
      setGroupName(data.groupName)
      
      // Сохраняем в кеш
      studentDataCache.set(studentId, {
        groupName: data.groupName,
        timestamp: now
      })
      
      setError(null)
    } catch (err) {
      console.error("Error fetching timetable data:", err)
      setError("Failed to load student data")
    } finally {
      setLoading(false)
    }
  }, [studentId, URL])

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark")
      // Применяем тему сразу
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }

    const savedLanguage = localStorage.getItem("language") as "ru" | "en"
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }

    fetchStudentData()
  }, [fetchStudentData])

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
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
    onLanguageChange(newLanguage)
  }

  const t = {
    ru: {
      profile: "Профиль",
      accountInfo: "Информация об аккаунте",
      accountInfoTitle: "Информация об аккаунте",
      studentId: "Номер зачетки:",
      group: "Группа:",
      settings: "Настройки",
      darkTheme: "Темная тема",
      lightTheme: "Светлая тема",
      language: "Язык:",
      russian: "Русский",
      english: "English",
      change: "Изменить",
      logout: "Выйти из аккаунта",
      loading: "Загрузка...",
      error: "Ошибка загрузки",
      close: "Закрыть",
      retry: "Повторить",
    },
    en: {
      profile: "Profile",
      accountInfo: "Account Information",
      accountInfoTitle: "Account Information",
      studentId: "Student ID:",
      group: "Group:",
      settings: "Settings",
      darkTheme: "Dark Theme",
      lightTheme: "Light Theme",
      language: "Language:",
      russian: "Русский",
      english: "English",
      change: "Change",
      logout: "Logout",
      loading: "Loading...",
      error: "Loading error",
      close: "Close",
      retry: "Retry",
    },
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleRetry = () => {
    setError(null)
    fetchStudentData()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end" onClick={handleOverlayClick}>
        <div className="w-80 h-full bg-card rounded-l-3xl p-6 border-l border-border flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{t[language].loading}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end" onClick={handleOverlayClick}>
        <div className="w-80 h-full bg-card rounded-l-3xl p-6 border-l border-border flex flex-col items-center justify-center">
          <p className="text-destructive mb-4 text-center">{t[language].error}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              {t[language].close}
            </Button>
            <Button onClick={handleRetry}>
              {t[language].retry}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end" onClick={handleOverlayClick}>
      <div className="w-80 h-full bg-card rounded-l-3xl p-6 animate-slide-in-right border-l border-border overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{t[language].profile}</h2>
              <p className="text-muted-foreground text-sm">{t[language].accountInfo}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Account Info */}
        <div className="space-y-6 mb-8">
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <h3 className="text-foreground font-medium mb-3">{t[language].accountInfoTitle}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t[language].studentId}</span>
                <span className="text-foreground font-medium">{studentId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t[language].group}</span>
                <span className="text-foreground font-medium">{groupName || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <h3 className="text-foreground font-medium mb-3">{t[language].settings}</h3>
            <div className="space-y-4">
              {/* Theme Settings */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="text-muted-foreground">
                    {isDarkMode ? t[language].darkTheme : t[language].lightTheme}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-8 w-18 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      isDarkMode ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                        isDarkMode ? "translate-x-10" : "translate-x-1"
                      }`}
                    />
                    <Sun
                      className={`absolute left-2 w-4 h-4 transition-colors ${
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
                  <span className="text-muted-foreground">{t[language].language}</span>
                </div>
                <div className="relative">
                  <button
                    onClick={toggleLanguage}
                    className={`relative inline-flex h-8 w-18 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
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
        <Button
          onClick={onLogout}
          variant="destructive"
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          {t[language].logout}
        </Button>
      </div>
    </div>
  )
}