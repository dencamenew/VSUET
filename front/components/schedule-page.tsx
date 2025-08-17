"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Search, Grid3X3, Calendar, User, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

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
  weekType?: "Числитель" | "Знаменатель"
}

interface Lesson {
  time: string
  endTime: string
  subject: string
  room: string
  teacher: string
  type: "lecture" | "practice" | "lab" | "other"
}

interface TimetableResponse {
  zachNumber: string
  groupName: string
  timetable: {
    Числитель: Record<string, Record<string, string>>
    Знаменатель: Record<string, Record<string, string>>
  }
}

export default function SchedulePage({ studentId, onNavigate, onShowProfile, language }: SchedulePageProps) {
  const [selectedDateKey, setSelectedDateKey] = useState<string>("")
  const [dates, setDates] = useState<DateItem[]>([])
  const [schedule, setSchedule] = useState<Record<string, Lesson[]>>({})
  const [groupName, setGroupName] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const stompClientRef = useRef<Client | null>(null)

  const t = translations[language]

  const parseLessonString = (lessonStr: string): Omit<Lesson, 'time'|'endTime'> => {
    if (lessonStr.includes("физической культуре")) {
      const subject = lessonStr.split('(')[0].replace(', общая физическая', '').trim()
      return {
        subject: "Элективные дисциплины (курсы) по физической культуре и спорту",
        room: "а.подготовка",
        teacher: "-",
        type: "other"
      }
    }

    const parts = lessonStr.split('(')
    let subject = parts[0].trim()
    const roomPart = parts[1]?.replace(')', '').trim() || ""

    if (subject.includes("Иностранный язык")) {
      const teacherMatch = subject.match(/([А-Я][а-я]+\s[А-Я]\.[А-Я]\.)\s?(\d[а-я])?\s?([А-Я][а-я]+\s[А-Я]\.[А-Я]\.)?/)
      let teachers = []
      let roomNumbers = []
      
      if (teacherMatch) {
        if (teacherMatch[1]) teachers.push(teacherMatch[1])
        if (teacherMatch[2]) roomNumbers.push(teacherMatch[2])
        if (teacherMatch[3]) teachers.push(teacherMatch[3])
      }
      
      if (roomPart) roomNumbers.push(roomPart.replace('а.', ''))
      
      return {
        subject: "Иностранный язык",
        room: roomNumbers.length > 0 ? `${roomNumbers.join('/')}` : "",
        teacher: teachers.join('/'),
        type: "practice"
      }
    }

    let teacher = "-"
    let type: "lecture" | "practice" | "lab" | "other" = "other"
    let room = roomPart ? `${roomPart}` : ""
    
    if (subject.startsWith("лекция:")) {
      type = "lecture"
      subject = subject.replace("лекция:", "").trim()
    } 
    else if (subject.startsWith("практические занятия:")) {
      type = "practice"
      subject = subject.replace("практические занятия:", "").trim()
    }
    else if (subject.startsWith("лабораторные занятия:")) {
      type = "lab"
      subject = subject.replace("лабораторные занятия:", "").trim()
    }

    const words = subject.split(' ')
    if (words.length >= 2) {
      const lastTwo = words.slice(-2).join(' ')
      if (lastTwo.match(/[А-Я][а-я]+\s[А-Я]\.[А-Я]\./)) {
        teacher = lastTwo
        subject = words.slice(0, -2).join(' ').trim()
      }
    }

    return {
      subject,
      room,
      teacher,
      type
    }
  }

  const parseTimetableData = (data: TimetableResponse): Record<string, Lesson[]> => {
    const result: Record<string, Lesson[]> = {}
    const { timetable } = data
    
    // Период с 1 сентября по 31 декабря 2025
    const startDate = new Date(2025, 8, 1) // 1 сентября 2025
    const endDate = new Date(2025, 11, 31) // 31 декабря 2025
    let currentDate = new Date(startDate)
    
    let isNumeratorWeek = true // Первая неделя - числитель

    const dayMapping: Record<string, string> = {
      "ПОНЕДЕЛЬНИК": "Пн",
      "ВТОРНИК": "Вт",
      "СРЕДА": "Ср",
      "ЧЕТВЕРГ": "Чт",
      "ПЯТНИЦА": "Пт",
      "СУББОТА": "Сб",
      "ВОСКРЕСЕНЬЕ": "Вс"
    }

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0]
      const dayOfWeekName = Object.keys(dayMapping).find(
        key => dayMapping[key] === ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][currentDate.getDay()]
      ) || ""
      
      const weekType = isNumeratorWeek ? "Числитель" : "Знаменатель"
      const dayLessons = timetable[weekType]?.[dayOfWeekName] || {}
      
      const parsedLessons: Lesson[] = []
      for (const [timeRange, lessonStr] of Object.entries(dayLessons)) {
        const [startTime, endTime] = timeRange.split('-')
        const { subject, room, teacher, type } = parseLessonString(lessonStr)
        
        parsedLessons.push({
          time: startTime.replace('.', ':'),
          endTime: endTime.replace('.', ':'),
          subject,
          room,
          teacher,
          type
        })
      }
      
      parsedLessons.sort((a, b) => a.time.localeCompare(b.time))
      if (parsedLessons.length > 0) {
        result[dateKey] = parsedLessons
      }

      currentDate.setDate(currentDate.getDate() + 1)
      
      if (currentDate.getDay() === 1) { // Понедельник - смена недели
        isNumeratorWeek = !isNumeratorWeek
      }
    }

    return result
  }

  const fetchTimetable = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`http://localhost:8080/api/timetable/${studentId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: TimetableResponse = await response.json()
      setGroupName(data.groupName)
      const parsedSchedule = parseTimetableData(data)
      setSchedule(parsedSchedule)
      
      const todayKey = new Date().toISOString().split('T')[0]
      setSelectedDateKey(
        parsedSchedule[todayKey] ? todayKey : 
        Object.keys(parsedSchedule)[0] || ""
      )
    } catch (err) {
      console.error("Failed to fetch timetable:", err)
      setError("Не удалось загрузить расписание. Пожалуйста, попробуйте позже.")
    } finally {
      setLoading(false)
    }
  }

  const setupWebSocket = useCallback(() => {
    const socket = new SockJS('http://localhost:8080/ws')
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.debug(str),
      onConnect: () => {
        console.log('WebSocket connected')
        client.subscribe(`/topic/timetable.updates.${studentId}`, (message) => {
          const update = JSON.parse(message.body)
          console.log('Received update:', update)
          fetchTimetable()
        })
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame.headers.message)
      }
    })

    client.activate()
    stompClientRef.current = client

    return client
  }, [studentId])

  useEffect(() => {
    fetchTimetable()
    const client = setupWebSocket()

    return () => {
      if (client?.connected) {
        client.deactivate()
      }
    }
  }, [studentId, setupWebSocket])

  const generateAllDates = () => {
    const daysOfWeek = language === "ru" 
      ? ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] 
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const months = language === "ru"
      ? ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 30); // Показываем 30 дней назад

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 180); // И 180 дней вперед

    const generatedDates: DateItem[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const isToday = currentDate.toDateString() === today.toDateString();

      generatedDates.push({
        date: currentDate.getDate(),
        day: daysOfWeek[currentDate.getDay()],
        month: months[currentDate.getMonth()],
        isToday,
        fullDate: new Date(currentDate),
        key: dateKey,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return generatedDates;
  };

  useEffect(() => {
    const allDates = generateAllDates()
    setDates(allDates)
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

  const getScheduleForDate = (): Lesson[] => {
    return schedule[selectedDateKey] || []
  }

  const getSelectedDateInfo = () => {
    const selectedDateObj = dates.find((d) => d.key === selectedDateKey)
    if (!selectedDateObj) return t.selectDate
    return `${selectedDateObj.month} ${selectedDateObj.date} • ${selectedDateObj.day}`
  }

  const getCardStyles = (type: "lecture" | "practice" | "lab" | "other") => {
    switch (type) {
      case "lecture": return "bg-card border border-border border-l-4 border-l-blue-500 shadow-sm hover:shadow-md"
      case "practice": return "bg-card border border-border border-l-4 border-l-red-500 shadow-sm hover:shadow-md"
      case "lab": return "bg-card border border-border border-l-4 border-l-green-500 shadow-sm hover:shadow-md"
      default: return "bg-card border border-border border-l-4 border-l-purple-500 shadow-sm hover:shadow-md"
    }
  }

  const getTypeStyles = (type: "lecture" | "practice" | "lab" | "other") => {
    switch (type) {
      case "lecture": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
      case "practice": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"
      case "lab": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800"
      default: return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
    }
  }

  const getTypeLabel = (type: "lecture" | "practice" | "lab" | "other") => {
    switch (type) {
      case "lecture": return t.lecture
      case "practice": return t.practice
      case "lab": return t.lab
      default: return t.other
    }
  }

  const currentSchedule = getScheduleForDate()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex items-center justify-between p-4 pt-12">
        <div>
          <h1 className="text-2xl font-bold">{t.schedule}</h1>
          <p className="text-muted-foreground">{groupName || t.loading}</p>
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
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-lg">{t.loadingSchedule}</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500 text-lg">{error}</p>
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
                      {lesson.teacher && lesson.teacher !== "-" && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            {t.teacherLabel}
                          </div>
                          <span className="text-foreground font-medium bg-accent/50 px-3 py-1.5 rounded-lg text-sm border border-accent/20">
                            {lesson.teacher}
                          </span>
                        </div>
                      )}
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