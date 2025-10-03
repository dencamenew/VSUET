"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { translations, type Language } from "@/lib/translations"
import { GraduationCap, Eye, EyeOff } from "lucide-react"
import type { GroupSubjects } from "../app/page"
import { useSession } from '@/hooks/useSession'

interface TeacherAuthPageProps {
  onLogin: (teacherName: string, sessionId: string, groupsSubjects: GroupSubjects) => void
  language: Language
}

interface LoginResponse {
  message: string
  teacher: {
    id: number
    name: string
    password: string
    groupsSubjects: GroupSubjects
  }
  sessionId: string
}

export default function TeacherAuthPage({ onLogin, language }: TeacherAuthPageProps) {
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { saveSession } = useSession()

  const t = translations[language] || translations.en

  const URL = "http://localhost:8081/api"



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !password.trim()) return

    setIsLoading(true)
    setError("")

    try {

      const response = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName.trim(),
          password: password.trim()
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: LoginResponse = await response.json()

      if (data.message === "Login successful") {
        saveSession(data.sessionId)
        onLogin(data.teacher.name, data.sessionId, data.teacher.groupsSubjects)
      } else {
        setError(t.invalidCredentials)
      }
    } catch (err) {
      setError(t.connectionError)
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{t.welcome}</CardTitle>
          <CardDescription>{t.enterCredentials}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder={t.fullNamePlaceholder}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  setError("")
                }}
                required
              />
            </div>
            <div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !fullName.trim() || !password.trim()}
            >
              {isLoading ? `${t.login}...` : t.login}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}