"use client"

import { useEffect, useState } from "react"
import AuthPage from "@/components/auth-page"
import SchedulePage from "@/components/schedule-page"
import RatingPage from "@/components/rating-page"
import ProfilePage from "@/components/profile-page"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"auth" | "schedule" | "rating">("auth")
  const [showProfile, setShowProfile] = useState(false)
  const [studentId, setStudentId] = useState<string>("")
  const [language, setLanguage] = useState<"ru" | "en">("ru")

  useEffect(() => {
    const savedStudentId = localStorage.getItem("studentId")
    if (savedStudentId) {
      setStudentId(savedStudentId)
      setCurrentPage("schedule")
    }

    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark")
    } else {
      document.documentElement.classList.add("dark")
    }

    const savedLanguage = localStorage.getItem("language") as "ru" | "en"
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleLogin = (id: string) => {
    setStudentId(id)
    localStorage.setItem("studentId", id)
    setCurrentPage("schedule")
  }

  const handleLogout = () => {
    localStorage.removeItem("studentId")
    setStudentId("")
    setCurrentPage("auth")
    setShowProfile(false)
  }

  const handleNavigate = (page: "schedule" | "rating") => {
    setCurrentPage(page)
  }

  const handleShowProfile = () => {
    setShowProfile(true)
  }

  const handleCloseProfile = () => {
    setShowProfile(false)
  }

  const handleLanguageChange = (newLanguage: "ru" | "en") => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  if (currentPage === "auth") {
    return <AuthPage onLogin={handleLogin} language={language} />
  }

  return (
    <>
      {currentPage === "rating" ? (
        <RatingPage
          studentId={studentId}
          onNavigate={handleNavigate}
          onShowProfile={handleShowProfile}
          language={language}
        />
      ) : (
        <SchedulePage
          studentId={studentId}
          onNavigate={handleNavigate}
          onShowProfile={handleShowProfile}
          language={language}
        />
      )}

      {showProfile && (
        <ProfilePage
          studentId={studentId}
          onLogout={handleLogout}
          onClose={handleCloseProfile}
          onLanguageChange={handleLanguageChange}
        />
      )}
    </>
  )
}
