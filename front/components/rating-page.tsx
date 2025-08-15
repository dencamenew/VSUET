"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, GraduationCap, User } from "lucide-react"
import { translations, type Language } from "@/lib/translations"

interface RatingPageProps {
  studentId: string
  onNavigate: (page: "schedule" | "rating") => void
  onShowProfile: () => void
  language: Language
}

export default function RatingPage({ studentId, onNavigate, onShowProfile, language }: RatingPageProps) {
  const t = translations[language]

  // Mock rating data
  const subjects = [
    { name: "Математика", grade: 4.5, credits: 5, type: "grade" as const },
    { name: "Физика", grade: 4.2, credits: 4, type: "grade" as const },
    {
      name: "Программирование",
      totalPoints: 85,
      credits: 6,
      type: "points" as const,
      checkpoints: [
        { name: "КТ1", points: 18, maxPoints: 20 },
        { name: "КТ2", points: 16, maxPoints: 20 },
        { name: "КТ3", points: 19, maxPoints: 20 },
        { name: "КТ4", points: 17, maxPoints: 20 },
        { name: "КТ5", points: 15, maxPoints: 20 },
      ],
    },
    {
      name: "Английский язык",
      totalPoints: 72,
      credits: 3,
      type: "points" as const,
      checkpoints: [
        { name: "КТ1", points: 15, maxPoints: 20 },
        { name: "КТ2", points: 14, maxPoints: 20 },
        { name: "КТ3", points: 16, maxPoints: 20 },
        { name: "КТ4", points: 13, maxPoints: 20 },
        { name: "КТ5", points: 14, maxPoints: 20 },
      ],
    },
    { name: "История", grade: 4.3, credits: 2, type: "grade" as const },
  ]

  const gradeSubjects = subjects.filter((s) => s.type === "grade") as Array<{
    name: string
    grade: number
    credits: number
    type: "grade"
  }>
  const averageGrade = gradeSubjects.reduce((sum, subject) => sum + subject.grade, 0) / gradeSubjects.length

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("schedule")}
            className="text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t.rating}</h1>
            <p className="text-muted-foreground">
              {language === "ru" ? "Зачетка:" : "Student ID:"} {studentId}
            </p>
          </div>
        </div>
      </div>

      {/* Average Grade */}
      <div className="px-4 mb-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-center">
              {language === "ru" ? "Средний балл" : "Average Grade"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">{averageGrade.toFixed(2)}</div>
              <p className="text-muted-foreground">{language === "ru" ? "из 5.0" : "out of 5.0"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subjects List */}
      <div className="px-4 space-y-4 mb-20">
        {subjects.map((subject, index) => (
          <Card key={index} className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              {subject.type === "grade" ? (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-foreground font-medium text-lg">{subject.name}</h3>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${
                        subject.grade >= 4.5
                          ? "text-green-500"
                          : subject.grade >= 4.0
                            ? "text-yellow-500"
                            : "text-red-500"
                      }`}
                    >
                      {subject.grade.toFixed(1)}
                    </div>
                    <p className="text-muted-foreground text-xs">{language === "ru" ? "из 5.0" : "out of 5.0"}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-foreground font-medium text-lg">{subject.name}</h3>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          subject.totalPoints >= 85
                            ? "text-green-500"
                            : subject.totalPoints >= 70
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                      >
                        {subject.totalPoints}
                      </div>
                      <p className="text-muted-foreground text-xs">{language === "ru" ? "из 100" : "out of 100"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm font-medium">{t.controlPoints}:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {subject.checkpoints.map((checkpoint, cpIndex) => (
                        <div key={cpIndex} className="bg-muted/50 rounded-lg p-2 text-center">
                          <p className="text-xs text-muted-foreground">{checkpoint.name}</p>
                          <p
                            className={`text-sm font-semibold ${
                              checkpoint.points >= 18
                                ? "text-green-500"
                                : checkpoint.points >= 15
                                  ? "text-yellow-500"
                                  : "text-red-500"
                            }`}
                          >
                            {checkpoint.points}/{checkpoint.maxPoints}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="flex justify-around items-center py-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted"
            onClick={() => onNavigate("schedule")}
          >
            <Calendar className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-muted"
            onClick={() => onNavigate("rating")}
          >
            <GraduationCap className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted" onClick={onShowProfile}>
            <User className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
