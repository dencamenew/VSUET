"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, GraduationCap, User, FileText } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { Client } from '@stomp/stompjs'

interface RatingPageProps {
  studentId: string
  onNavigate: (page: "schedule" | "rating") => void
  onShowProfile: () => void
  language: Language
}

interface RatingResponse {
  zachNumber: string
  groupName: string
  ratings: {
    subject: string
    vedType: string
    ratings: string[]
  }[]
}

interface RatingUpdate {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  zach_number: string
  group_name: string
  sbj: string
  ved_type: string
  raiting: string[]
}

interface SubjectRating {
  name: string
  vedType: string
  ratings: {
    name: string
    value: string
  }[]
  finalGrade?: string
  type: "single" | "multiple" | "points"
}

export default function RatingPage({ studentId, onNavigate, onShowProfile, language }: RatingPageProps) {
  const [ratingData, setRatingData] = useState<RatingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const t = translations[language]
  const URL = process.env.NEXT_PUBLIC_API_URL;
  const WS_URL = process.env.WS_URL;

  // Process and update ratings data
  const updateRatings = useCallback((update: RatingUpdate) => {
    if (update.zach_number !== studentId) return

    setRatingData(prev => {
      if (!prev) return prev

      const updatedRatings = [...prev.ratings]
      const subjectIndex = updatedRatings.findIndex(s => s.subject === update.sbj)

      if (update.eventType === 'DELETE') {
        // Remove subject
        if (subjectIndex >= 0) {
          updatedRatings.splice(subjectIndex, 1)
        }
      } else {
        // Update or insert subject
        const subjectData = {
          subject: update.sbj,
          vedType: update.ved_type,
          ratings: update.raiting
        }

        if (subjectIndex >= 0) {
          updatedRatings[subjectIndex] = subjectData
        } else {
          updatedRatings.push(subjectData)
        }
      }

      return {
        ...prev,
        ratings: updatedRatings
      }
    })
  }, [studentId])

  // Initialize WebSocket connection
  useEffect(() => {
    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        client.subscribe('/topic/raiting-updates', message => {
          try {
            const update: RatingUpdate = JSON.parse(message.body)
            updateRatings(update)
          } catch (err) {
            console.error('Error processing update:', err)
          }
        })
      },
      onStompError: frame => {
        console.error('WebSocket error:', frame.headers.message)
      }
    })

    client.activate()
    setStompClient(client)

    return () => {
      client.deactivate()
    }
  }, [updateRatings])

  // Fetch initial data
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await fetch(`${URL}/rating/${studentId}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: RatingResponse = await response.json()
        setRatingData(data)
      } catch (err) {
        setError(language === "ru" ? "Не удалось загрузить рейтинг" : "Failed to load rating")
        console.error("Failed to fetch rating:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRating()
  }, [studentId, language])

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const getVedTypeDisplayName = (vedType: string) => {
    const vedTypeMap: Record<string, { ru: string; en: string }> = {
      'экзамен': { ru: 'Экзамен', en: 'Exam' },
      'зачет': { ru: 'Зачёт', en: 'Test' },
      'диффзачет': { ru: 'Дифф. зачёт', en: 'Diff. test' },
      'зачет с оценкой': { ru: 'Зачёт с оценкой', en: 'Graded test' },
      'курсовая': { ru: 'Курсовая работа', en: 'Coursework' },
      'курсовая работа': { ru: 'Курсовая работа', en: 'Coursework' },
      'выпускная': { ru: 'Выпускная работа', en: 'Graduation work' },
      'выпускная работа': { ru: 'Выпускная работа', en: 'Graduation work' },
      'дипломная работа': { ru: 'Дипломная работа', en: 'Diploma work' },
      'практика': { ru: 'Практика', en: 'Practice' },
      'учебная практика': { ru: 'Учебная практика', en: 'Training practice' },
      'производственная практика': { ru: 'Производственная практика', en: 'Industrial practice' },
      'преддипломная практика': { ru: 'Преддипломная практика', en: 'Pre-diploma practice' },
      'стажировка': { ru: 'Стажировка', en: 'Internship' },
      'реферат': { ru: 'Реферат', en: 'Report' },
      'доклад': { ru: 'Доклад', en: 'Presentation' },
      'проект': { ru: 'Проект', en: 'Project' },
      'default': { ru: 'Ведомость', en: 'Record' }
    }
    
    const lowerVedType = vedType.toLowerCase().trim()
    
    // Проверяем содержит ли тип слово "практика"
    if (lowerVedType.includes('практика') || lowerVedType.includes('practice')) {
      if (vedTypeMap[lowerVedType]) {
        return language === "ru" ? vedTypeMap[lowerVedType].ru : vedTypeMap[lowerVedType].en
      }
      if (lowerVedType.includes('учебная') || lowerVedType.includes('training')) return language === "ru" ? 'Учебная практика' : 'Training practice'
      if (lowerVedType.includes('производственная') || lowerVedType.includes('industrial')) return language === "ru" ? 'Производственная практика' : 'Industrial practice'
      if (lowerVedType.includes('преддипломная') || lowerVedType.includes('pre-diploma')) return language === "ru" ? 'Преддипломная практика' : 'Pre-diploma practice'
      return language === "ru" ? 'Практика' : 'Practice'
    }
    
    // Проверяем содержит ли тип слово "курсовая"
    if (lowerVedType.includes('курсовая') || lowerVedType.includes('coursework')) {
      return vedTypeMap[lowerVedType] ? (language === "ru" ? vedTypeMap[lowerVedType].ru : vedTypeMap[lowerVedType].en) : (language === "ru" ? 'Курсовая работа' : 'Coursework')
    }
    
    // Проверяем содержит ли тип слово "выпускная" или "диплом"
    if (lowerVedType.includes('выпускная') || lowerVedType.includes('диплом') || lowerVedType.includes('graduation') || lowerVedType.includes('diploma')) {
      return vedTypeMap[lowerVedType] ? (language === "ru" ? vedTypeMap[lowerVedType].ru : vedTypeMap[lowerVedType].en) : (language === "ru" ? 'Выпускная работа' : 'Graduation work')
    }
    
    return vedTypeMap[lowerVedType] ? (language === "ru" ? vedTypeMap[lowerVedType].ru : vedTypeMap[lowerVedType].en) : vedType
  }

  const processRatings = (): SubjectRating[] => {
    if (!ratingData) return []

    return ratingData.ratings.map(subject => {
      const ratings = subject.ratings
      const subjectName = capitalizeFirstLetter(subject.subject)
      const vedType = getVedTypeDisplayName(subject.vedType || 'default')
      
      if (ratings.length === 1) {
        return {
          name: subjectName,
          vedType: vedType,
          ratings: [{ name: language === "ru" ? "Оценка" : "Grade", value: ratings[0] }],
          type: "single"
        }
      } else if (ratings.length === 6) {
        const checkpoints = ratings.slice(0, 5).map((r, i) => ({
          name: language === "ru" ? `КТ${i+1}` : `CP${i+1}`,
          value: r
        }))
        return {
          name: subjectName,
          vedType: vedType,
          ratings: checkpoints,
          finalGrade: ratings[5],
          type: "points"
        }
      } else {
        return {
          name: subjectName,
          vedType: vedType,
          ratings: ratings.map((r, i) => ({
            name: language === "ru" ? `Оценка ${i+1}` : `Grade ${i+1}`,
            value: r
          })),
          type: "multiple"
        }
      }
    })
  }

  const getGradeColor = (grade: string) => {
    if (grade === "Отл" || grade === "5" || (Number(grade) >= 85)) return "text-green-500"
    if (grade === "Хор" || grade === "4" || (Number(grade) >= 65)) return "text-yellow-500"
    if (grade === "Удовл" || grade === "3" || (Number(grade) >= 40)) return "text-orange-500"
    return "text-red-500"
  }

  const getGradeText = (grade: string) => {
  const gradeMap: Record<string, string> = {
      "Отл": "5",
      "Хор": "4", 
      "Удовл": "3",
      "Неуд": "2"
    }
    return gradeMap[grade] || grade
  }

  const processedSubjects = processRatings()

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
              {language === "ru" ? "Зачетка:" : "Student ID:"} {ratingData?.zachNumber || studentId}
              {ratingData?.groupName && ` (${ratingData.groupName})`}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground text-lg">
            {language === "ru" ? "Загрузка рейтинга..." : "Loading rating..."}
          </p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      ) : (
        <>
          {/* Subjects List */}
          <div className="px-4 space-y-4 mb-20">
            {processedSubjects.map((subject, index) => (
              <Card key={index} className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-foreground font-medium text-lg">{subject.name}</h3>
                      <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">
                          {subject.vedType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {subject.type === "single" ? (
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground text-sm">
                        {language === "ru" ? "Оценка:" : "Grade:"}
                      </p>
                      <div className={`text-xl font-bold ${getGradeColor(subject.ratings[0].value)}`}>
                        {getGradeText(subject.ratings[0].value)}
                      </div>
                    </div>
                  ) : (
                    <div>
                      {subject.type === "points" && (
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-muted-foreground text-sm">
                            {language === "ru" ? "Итоговая оценка:" : "Final grade:"}
                          </p>
                          <div className={`text-xl font-bold ${getGradeColor(subject.finalGrade || "")}`}>
                            {subject.finalGrade ? getGradeText(subject.finalGrade) : "-"}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-muted-foreground text-sm font-medium mb-2">
                        {subject.type === "points" 
                          ? (language === "ru" ? "Контрольные точки:" : "Checkpoints:") 
                          : (language === "ru" ? "Оценки:" : "Grades:")}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {subject.ratings.map((rating, idx) => (
                          <div key={idx} className="bg-muted/50 rounded-lg p-2 text-center">
                            <p className="text-xs text-muted-foreground">{rating.name}</p>
                            <p className={`text-sm font-semibold ${getGradeColor(rating.value)}`}>
                              {getGradeText(rating.value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

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