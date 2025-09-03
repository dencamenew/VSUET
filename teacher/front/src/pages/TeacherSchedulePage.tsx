import React, { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, User, ChevronLeft, ChevronRight, GraduationCap, Users, MessageSquare, X, Send } from "lucide-react"
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
  selectedDate: string // Добавляем пропс для выбранной даты
}

function CommentModal({ isOpen, onClose, lesson, language, selectedDate }: CommentModalProps) {
  const [comment, setComment] = useState("")
  const t = translations[language] || translations.en

  if (!isOpen || !lesson) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    
    // Here you would send the comment to the backend
    console.log("Comment for lesson:", lesson.subject, "Comment:", comment)
    setComment("")
    onClose()
    
    // Show success message (you could use a toast library)
    alert(t.commentAdded)
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Форматируем дату для отображения
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div className="w-full max-w-md bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{t.addComment}</h3>
          {/* Убрали крестик - оставляем только заголовок */}
        </div>
        
        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-foreground">{lesson.subject}</p>
          <p className="text-xs text-muted-foreground">
            {lesson.time} - {lesson.endTime} • {lesson.group}
          </p>
          <p className="text-xs text-muted-foreground"> {/* Добавляем дату пары */}
            {formatDate(selectedDate)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder={t.commentPlaceholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
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

export default function TeacherSchedulePage({ teacherName, onNavigate, onShowProfile, language }: TeacherSchedulePageProps) {
  const [selectedDateKey, setSelectedDateKey] = useState<string>("")
  const [dates, setDates] = useState<DateItem[]>([])
  const [schedule, setSchedule] = useState<Record<string, Lesson[]>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [commentModal, setCommentModal] = useState<{ isOpen: boolean; lesson: Lesson | null }>({
    isOpen: false,
    lesson: null
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
      language === "ru"
        ? ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

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
    
    // Load mock schedule
    const mockSchedule = generateMockSchedule()
    setSchedule(mockSchedule)
    
    const todayKey = getLocalDateString(new Date())
    const newSelectedDateKey = mockSchedule[todayKey] ? todayKey : Object.keys(mockSchedule)[0] || ""
    setSelectedDateKey(newSelectedDateKey)
    
    setLoading(false)
  }, [language])

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
        return "bg-card border border-border border-l-4 border-l-blue-500 shadow-sm hover:shadow-md"
      case "practice":
        return "bg-card border border-border border-l-4 border-l-red-500 shadow-sm hover:shadow-md"
      case "lab":
        return "bg-card border border-border border-l-4 border-l-green-500 shadow-sm hover:shadow-md"
      default:
        return "bg-card border border-border border-l-4 border-l-purple-500 shadow-sm hover:shadow-md"
    }
  }

  const getTypeStyles = (type: "lecture" | "practice" | "lab" | "other") => {
    switch (type) {
      case "lecture":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
      case "practice":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"
      case "lab":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800"
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
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto pb-2 px-8 scrollbar-hide">
            {dates.map((dateItem) => (
              <button
                key={dateItem.key}
                onClick={() => setSelectedDateKey(dateItem.key)}
                className={`flex flex-col items-center p-3 rounded-2xl min-w-[60px] transition-all ${
                  dateItem.isToday
                    ? "bg-primary text-primary-foreground"
                    : selectedDateKey === dateItem.key
                      ? "bg-muted"
                      : "hover:bg-muted"
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
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
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
            {currentSchedule.map((lesson, index) => (
              <div key={index} className={`${getCardStyles(lesson.type)} rounded-xl p-4 transition-all duration-200`}>
                <div className="flex items-start justify-between mb-3">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCommentModal(lesson)}
                    className="ml-4"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={commentModal.isOpen}
        onClose={closeCommentModal}
        lesson={commentModal.lesson}
        language={language}
        selectedDate={selectedDateKey} // Передаем выбранную дату
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