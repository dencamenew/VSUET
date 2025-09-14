"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { translations, type Language } from "@/lib/translations"

interface AuthPageProps {
  onLogin: (studentId: string) => void
  language: Language
}

interface StudentInfo {
  zachNumber: string
  groupName: string
  ratings: any[]
  timetable: any
}

export default function AuthPage({ onLogin, language }: AuthPageProps) {
  const [studentId, setStudentId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  const t = translations[language]

  const URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const checkStudentExists = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${URL}/info/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 0) {
        throw new Error('Network error: Cannot connect to server')
      }

      if (response.status === 404) {
        return false
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: StudentInfo = await response.json()
      
      return data !== null && 
            data.zachNumber !== undefined && 
            data.zachNumber !== null &&
            data.zachNumber.trim() !== ""
    } catch (error) {
      console.error("Error checking student:", error)
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please make sure the backend is running.')
      }
      
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId.trim()) return

    setIsLoading(true)
    setError("")

    try {
      const studentExists = await checkStudentExists(studentId.trim())
      
      if (!studentExists) {
        setError(t.studentNotFound || "Студент с таким номером зачётки не найден")
        return
      }

      onLogin(studentId.trim())
    } catch (err) {
      setError(t.connectionError || "Ошибка соединения с сервером")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Пока компонент не смонтирован, показываем упрощенную версию
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">{t.welcome}</CardTitle>
            <CardDescription className="text-muted-foreground">{t.enterStudentId}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {/* Пустой инпут для SSR */}
                </div>
              </div>
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full opacity-50"
                disabled
              >
                {t.login}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">{t.welcome}</CardTitle>
          <CardDescription className="text-muted-foreground">{t.enterStudentId}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder={t.studentIdPlaceholder}
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value)
                  setError("") 
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading || !studentId.trim()}
            >
              {isLoading ? `${t.login}...` : t.login}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}