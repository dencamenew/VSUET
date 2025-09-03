"use client"
import { useState, useEffect } from "react"
import TeacherAuthPage from "../pages/TeacherAuthPage"
import TeacherSchedulePage from "../pages/TeacherSchedulePage"
import TeacherRatingPage from "../pages/TeacherRatingPage"
import TeacherAttendancePage from "../pages/TeacherAttendancePage"
import TeacherProfilePage from "../pages/TeacherProfilePage"
import type { Language } from "../lib/translations"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [teacherName, setTeacherName] = useState("")
  const [currentPage, setCurrentPage] = useState<"schedule" | "rating" | "attendance">("schedule")
  const [showProfile, setShowProfile] = useState(false)
  const [language, setLanguage] = useState<Language>("ru") // По умолчанию русский

  useEffect(() => {
    // Загрузка сохраненного языка
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    } else {
      // Если язык не сохранен, устанавливаем русский по умолчанию
      localStorage.setItem("language", "ru")
    }

    // Установка темы
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark" || savedTheme === null) {
      // Если тема не установлена или установлена темная - применяем темную
      document.documentElement.classList.add("dark")
      if (savedTheme === null) {
        localStorage.setItem("theme", "dark") // Сохраняем темную тему по умолчанию
      }
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const handleLogin = (name: string) => {
    setTeacherName(name)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setTeacherName("")
    setCurrentPage("schedule")
    setShowProfile(false)

    // Сброс настроек к значениям по умолчанию
    resetSettingsToDefault()
  }

  const resetSettingsToDefault = () => {
    // Сброс языка на русский
    setLanguage("ru")
    localStorage.setItem("language", "ru")

    // Сброс темы на темную
    document.documentElement.classList.add("dark")
    localStorage.setItem("theme", "dark")
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  if (!isAuthenticated) {
    return <TeacherAuthPage onLogin={handleLogin} language={language} />
  }

  return (
    <div className="min-h-screen bg-background">
      {currentPage === "schedule" && (
        <TeacherSchedulePage
          teacherName={teacherName}
          onNavigate={setCurrentPage}
          onShowProfile={() => setShowProfile(true)}
          language={language}
        />
      )}
      {currentPage === "rating" && (
        <TeacherRatingPage
          teacherName={teacherName}
          onNavigate={setCurrentPage}
          onShowProfile={() => setShowProfile(true)}
          language={language}
        />
      )}
      {currentPage === "attendance" && (
        <TeacherAttendancePage
          teacherName={teacherName}
          onNavigate={setCurrentPage}
          onShowProfile={() => setShowProfile(true)}
          language={language}
        />
      )}
      {showProfile && (
        <TeacherProfilePage
          teacherName={teacherName}
          onLogout={handleLogout}
          onClose={() => setShowProfile(false)}
          onLanguageChange={handleLanguageChange}
          language={language}
        />
      )}
    </div>
  )
}

export default App
