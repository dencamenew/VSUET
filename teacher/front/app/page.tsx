"use client"
import { useState, useEffect } from "react"
import TeacherAuthPage from "../pages/TeacherAuthPage"
import TeacherSchedulePage from "../pages/TeacherSchedulePage"
import TeacherRatingPage from "../pages/TeacherRatingPage"
import TeacherAttendancePage from "../pages/TeacherAttendancePage"
import TeacherProfilePage from "../pages/TeacherProfilePage"
import type { Language } from "../lib/translations"

// Добавьте интерфейс для данных групп и предметов
export interface GroupSubjects {
  [groupName: string]: {
    [subjectName: string]: string[]
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [teacherName, setTeacherName] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [groupsSubjects, setGroupsSubjects] = useState<GroupSubjects>({})
  const [currentPage, setCurrentPage] = useState<"schedule" | "rating" | "attendance">("schedule")
  const [showProfile, setShowProfile] = useState(false)
  const [language, setLanguage] = useState<Language>("ru")

  useEffect(() => {
    // Загрузка сохраненного языка
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    } else {
      localStorage.setItem("language", "ru")
    }

    // Установка темы
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark" || savedTheme === null) {
      document.documentElement.classList.add("dark")
      if (savedTheme === null) {
        localStorage.setItem("theme", "dark")
      }
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const handleLogin = (name: string, sessionId: string, groupsData: GroupSubjects) => {
    setTeacherName(name)
    setSessionId(sessionId)
    setGroupsSubjects(groupsData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setTeacherName("")
    setSessionId("")
    setGroupsSubjects({})
    setCurrentPage("schedule")
    setShowProfile(false)
    resetSettingsToDefault()
  }

  const resetSettingsToDefault = () => {
    setLanguage("ru")
    localStorage.setItem("language", "ru")
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
          groupsSubjects={groupsSubjects}
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