"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Search, Grid3X3, Calendar, User, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { toast } from 'sonner'

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
  grades?: {
    value: string
    date: string
  }[]
  attendance?: "present" | "absent" | "late"
}

interface TimetableResponse {
  zachNumber: string
  groupName: string
  timetable: {
    Числитель: Record<string, Record<string, string>>
    Знаменатель: Record<string, Record<string, string>>
  }
}

interface GradeUpdate {
  eventType: 'GRADE_CHANGED'
  studentId: string
  subject: string
  date: string
  newGrade: string
  oldGrade?: string
}

interface AttendanceUpdate {
  eventType: 'ATTENDANCE_UPDATED'
  studentId: string
  subject: string
  date: string
  status: 'present' | 'absent' | 'late'
}

interface ScheduleUpdate {
  eventType: 'SCHEDULE_CHANGED'
  groupId: string
  studentId: string
}

type WebSocketMessage = GradeUpdate | AttendanceUpdate | ScheduleUpdate

export default function SchedulePage({ studentId, onNavigate, onShowProfile, language }: SchedulePageProps) {
  const [selectedDateKey, setSelectedDateKey] = useState<string>("")
  const [dates, setDates] = useState<DateItem[]>([])
  const [schedule, setSchedule] = useState<Record<string, Lesson[]>>({})
  const [groupName, setGroupName] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [isUpdating, setIsUpdating] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const stompClientRef = useRef<Client | null>(null)

  const t = translations[language]

  // Функция обработки обновления оценки
  const handleGradeChange = useCallback((update: GradeUpdate) => {
    setIsUpdating(true)
    try {
      setSchedule(prev => {
        const newSchedule = {...prev}
        const dateKey = update.date.split('T')[0]
        
        if (newSchedule[dateKey]) {
          newSchedule[dateKey] = newSchedule[dateKey].map(lesson => {
            if (lesson.subject === update.subject && lesson.time === update.date.split('T')[1].substring(0, 5)) {
              return {
                ...lesson,
                grades: [
                  ...(lesson.grades || []),
                  {
                    value: update.newGrade,
                    date: update.date
                  }
                ]
              }
            }
            return lesson
          })
        }
        
        return newSchedule
      })
      
      toast.success(`${t.gradeUpdated}: ${update.subject} - ${update.newGrade}`)
    } finally {
      setIsUpdating(false)
    }
  }, [t.gradeUpdated])

  // Функция обработки обновления посещаемости
  const handleAttendanceUpdate = useCallback((update: AttendanceUpdate) => {
    setIsUpdating(true)
    try {
      setSchedule(prev => {
        const newSchedule = {...prev}
        const dateKey = update.date.split('T')[0]
        
        if (newSchedule[dateKey]) {
          newSchedule[dateKey] = newSchedule[dateKey].map(lesson => {
            if (lesson.subject === update.subject && lesson.time === update.date.split('T')[1].substring(0, 5)) {
              return {
                ...lesson,
                attendance: update.status
              }
            }
            return lesson
          })
        }
        
        return newSchedule
      })
      
      toast.info(`${t.attendanceUpdated}: ${update.subject} - ${t[update.status]}`)
    } finally {
      setIsUpdating(false)
    }
  }, [t])

  // Парсинг информации о занятии
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

  // Парсинг расписания
  const parseTimetableData = (data: TimetableResponse): Record<string, Lesson[]> => {
    const result: Record<string, Lesson[]> = {}
    const { timetable } = data
    
    const startDate = new Date(2025, 8, 1)
    const endDate = new Date(2025, 11, 31)
    let currentDate = new Date(startDate)
    
    let isNumeratorWeek = true

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
      
      if (currentDate.getDay() === 1) {
        isNumeratorWeek = !isNumeratorWeek
      }
    }

    return result
  }

  // Загрузка расписания
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
      setError(t.scheduleLoadError)
    } finally {
      setLoading(false)
    }
  }

  // Настройка WebSocket
  const setupWebSocket = useCallback(() => {
    const socket = new SockJS('http://localhost:8080/ws')
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.debug(str),
      
      onConnect: () => {
        setConnectionStatus('connected')
        console.log('WebSocket connected')
        client.subscribe(`/topic/gradebook.updates.${studentId}`, (message) => {
          try {
            const update: WebSocketMessage = JSON.parse(message.body)
            console.log('Received update:', update)
            
            if (update.studentId === studentId) {
              switch (update.eventType) {
                case 'GRADE_CHANGED':
                  handleGradeChange(update)
                  break
                case 'ATTENDANCE_UPDATED':
                  handleAttendanceUpdate(update)
                  break
                case 'SCHEDULE_CHANGED':
                  fetchTimetable()
                  toast.info(t.scheduleUpdated)
                  break
                default:
                  console.warn('Unknown update type:', update)
              }
            }
          } catch (err) {
            console.error('Error processing WebSocket message:', err)
          }
        })
      },
      
      onDisconnect: () => {
        setConnectionStatus('disconnected')
        console.log('WebSocket disconnected')
      },
      
      onStompError: (frame) => {
        setConnectionStatus('disconnected')
        console.error('WebSocket error:', frame.headers.message)
      }
    })

    client.activate()
    stompClientRef.current = client

    return () => {
      if (client.connected) {
        client.deactivate()
      }
    }
  }, [studentId, handleGradeChange, handleAttendanceUpdate, t.scheduleUpdated])

  // Генерация дат для календаря
  const generateAllDates = () => {
    const daysOfWeek = language === "ru" 
      ? ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] 
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const months = language === "ru"
      ? ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 30)

    const endDate = new Date(today)
    endDate.setDate(today.getDate() + 180)

    const generatedDates: DateItem[] = []
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0]
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

  // Инициализация дат и WebSocket
  useEffect(() => {
    const allDates = generateAllDates()
    setDates(allDates)
  }, [language])

  useEffect(() => {
    let cleanup: () => void
    
    const init = async () => {
      await fetchTimetable()
      cleanup = setupWebSocket()
    }

    init()
    
    return () => {
      if (cleanup) cleanup()
      if (stompClientRef.current?.connected) {
        stompClientRef.current.deactivate()
      }
    }
  }, [studentId, setupWebSocket])

  // Вспомогательные функции
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
    const selectedDateObj = dates.find(d => d.key === selectedDateKey)
    if (!selectedDateObj) return t.selectDate
    return `${selectedDateObj.month} ${selectedDateObj.date} • ${selectedDateObj.day}`
  }, [dates, selectedDateKey, language])

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

  const getAttendanceBadge = (status?: "present" | "absent" | "late") => {
    if (!status) return null
    
    const styles = {
      present: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
      absent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
      late: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {t[status]}
      </span>
    )
  }

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

      {/* Индикатор статуса соединения */}
      <div className="flex items-center gap-2 px-4 pb-2">
        <div className={`w-3 h-3 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-500' : 
          connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <span className="text-xs text-muted-foreground">
          {connectionStatus === 'connected' ? t.synced : 
           connectionStatus === 'connecting' ? t.connecting : t.offline}
        </span>
        {isUpdating && (
          <span className="text-xs text-muted-foreground animate-pulse">
            {t.updating}
          </span>
        )}
      </div>

      {/* Календарь */}
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

      {/* Выбранная дата */}
      <div className="px-4 mb-8">
        <p className="text-muted-foreground">{selectedDateInfo}</p>
      </div>

      {/* Расписание */}
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
                      {getAttendanceBadge(lesson.attendance)}
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
                      {lesson.grades?.length ? (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            {t.gradesLabel}
                          </div>
                          <div className="flex gap-2">
                            {lesson.grades.map((grade, i) => (
                              <span key={i} className="text-foreground font-medium bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-lg text-sm">
                                {grade.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Нижнее меню */}
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