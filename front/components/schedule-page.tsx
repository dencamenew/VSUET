"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Search, Grid3X3, Calendar, User, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react"
import { translations, type Language } from "@/lib/translations"

interface SchedulePageProps {
  studentId: string
  onNavigate: (page: "schedule" | "rating") => void
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

const subjects = [
  { name: "Математический анализ", teacher: "Иванов И.И.", rooms: ["А-101", "А-102", "А-103"] },
  { name: "Линейная алгебра", teacher: "Петрова П.П.", rooms: ["А-201", "А-202"] },
  { name: "Физика", teacher: "Сидоров С.С.", rooms: ["Ф-101", "Ф-102", "Ф-103"] },
  { name: "Программирование", teacher: "Козлов К.К.", rooms: ["К-301", "К-302", "К-303"] },
  { name: "Английский язык", teacher: "Smith J.", rooms: ["И-101", "И-102"] },
  { name: "История России", teacher: "Морозова М.М.", rooms: ["Г-201", "Г-202"] },
  { name: "Философия", teacher: "Орлова О.О.", rooms: ["Ф-301", "Ф-302"] },
  { name: "Химия", teacher: "Волков В.В.", rooms: ["Х-101", "Х-102"] },
  { name: "Биология", teacher: "Зайцева З.З.", rooms: ["Б-103", "Б-104"] },
  { name: "Экономика", teacher: "Соколов С.А.", rooms: ["Э-201", "Э-202"] },
  { name: "Информатика", teacher: "Федоров Ф.Ф.", rooms: ["К-101", "К-102"] },
  { name: "Дискретная математика", teacher: "Николаев Н.Н.", rooms: ["А-301", "А-302"] },
  { name: "Базы данных", teacher: "Лебедев Л.Л.", rooms: ["К-201", "К-202"] },
  { name: "Алгоритмы и структуры данных", teacher: "Романова Р.Р.", rooms: ["К-401", "К-402"] },
  { name: "Веб-разработка", teacher: "Белов Б.Б.", rooms: ["К-501", "К-502"] },
  { name: "Машинное обучение", teacher: "Кузнецов К.К.", rooms: ["К-601", "К-602"] },
  { name: "Компьютерная графика", teacher: "Новиков Н.Н.", rooms: ["К-701", "К-702"] },
  { name: "Сети и телекоммуникации", teacher: "Павлов П.А.", rooms: ["С-101", "С-102"] },
]

const timeSlots = [
  { start: "08:20", end: "09:50" },
  { start: "10:00", end: "11:30" },
  { start: "11:40", end: "13:10" },
  { start: "14:00", end: "15:30" },
  { start: "15:40", end: "17:10" },
  { start: "17:20", end: "18:50" },
  { start: "19:00", end: "20:30" },
  { start: "20:40", end: "22:10" },
]

const lessonTypes: ("lecture" | "practice" | "lab")[] = ["lecture", "practice", "lab"]

// Функция для генерации случайного расписания на сентябрь
const generateSeptemberSchedule = () => {
  const schedule: Record<
    string,
    Array<{
      time: string
      endTime: string // Добавил поле для времени окончания
      subject: string
      room: string
      teacher: string
      type: "lecture" | "practice" | "lab"
    }>
  > = {}

  for (let day = 1; day <= 30; day++) {
    const dateKey = `2025-09-${day.toString().padStart(2, "0")}`
    const dayOfWeek = new Date(2025, 8, day).getDay() // 0 = воскресенье, 6 = суббота

    // Пропускаем выходные (суббота и воскресенье)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue
    }

    if (day === 1) {
      schedule[dateKey] = [
        {
          time: "09:00",
          endTime: "10:30",
          subject: "Торжественная линейка",
          room: "Актовый зал",
          teacher: "Администрация",
          type: "lecture",
        },
        {
          time: "10:40",
          endTime: "12:10",
          subject: "Введение в специальность",
          room: "А-101",
          teacher: "Иванов И.И.",
          type: "lecture",
        },
        {
          time: "12:20",
          endTime: "13:50",
          subject: "Математический анализ",
          room: "А-102",
          teacher: "Петрова П.П.",
          type: "lecture",
        },
        {
          time: "14:00",
          endTime: "15:30",
          subject: "Программирование",
          room: "К-301",
          teacher: "Козлов К.К.",
          type: "practice",
        },
        {
          time: "15:40",
          endTime: "17:10",
          subject: "Физика",
          room: "Ф-101",
          teacher: "Сидоров С.С.",
          type: "lab",
        },
      ]
      continue
    }

    // Случайное количество пар в день (2-5)
    const lessonsCount = Math.floor(Math.random() * 4) + 2
    const daySchedule = []
    const usedTimes = new Set()

    for (let i = 0; i < lessonsCount; i++) {
      // Выбираем случайное время, которое еще не использовалось
      let timeSlot
      do {
        timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)]
      } while (usedTimes.has(timeSlot.start) && usedTimes.size < timeSlots.length)

