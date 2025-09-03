"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
  MessageSquare,
  Send,
  QrCode,
  ArrowLeft,
} from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { generateMockSchedule, type Lesson } from "@/data/mockData"
import { Textarea } from "@/components/ui/textarea"

interface TeacherSchedulePageProps {
  teacherName: string
  onNavigate: (page: "schedule" | "rating" | "attendance") => void
  onShowProfile: () => void
  language: Language
}

interface DateItem {
  date: number
  day: string
  month: string
  isToday: boolean
  fullDate: Date
  key: string
}

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  lesson: Lesson | null
  language: Language
  selectedDate: string
}

interface QRModalProps {
  isOpen: boolean
  onClose: () => void
  lesson: Lesson | null
  language: Language
  selectedDate: string
}

interface ViewCommentModalProps {
  isOpen: boolean
  onClose: () => void
  comment: string
  lesson: Lesson | null
  language: Language
}

function QRModal({ isOpen, onClose, lesson, language, selectedDate }: QRModalProps) {
  const [qrId, setQrId] = useState(1)

  if (!isOpen || !lesson) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const refreshQR = () => {
    setQrId((prev) => prev + 1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const qrData = `lesson_${lesson.subject}_${lesson.group}_${lesson.time}_${selectedDate}_${qrId}`

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div className="w-full max-w-md bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-semibold text-foreground">
            QR {language === "ru" ? "Посещаемость" : "Attendance"}
          </h3>
          <div className="w-8" />
        </div>

        <div className="mb-6 space-y-2 text-center">
          <p className="text-sm font-medium text-foreground">{lesson.subject}</p>
          <p className="text-xs text-muted-foreground">
            {lesson.time} - {lesson.endTime} • {lesson.room}
          </p>
          <p className="text-xs text-muted-foreground">
            {lesson.group} • {formatDate(selectedDate)}
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg border-2 border-border">
            <img
              src={`/qr-code-.png?key=${qrData}&height=200&width=200`}
              alt="QR Code for attendance"
              className="w-48 h-48"
            />
          </div>

          <Button onClick={refreshQR} variant="outline" className="w-full bg-background hover:bg-muted">
            {language === "ru" ? "Обновить QR-код" : "Refresh QR Code"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function CommentModal({ isOpen, onClose, lesson, language, selectedDate }: CommentModalProps) {
  const [comment, setComment] = useState("")
  const t = translations[language] || translations.en

  if (!isOpen || !lesson) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    // Call parent component's function to save comment
    const commentKey = `${lesson.subject}_${lesson.group}_${lesson.time}`

    // Dispatch custom event to update comments in parent
    const event = new CustomEvent("saveComment", {
      detail: { key: commentKey, comment: comment.trim() },
    })
    window.dispatchEvent(event)

    setComment("")
    onClose()

    alert(t.commentAdded)
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div className="w-full max-w-md bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{t.addComment}</h3>
        </div>

        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-foreground">{lesson.subject}</p>
          <p className="text-xs text-muted-foreground">
            {lesson.time} - {lesson.endTime} • {lesson.group}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(selectedDate)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder={t.commentPlaceholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px] bg-background border-border text-foreground focus:border-primary focus:ring-primary/20"
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              {t.back}
            </Button>
            <Button type="submit" disabled={!comment.trim()} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              {t.send}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ViewCommentModal({ isOpen, onClose, comment, lesson, language }: ViewCommentModalProps) {
  const t = translations[language] || translations.en

  if (!isOpen || !lesson) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div className="w-full max-w-md bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{t.comment || "Comment"}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-foreground">{lesson.subject}</p>
          <p className="text-xs text-muted-foreground">
            {lesson.time} - {lesson.endTime} • {lesson.group}
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-foreground whitespace-pre-wrap">{comment}</p>
        </div>

        <div className="mt-4">
          <Button onClick={onClose} className="w-full">
            {t.close || "Close"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function TeacherSchedulePage({
  teacherName,
  onNavigate,
  onShowProfile,
  language,
}: TeacherSchedulePageProps) {
  const [selectedDateKey, setSelectedDateKey] = useState<string>("")
  const [dates, setDates] = useState<DateItem[]>([])
  const [schedule, setSchedule] = useState<Record<string, Lesson[]>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [commentModal, setCommentModal] = useState<{ isOpen: boolean; lesson: Lesson | null }>({
    isOpen: false,
    lesson: null,
  })
  const [qrModal, setQrModal] = useState<{ isOpen: boolean; lesson: Lesson | null }>({
    isOpen: false,
    lesson: null,
  })
  const [viewCommentModal, setViewCommentModal] = useState<{
    isOpen: boolean
    comment: string
    lesson: Lesson | null
  }>({
    isOpen: false,
    comment: "",
    lesson: null,
  })
  const [lessonComments, setLessonComments] = useState<Record<string, string>>({
    "Математический анализ_ИВТ-21_09:00":
      "Студенты хорошо усвоили материал по производным. Рекомендую дополнительные задачи на интегралы для закрепления.",
    "Физика_ИВТ-22_10:45": "Отличная работа на лабораторной по механике.",
    "Программирование_ИВТ-21_14:30":
      "Нужно больше практики с алгоритмами сортировки. Некоторые студенты испытывают трудности с рекурсией.",
  })
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const t = translations[language] || translations.en

  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const generateAllDates = () => {
    const daysOfWeek =
      language === "ru" ? ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const months =
      language === "ru"
        ? ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 14)

    const endDate = new Date(today)
    endDate.setDate(today.getDate() + 60)

    const generatedDates: DateItem[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateKey = getLocalDateString(currentDate)
      const isToday = getLocalDateString(currentDate) === getLocalDateString(today)
      const dayIndex = currentDate.getDay()

      generatedDates.push({
        date: currentDate.getDate(),
        day: daysOfWeek[dayIndex],
        month: months[currentDate.getMonth()],
        isToday,
        fullDate: new Date(currentDate),
        key: dateKey,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return generatedDates
  }

  useEffect(() => {
    const allDates = generateAllDates()
    setDates(allDates)

    const mockSchedule = generateMockSchedule()
    setSchedule(mockSchedule)

    const todayKey = getLocalDateString(new Date())
    const newSelectedDateKey = mockSchedule[todayKey] ? todayKey : Object.keys(mockSchedule)[0] || ""
    setSelectedDateKey(newSelectedDateKey)

    setLoading(false)
  }, [language])

  useEffect(() => {
    const handleSaveComment = (event: CustomEvent) => {
      const { key, comment } = event.detail
      setLessonComments((prev) => ({
        ...prev,
        [key]: comment,
      }))
    }

    window.addEventListener("saveComment", handleSaveComment as EventListener)

    return () => {
      window.removeEventListener("saveComment", handleSaveComment as EventListener)
    }
  }, [])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  const currentSchedule = useMemo(() => {
    return schedule[selectedDateKey] || []
  }, [schedule, selectedDateKey])

  const selectedDateInfo = useMemo(() => {
    const selectedDateObj = dates.find((d) => d.key === selectedDateKey)
    if (!selectedDateObj) return t.selectDate
    return `${selectedDateObj.month} ${selectedDateObj.date} • ${selectedDateObj.day}`
  }, [dates, selectedDateKey, language])

  const getCardStyles = (type: "lecture" | "practice" | "lab" | "other") => {
    switch (type) {
      case "lecture":
        return "bg-card border border-border border-l-4 border-l-emerald-500 shadow-soft hover:shadow-soft-lg transition-all duration-200"
      case "practice":
        return "bg-card border border-border border-l-4 border-l-orange-500 shadow-soft hover:shadow-soft-lg transition-all duration-200"
      case "lab":
        return "bg-card border border-border border-l-4 border-l-blue-500 shadow-soft hover:shadow-soft-lg transition-all duration-200"
      default:
        return "bg-card border border-border border-l-4 border-l-purple-500 shadow-soft hover:shadow-soft-lg transition-all duration-200"
    }
  }

  const getTypeStyles = (type: "lecture" | "practice" | "lab" | "other") => {
    switch (type) {
      case "lecture":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
      case "practice":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
      case "lab":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
      default:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
    }
  }

  const getTypeLabel = (type: "lecture" | "practice" | "lab" | "other") => {
    switch (type) {
      case "lecture":
        return t.lecture
      case "practice":
        return t.practice
      case "lab":
        return t.lab
      default:
        return t.other
    }
  }

  const openCommentModal = (lesson: Lesson) => {
    setCommentModal({ isOpen: true, lesson })
  }

  const closeCommentModal = () => {
    setCommentModal({ isOpen: false, lesson: null })
  }

  const openQRModal = (lesson: Lesson) => {
    setQrModal({ isOpen: true, lesson })
  }

  const closeQRModal = () => {
    setQrModal({ isOpen: false, lesson: null })
  }

  const getCommentKey = (lesson: Lesson, date: string) => {
    return `${lesson.subject}_${lesson.group}_${lesson.time}`
  }

  const truncateComment = (text: string, maxLength = 60) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const openViewCommentModal = (comment: string, lesson: Lesson) => {
    setViewCommentModal({ isOpen: true, comment, lesson })
  }

  const closeViewCommentModal = () => {
    setViewCommentModal({ isOpen: false, comment: "", lesson: null })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div>
          <h1 className="text-2xl font-bold">{t.schedule}</h1>
          <p className="text-muted-foreground">{teacherName}</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto pb-2 px-8 scrollbar-hide">
            {dates.map((dateItem) => (
              <button
                key={dateItem.key}
                onClick={() => setSelectedDateKey(dateItem.key)}
                className={`flex flex-col items-center p-3 rounded-2xl min-w-[60px] transition-all duration-200 ${
                  dateItem.isToday
                    ? "gradient-primary text-white shadow-soft-lg"
                    : selectedDateKey === dateItem.key
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-muted hover:scale-105"
                }`}
              >
                <span className="text-lg font-semibold">{dateItem.date}</span>
                <span className="text-sm">{dateItem.day}</span>
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected Date */}
      <div className="px-4 mb-4">
        <p className="text-muted-foreground">{selectedDateInfo}</p>
      </div>

      {/* Lessons List */}
      <div className="flex-1 px-4 pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-lg">{t.loadingSchedule}</p>
          </div>
        ) : currentSchedule.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-lg">{t.noClasses}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentSchedule.map((lesson, index) => {
              const commentKey = getCommentKey(lesson, selectedDateKey)
              const lessonComment = lessonComments[commentKey]

              return (
                <div key={index} className={`${getCardStyles(lesson.type)} rounded-xl p-4 transition-all duration-200`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-foreground font-semibold text-lg">{lesson.subject}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeStyles(lesson.type)}`}>
                          {getTypeLabel(lesson.type)}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            {t.timeLabel}
                          </div>
                          <span className="text-primary font-semibold bg-primary/10 px-3 py-1.5 rounded-lg text-sm">
                            {lesson.time} - {lesson.endTime}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            {t.roomLabel}
                          </div>
                          <span className="text-foreground font-medium bg-muted px-3 py-1.5 rounded-lg text-sm">
                            {lesson.room}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            {t.groupLabel}
                          </div>
                          <span className="text-primary font-semibold bg-primary/10 px-3 py-1.5 rounded-lg text-sm">
                            {lesson.group}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 min-w-0 max-w-[200px]">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openQRModal(lesson)}
                          className="border-muted-foreground/30 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-foreground/50 transition-colors"
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCommentModal(lesson)}
                          className="border-muted-foreground/30 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-foreground/50 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>

                      {lessonComment && (
                        <div className="w-full">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 text-right">
                            {t.comment || "Комментарий"}
                          </div>
                          <div
                            className="bg-muted/50 px-3 py-2 rounded-lg text-sm text-foreground cursor-pointer hover:bg-muted/70 transition-colors text-right"
                            onClick={() => openViewCommentModal(lessonComment, lesson)}
                          >
                            {truncateComment(lessonComment, 40)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={commentModal.isOpen}
        onClose={closeCommentModal}
        lesson={commentModal.lesson}
        language={language}
        selectedDate={selectedDateKey}
      />

      {/* QR Modal */}
      <QRModal
        isOpen={qrModal.isOpen}
        onClose={closeQRModal}
        lesson={qrModal.lesson}
        language={language}
        selectedDate={selectedDateKey}
      />

      {/* View Comment Modal */}
      <ViewCommentModal
        isOpen={viewCommentModal.isOpen}
        onClose={closeViewCommentModal}
        comment={viewCommentModal.comment}
        lesson={viewCommentModal.lesson}
        language={language}
      />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="flex justify-around items-center py-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-muted"
            onClick={() => onNavigate("schedule")}
          >
            <Calendar className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted"
            onClick={() => onNavigate("rating")}
          >
            <GraduationCap className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted"
            onClick={() => onNavigate("attendance")}
          >
            <Users className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted" onClick={onShowProfile}>
            <User className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
