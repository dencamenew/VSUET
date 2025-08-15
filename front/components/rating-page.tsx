"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Home, Calendar, Grid3X3, LogOut } from "lucide-react"

interface RatingPageProps {
  studentId: string
  onNavigate: (page: "schedule" | "rating") => void
  onLogout: () => void
}

export default function RatingPage({ studentId, onNavigate, onLogout }: RatingPageProps) {
  // Mock rating data
  const subjects = [
    { name: "Математика", grade: 4.5, credits: 5 },
    { name: "Физика", grade: 4.2, credits: 4 },
    { name: "Программирование", grade: 4.8, credits: 6 },
    { name: "Английский язык", grade: 4.0, credits: 3 },
    { name: "История", grade: 4.3, credits: 2 },
  ]

  const averageGrade = subjects.reduce((sum, subject) => sum + subject.grade, 0) / subjects.length

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("schedule")}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Рейтинг</h1>
            <p className="text-gray-400">Зачетка: {studentId}</p>
          </div>
        </div>
      </div>

      {/* Average Grade */}
      <div className="px-4 mb-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-center">Средний балл</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">{averageGrade.toFixed(2)}</div>
              <p className="text-gray-400">из 5.0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects List */}
      <div className="px-4 space-y-3 mb-20">
        {subjects.map((subject, index) => (
          <Card key={index} className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-white font-medium">{subject.name}</h3>
                  <p className="text-gray-400 text-sm">{subject.credits} кредитов</p>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${
                      subject.grade >= 4.5
                        ? "text-green-500"
                        : subject.grade >= 4.0
                          ? "text-yellow-500"
                          : "text-red-500"
                    }`}
                  >
                    {subject.grade.toFixed(1)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800">
        <div className="flex justify-around items-center py-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:bg-gray-800"
            onClick={() => onNavigate("schedule")}
          >
            <Home className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:bg-gray-800"
            onClick={() => onNavigate("schedule")}
          >
            <Calendar className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-gray-800"
            onClick={() => onNavigate("rating")}
          >
            <Grid3X3 className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:bg-gray-800" onClick={onLogout}>
            <LogOut className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
