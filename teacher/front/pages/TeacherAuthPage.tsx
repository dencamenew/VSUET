"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { translations, type Language } from "@/lib/translations"
import { GraduationCap } from "lucide-react"
import type { GroupSubjects } from "../app/page"
import { useSession } from '@/hooks/useSession'
import { useFetch } from "@/hooks/api/useFetch"

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
  const { saveSession } = useSession()

  const t = translations[language] || translations.en

  // Убедитесь, что порт совпадает с бэкендом
  const URL = "http://localhost:8081/api"
  const fetch = useFetch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !password.trim()) return

    setIsLoading(true)
    setError("")

    try {
      // const response = await fetch(`${URL}/auth/login`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   credentials: 'include', // если используете cookie-based сессии
      //   body: JSON.stringify({
      //     name: fullName.trim(),
      //     password: password.trim()
      //   }),
      // })

      // if (!response.ok) {
      //   if (response.status === 401) {
      //     setError(t.invalidCredentials || "Неверное имя пользователя или пароль")
      //     return
      //   }
      //   throw new Error(`HTTP error! status: ${response.status}`)
      // }
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // если используете cookie-based сессии
        body: JSON.stringify({
          name: fullName.trim(),
          password: password.trim()
        }),
      });

      const data: LoginResponse = await response.json();
      console.log(data);


      if (data.message === "Login successful") {
        saveSession(data.sessionId)
        onLogin(data.teacher.name, data.sessionId, data.teacher.groupsSubjects)
      } else {
        setError(t.invalidCredentials || "Неверное имя пользователя или пароль")
      }

    } catch (err) {
      console.error("Login error:", err)
      setError(t.connectionError || "Ошибка соединения с сервером")
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
              <Input
                type="password"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                required
              />
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