      if (usedTimes.size >= timeSlots.length) break
      usedTimes.add(timeSlot.start)

      // Выбираем случайный предмет
      const subject = subjects[Math.floor(Math.random() * subjects.length)]
      const room = subject.rooms[Math.floor(Math.random() * subject.rooms.length)]
      const type = lessonTypes[Math.floor(Math.random() * lessonTypes.length)]

      daySchedule.push({
        time: timeSlot.start,
        endTime: timeSlot.end, // Добавил время окончания
        subject: subject.name,
        room: room,
        teacher: subject.teacher,
        type: type,
      })
    }

    // Сортируем по времени
    daySchedule.sort((a, b) => a.time.localeCompare(b.time))
    schedule[dateKey] = daySchedule
  }

  return schedule
}

const mockScheduleData = generateSeptemberSchedule()

export default function SchedulePage({ studentId, onNavigate, onShowProfile, language }: SchedulePageProps) {
  const [selectedDateKey, setSelectedDateKey] = useState<string>("")
  const [dates, setDates] = useState<DateItem[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const t = translations[language]

  const generateAllDates = () => {
    const daysOfWeek =
      language === "ru" ? ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const months =
      language === "ru"
        ? ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

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
    const september1st = allDates.find((d) => d.key === "2025-09-01")
    const defaultDate =
      september1st ||
      allDates.find((d) => d.key.startsWith("2025-09-")) ||
      allDates.find((d) => d.isToday) ||
      allDates[0]

    setDates(allDates)
    setSelectedDateKey(defaultDate?.key || "")
  }, [language]) // добавил language в зависимости useEffect

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
    const schedule = mockScheduleData[selectedDateKey] || []
    return schedule
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

  const getCardStyles = (type: "lecture" | "practice" | "lab") => {
    switch (type) {
      case "lecture":
        return "bg-card border border-border border-l-4 border-l-blue-500 shadow-sm hover:shadow-md"
      case "practice":
        return "bg-card border border-border border-l-4 border-l-red-500 shadow-sm hover:shadow-md"
      case "lab":
        return "bg-card border border-border border-l-4 border-l-green-500 shadow-sm hover:shadow-md"
      default:
        return "bg-card border border-border shadow-sm hover:shadow-md"
    }
  }

  const getTypeStyles = (type: "lecture" | "practice" | "lab") => {
    switch (type) {
      case "lecture":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
      case "practice":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"
      case "lab":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTypeLabel = (type: "lecture" | "practice" | "lab") => {
    switch (type) {
      case "lecture":
        return t.lecture
      case "practice":
        return t.practice
      case "lab":
        return t.lab
      default:
        return type
    }
  }

  const schedule = getScheduleForDate()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div>
          <h1 className="text-2xl font-bold">{t.schedule}</h1>
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
            <p className="text-muted-foreground text-lg">{t.noClasses}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.map((lesson, index) => (
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
                          {t.teacherLabel}
                        </div>
                        <span className="text-foreground font-medium bg-accent/50 px-3 py-1.5 rounded-lg text-sm border border-accent/20">
                          {lesson.teacher}
                        </span>
                      </div>
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
