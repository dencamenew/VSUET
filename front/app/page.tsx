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

  if (currentPage === "auth") {
    return <AuthPage onLogin={handleLogin} />
  }

  return (
    <>
      {currentPage === "rating" ? (
        <RatingPage studentId={studentId} onNavigate={handleNavigate} onShowProfile={handleShowProfile} />
      ) : (
        <SchedulePage studentId={studentId} onNavigate={handleNavigate} onShowProfile={handleShowProfile} />
      )}

      {showProfile && <ProfilePage studentId={studentId} onLogout={handleLogout} onClose={handleCloseProfile} />}
    </>
  )
}
