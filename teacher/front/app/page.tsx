"use client"

import { useState, useEffect } from "react"
import TeacherAuthPage from "../pages/TeacherAuthPage"
import TeacherSchedulePage from "../pages/TeacherSchedulePage"
import TeacherRatingPage from "../pages/TeacherRatingPage"
import TeacherAttendancePage from "../pages/TeacherAttendancePage"
import TeacherProfilePage from "../pages/TeacherProfilePage"
import type { Language } from "../lib/translations"
import { useSession } from '@/hooks/useSession'

// Интерфейс для данных групп и предметов
export interface GroupSubjects {
  [groupName: string]: string[]
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [teacherName, setTeacherName] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [groupsSubjects, setGroupsSubjects] = useState<GroupSubjects>({})
  const [currentPage, setCurrentPage] = useState<"schedule" | "rating" | "attendance">("schedule")
  const [showProfile, setShowProfile] = useState(false)
  const [language, setLanguage] = useState<Language>("ru")

<<<<<<< HEAD
  const URL = "http://localhost:8081/api"
=======
  const URL = "https://teacherbackend1.cloudpub.ru/api"
>>>>>>> teacher

  useEffect(() => {
    // Загрузка сохраненного языка
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    } else {
      localStorage.setItem("language", "ru")
    }

    // Проверка активной сессии при загрузке
    const savedSessionId = localStorage.getItem("sessionId")
    if (savedSessionId) {
      checkSessionValidity(savedSessionId)
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

  const checkSessionValidity = async (sessionIdToCheck: string) => {
    try {
      const response = await fetch(`${URL}/auth/check`, {
        headers: {
          'X-Session-Id': sessionIdToCheck
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          // Сессия валидна, восстанавливаем состояние
          setTeacherName(data.teacherName)
          setSessionId(sessionIdToCheck)
          setIsAuthenticated(true)
          
          // Можно также загрузить группы и предметы если они возвращаются в check
          if (data.groupsSubjects) {
            setGroupsSubjects(data.groupsSubjects)
          }
        } else {
          // Сессия невалидна, очищаем
          localStorage.removeItem("sessionId")
        }
      }
    } catch (error) {
      console.error('Session check failed:', error)
      localStorage.removeItem("sessionId")
    }
  }

  const handleLogin = (name: string, newSessionId: string, groupsData: GroupSubjects) => {
    setTeacherName(name)
    setSessionId(newSessionId)
    setGroupsSubjects(groupsData)
    setIsAuthenticated(true)
    
    // Сохраняем sessionId в localStorage
    localStorage.setItem("sessionId", newSessionId)
  }

  const handleLogout = () => {
    // Очищаем сессию на сервере
    logoutFromServer()
    
    // Очищаем локальное состояние
    setIsAuthenticated(false)
    setTeacherName("")
    setSessionId("")
    setGroupsSubjects({})
    setCurrentPage("schedule")
    setShowProfile(false)
    
    // Очищаем localStorage
    localStorage.removeItem("sessionId")
    
    // Сбрасываем настройки к дефолтным (опционально)
    resetSettingsToDefault()
  }

  const logoutFromServer = async () => {
    try {
      await fetch(`${URL}/auth/logout`, {
        method: "POST",
        headers: {
          'X-Session-Id': sessionId,
          "Content-Type": "application/json",
        },
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const resetSettingsToDefault = () => {
    // Язык оставляем как был, только сбрасываем тему
    document.documentElement.classList.add("dark")
    localStorage.setItem("theme", "dark")
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  // Функция для получения заголовков аутентификации
  const getAuthHeaders = (): HeadersInit => {
    if (!sessionId) return { 'Content-Type': 'application/json' }
    
    return {
      'X-Session-Id': sessionId,
      'Content-Type': 'application/json'
    }
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
          sessionId={sessionId}
          getAuthHeaders={getAuthHeaders}
        />
      )}
      {currentPage === "rating" && (
        <TeacherRatingPage
          teacherName={teacherName}
          onNavigate={setCurrentPage}
          onShowProfile={() => setShowProfile(true)}
          language={language}
          sessionId={sessionId}
          getAuthHeaders={getAuthHeaders}
        />
      )}
      {currentPage === "attendance" && (
        <TeacherAttendancePage
          teacherName={teacherName}
          groupsSubjects={groupsSubjects}
          onNavigate={setCurrentPage}
          onShowProfile={() => setShowProfile(true)}
          language={language}
          sessionId={sessionId}
          getAuthHeaders={getAuthHeaders}
        />
      )}
      {showProfile && (
        <TeacherProfilePage
          teacherName={teacherName}
          onLogout={handleLogout}
          onClose={() => setShowProfile(false)}
          onLanguageChange={handleLanguageChange}
          language={language}
          sessionId={sessionId}
        />
      )}
    </div>
  )
}

export default App