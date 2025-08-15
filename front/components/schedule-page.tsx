"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Search, Grid3X3, Calendar, User, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react"

interface SchedulePageProps {
  studentId: string
  onNavigate: (page: "schedule" | "rating") => void
  onShowProfile: () => void // добавил пропс для показа профиля
}

interface DateItem {
  date: number
  day: string
  month: string
  isToday: boolean
  fullDate: Date
  key: string
}

const mockScheduleData: Record<string, Array<{ time: string; subject: string; room: string; teacher: string }>> = {
  "2024-06-09": [
    { time: "09:00", subject: "Математика", room: "А-101", teacher: "Иванов И.И." },
    { time: "10:40", subject: "Физика", room: "Б-205", teacher: "Петров П.П." },
  ],
  "2024-06-10": [
    { time: "08:20", subject: "Программирование", room: "К-301", teacher: "Сидоров С.С." },
    { time: "10:00", subject: "Английский язык", room: "Г-102", teacher: "Smith J." },
    { time: "11:40", subject: "История", room: "В-203", teacher: "Козлов К.К." },
  ],
  "2024-06-11": [], // No classes today
  "2024-06-12": [{ time: "09:00", subject: "Химия", room: "Х-101", teacher: "Волков В.В." }],
  "2024-06-13": [
    { time: "08:20", subject: "Литература", room: "Л-205", teacher: "Морозова М.М." },
    { time: "10:00", subject: "Геометрия", room: "А-103", teacher: "Белов Б.Б." },
  ],
  "2024-06-14": [],
  "2024-06-15": [],
}

export default function SchedulePage({onNavigate, onShowProfile }: SchedulePageProps) {
  const [selectedDateKey, setSelectedDateKey] = useState<string>("")
  const [dates, setDates] = useState<DateItem[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const generateAllDates = () => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 30) // Начинаем с 30 дней назад

    const endDate = new Date(2026, 0, 1) // До 1 января 2026 года

    const generatedDates: DateItem[] = []
    const currentDate = new Date(startDate)

    while (currentDate < endDate) {
      const dateKey = currentDate.toISOString().split("T")[0]
      const isToday = currentDate.toDateString() === today.toDateString()

      generatedDates.push({
        date: currentDate.getDate(),
        day: daysOfWeek[currentDate.getDay()],
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
    const todayIndex = allDates.findIndex((d) => d.isToday)

    setDates(allDates)
    setSelectedDateKey(allDates[todayIndex]?.key || allDates[0]?.key || "")
  }, []) // Пустой массив зависимостей

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

  const getScheduleForDate = () => {
    return mockScheduleData[selectedDateKey] || []
  }

  const getSelectedDateInfo = () => {
    const selectedDateObj = dates.find((d) => d.key === selectedDateKey)
    if (!selectedDateObj) return "Select a date"

    return `${selectedDateObj.month} ${selectedDateObj.date} • ${selectedDateObj.day}`
  }

  const getSelectedYear = () => {
    const selectedDateObj = dates.find((d) => d.key === selectedDateKey)
    return selectedDateObj ? selectedDateObj.fullDate.getFullYear() : new Date().getFullYear()
  }

  const schedule = getScheduleForDate()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">МПол24-1</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="icon" className="text-primary hover:bg-muted">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-primary hover:bg-muted">
            <Grid3X3 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="px-4 mb-2">
        <p className="text-center text-muted-foreground text-sm font-medium">{getSelectedYear()}</p>
      </div>

      <div className="px-4 mb-6">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-muted text-foreground"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto pb-2 px-8 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {dates.map((dateItem) => (
              <button
                key={dateItem.key}
                onClick={() => setSelectedDateKey(dateItem.key)}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-2xl min-w-[60px] transition-all duration-200 ${
                  dateItem.isToday
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : selectedDateKey === dateItem.key
                      ? "bg-muted text-foreground scale-105"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-muted text-foreground"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 mb-8">
        <p className="text-muted-foreground">{getSelectedDateInfo()}</p>
      </div>

      <div className="flex-1 px-4 pb-20">
        {schedule.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-lg">No classes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.map((lesson, index) => (
              <div key={index} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-foreground font-semibold text-lg mb-1">{lesson.subject}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{lesson.teacher}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-primary font-medium">{lesson.time}</span>
                      <span className="text-muted-foreground">{lesson.room}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted" onClick={onShowProfile}>
            <User className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
