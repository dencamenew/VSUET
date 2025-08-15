"use client"

import { useEffect, useState } from "react"
import AuthPage from "@/components/auth-page"
import SchedulePage from "@/components/schedule-page"
import RatingPage from "@/components/rating-page"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"auth" | "schedule" | "rating">("auth")
  const [studentId, setStudentId] = useState<string>("")

  useEffect(() => {
    // Check if user is already logged in
    const savedStudentId = localStorage.getItem("studentId")
    if (savedStudentId) {
      setStudentId(savedStudentId)
      setCurrentPage("schedule")
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
  }

  const handleNavigate = (page: "schedule" | "rating") => {
    setCurrentPage(page)
  }

  if (currentPage === "auth") {
    return <AuthPage onLogin={handleLogin} />
  }

  if (currentPage === "rating") {
    return <RatingPage studentId={studentId} onNavigate={handleNavigate} onLogout={handleLogout} />
  }

  return <SchedulePage studentId={studentId} onNavigate={handleNavigate} onLogout={handleLogout} />
}
