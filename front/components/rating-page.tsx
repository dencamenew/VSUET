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
    vedType: string // Добавлено поле типа ведомости
    ratings: string[]
  }[]
}

interface SubjectRating {
  name: string
  vedType: string // Добавлено поле типа ведомости
  ratings: {
    name: string
    value: string
  }[]
  finalGrade?: string
  type: "single" | "multiple" | "points"
}

interface RatingUpdate {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  zach_number: string
  group_name: string
  sbj: string
  ved_type: string // Добавлено поле типа ведомости
  raiting: string[]
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
          vedType: update.ved_type, // Добавлено сохранение типа ведомости
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
        setError("Не удалось загрузить рейтинг")
        console.error("Failed to fetch rating:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRating()
  }, [studentId])

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const getVedTypeDisplayName = (vedType: string) => {
    const vedTypeMap: Record<string, string> = {
      'экзамен': 'Экзамен',
      'зачет': 'Зачёт',
      'диффзачет': 'Дифф. зачёт',
      'зачет с оценкой': 'Зачёт с оценкой',
      'курсовая': 'Курсовая работа',
      'курсовая работа': 'Курсовая работа',
      'выпускная': 'Выпускная работа',
      'выпускная работа': 'Выпускная работа',
      'дипломная работа': 'Дипломная работа',
      'практика': 'Практика',
      'учебная практика': 'Учебная практика',
      'производственная практика': 'Производственная практика',
      'преддипломная практика': 'Преддипломная практика',
      'стажировка': 'Стажировка',
      'реферат': 'Реферат',
      'доклад': 'Доклад',
      'проект': 'Проект',
      'default': 'Ведомость'
    }
    
    // Приводим к нижнему регистру для поиска
    const lowerVedType = vedType.toLowerCase().trim()
    
    // Проверяем содержит ли тип слово "практика"
    if (lowerVedType.includes('практика')) {
      // Пытаемся найти точное соответствие
      if (vedTypeMap[lowerVedType]) {
        return vedTypeMap[lowerVedType]
      }
      // Если есть уточнение типа практики
      if (lowerVedType.includes('учебная')) return 'Учебная практика'
      if (lowerVedType.includes('производственная')) return 'Производственная практика'
      if (lowerVedType.includes('преддипломная')) return 'Преддипломная практика'
      return 'Практика'
    }
    
    // Проверяем содержит ли тип слово "курсовая"
    if (lowerVedType.includes('курсовая')) {
      return vedTypeMap[lowerVedType] || 'Курсовая работа'
    }
    
    // Проверяем содержит ли тип слово "выпускная" или "диплом"
    if (lowerVedType.includes('выпускная') || lowerVedType.includes('диплом')) {
      return vedTypeMap[lowerVedType] || 'Выпускная работа'
    }
    
    return vedTypeMap[lowerVedType] || vedType || vedTypeMap.default
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
          ratings: [{ name: "Оценка", value: ratings[0] }],
          type: "single"
        }
      } else if (ratings.length === 6) {
        const checkpoints = ratings.slice(0, 5).map((r, i) => ({
          name: `КТ${i+1}`,
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
            name: `Оценка ${i+1}`,
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
    if (grade === "Отл") return "5"
    if (grade === "Хор") return "4"
    if (grade === "Удовл") return "3"
    if (grade === "Неуд") return "2"
    return grade
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
          <p className="text-muted-foreground text-lg">Загрузка рейтинга...</p>
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
                      <p className="text-muted-foreground text-sm">Оценка:</p>
                      <div className={`text-xl font-bold ${getGradeColor(subject.ratings[0].value)}`}>
                        {getGradeText(subject.ratings[0].value)}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-3">
                        {subject.type === "points" && (
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-muted-foreground text-sm">Итоговая оценка:</p>
                            <div className={`text-xl font-bold ${getGradeColor(subject.finalGrade || "")}`}>
                              {subject.finalGrade ? getGradeText(subject.finalGrade) : "-"}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-muted-foreground text-sm font-medium">
                          {subject.type === "points" ? "Контрольные точки:" : "Оценки:"}
                        </p>
                      </div>

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