"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { translations, type Language } from "@/lib/translations"
import { GraduationCap } from "lucide-react"

interface TeacherAuthPageProps {
  onLogin: (teacherName: string) => void
  language: Language
}

export default function TeacherAuthPage({ onLogin, language }: TeacherAuthPageProps) {
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const t = translations[language] || translations.en

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !password.trim()) return

    setIsLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock validation - accept any non-empty credentials
      if (fullName.trim() && password.trim()) {
        onLogin(fullName.trim())
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center shadow-soft-lg">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">{t.welcome}</CardTitle>
          <CardDescription className="text-muted-foreground">{t.enterCredentials}</CardDescription>
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
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
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
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                required
              />
              {error && <p className="text-destructive text-sm mt-2">{error}</p>}
            </div>
            <Button
              type="submit"
              className="w-full gradient-primary hover:opacity-90 text-white shadow-soft hover:shadow-soft-lg transition-all duration-200"
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
