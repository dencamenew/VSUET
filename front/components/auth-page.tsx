"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { translations, type Language } from "@/lib/translations"

interface AuthPageProps {
  onLogin: (studentId: string) => void
  language: Language
}

export default function AuthPage({ onLogin, language }: AuthPageProps) {
  const [studentId, setStudentId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const t = translations[language]

  const URL = process.env.NEXT_PUBLIC_API_URL;

  const checkStudentExists = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${URL}/rating/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 404) {
        return false
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data !== null && data !== undefined
    } catch (error) {
      console.error("Error checking student:", error)
      return false
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
              <Input
                type="text"
                placeholder={t.studentIdPlaceholder}
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value)
                  setError("") 
                }}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
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