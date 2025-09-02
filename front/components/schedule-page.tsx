"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, User, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { toast } from "sonner"

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
  weekType?: "Числитель" | "Знаменатель" | "Numerator" | "Denominator"
}

interface Lesson {
  time: string
  endTime: string
  subject: string
  room: string
  teacher: string
  type: "lecture" | "practice" | "lab" | "other"
  weekType?: "Числитель" | "Знаменатель" | "Numerator" | "Denominator"
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
  eventType: "GRADE_CHANGED"
  studentId: string
  subject: string
  date: string
  newGrade: string
  oldGrade?: string
}

interface AttendanceUpdate {
  eventType: "ATTENDANCE_UPDATED"
  studentId: string
  subject: string
  date: string
  status: "present" | "absent" | "late"
}

interface ScheduleUpdate {
  eventType: "SCHEDULE_CHANGED"
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
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [isUpdating, setIsUpdating] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const stompClientRef = useRef<Client | null>(null)

  const t = translations[language] || translations.en

  const URL = process.env.NEXT_PUBLIC_API_URL
  const SOCKET_URL = process.env.SOCKET_URL

  // Функция для получения локальной даты в формате YYYY-MM-DD
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Функция для перевода типа недели
  const getWeekTypeTranslation = (weekType: "Числитель" | "Знаменатель"): string => {
    if (language === "ru") {
      return weekType
    } else {
      return weekType === "Числитель" ? "Numerator" : "Denominator"
    }
  }

  // Функция обработки обновления оценки
  const handleGradeChange = useCallback(
    (update: GradeUpdate) => {
      setIsUpdating(true)
      try {
        setSchedule((prev) => {
          const newSchedule = { ...prev }
          const dateKey = getLocalDateString(new Date(update.date))

          if (newSchedule[dateKey]) {
            newSchedule[dateKey] = newSchedule[dateKey].map((lesson) => {
              if (lesson.subject === update.subject && lesson.time === update.date.split("T")[1].substring(0, 5)) {
                return {
                  ...lesson,
                  grades: [
                    ...(lesson.grades || []),
                    {
                      value: update.newGrade,
                      date: update.date,
                    },
                  ],
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
    },
    [t.gradeUpdated],
  )

  // Функция обработки обновления посещаемости
  const handleAttendanceUpdate = useCallback(
    (update: AttendanceUpdate) => {
      setIsUpdating(true)
      try {
        setSchedule((prev) => {
          const newSchedule = { ...prev }
          const dateKey = getLocalDateString(new Date(update.date))

          if (newSchedule[dateKey]) {
            newSchedule[dateKey] = newSchedule[dateKey].map((lesson) => {
              if (lesson.subject === update.subject && lesson.time === update.date.split("T")[1].substring(0, 5)) {
                return {
                  ...lesson,
                  attendance: update.status,
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
    },
    [t],
  )

  // Парсинг информации о занятии
  const parseLessonString = (lessonStr: string): Omit<Lesson, "time" | "endTime"> => {
    if (lessonStr.includes("физической культуре")) {
      const subject = lessonStr.split("(")[0].replace(", общая физическая", "").trim()
      return {
        subject: "Элективные дисциплины (курсы) по физической культуре и спорту",
        room: "а.подготовка",
        teacher: "-",
        type: "other",
      }
    }

    const parts = lessonStr.split("(")
    let subject = parts[0].trim()
    const roomPart = parts[1]?.replace(")", "").trim() || ""

    if (subject.includes("Иностранный язык")) {
      const teacherMatch = subject.match(/([А-Я][а-я]+\s[А-Я]\.[А-Я]\.)\s?(\d[а-я])?\s?([А-Я][а-я]+\s[А-Я]\.[А-Я]\.)?/)
      const teachers = []
      const roomNumbers = []

      if (teacherMatch) {
        if (teacherMatch[1]) teachers.push(teacherMatch[1])
        if (teacherMatch[2]) roomNumbers.push(teacherMatch[2])
        if (teacherMatch[3]) teachers.push(teacherMatch[3])
      }

      if (roomPart) roomNumbers.push(roomPart.replace("а.", ""))

      return {
        subject: "Иностранный язык",
        room: roomNumbers.length > 0 ? `${roomNumbers.join("/")}` : "",
        teacher: teachers.join("/"),
        type: "practice",
      }
    }

    let teacher = "-"
    let type: "lecture" | "practice" | "lab" | "other" = "other"
    const room = roomPart ? `${roomPart}` : ""

    if (subject.startsWith("лекция:")) {
      type = "lecture"
      subject = subject.replace("лекция:", "").trim()
    } else if (subject.startsWith("практические занятия:")) {
      type = "practice"
      subject = subject.replace("практические занятия:", "").trim()
    } else if (subject.startsWith("лабораторные занятия:")) {
      type = "lab"
      subject = subject.replace("лабораторные занятия:", "").trim()
    }

    const words = subject.split(" ")
    if (words.length >= 2) {
      const lastTwo = words.slice(-2).join(" ")
      if (lastTwo.match(/[А-Я][а-я]+\s[А-Я]\.[А-Я]\./)) {
        teacher = lastTwo
        subject = words.slice(0, -2).join(" ").trim()
      }
    }

    return {
      subject,
      room,
      teacher,
      type,
    }
  }

  // Парсинг расписания
  const parseTimetableData = (data: TimetableResponse): Record<string, Lesson[]> => {
    const result: Record<string, Lesson[]> = {}
    const { timetable } = data

    // Карта соответствия русских названий дней и номеров дней недели в JS
    const RUSSIAN_DAY_TO_JS: Record<string, number> = {
      ПОНЕДЕЛЬНИК: 1, // Понедельник = 1
      ВТОРНИК: 2, // Вторник = 2
      СРЕДА: 3, // Среда = 3
      ЧЕТВЕРГ: 4, // Четверг = 4
      ПЯТНИЦА: 5, // Пятница = 5
      СУББОТА: 6, // Суббота = 6
      ВОСКРЕСЕНЬЕ: 0, // Воскресенье = 0
    }

    // 1 сентября 2025 года - это понедельник
    const FIRST_DAY = new Date(2025, 8, 1) // 1 сентября 2025

    // Проверяем что это действительно понедельник
    if (FIRST_DAY.getDay() !== 1) {
      console.error(
        "Ошибка: 1 сентября 2025 должно быть понедельником, а это:",
        ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][FIRST_DAY.getDay()],
      )
      return {}
    }

    const endDate = new Date(2025, 11, 31) // 31 декабря 2025
    const currentDate = new Date(FIRST_DAY)

    console.log("Начало парсинга расписания...")
    console.log("Доступные дни в числителе:", Object.keys(timetable.Числитель || {}))
    console.log("Доступные дни в знаменателе:", Object.keys(timetable.Знаменатель || {}))

    while (currentDate <= endDate) {
      const dateKey = getLocalDateString(currentDate)
      const jsDayOfWeek = currentDate.getDay() // 0=Вс, 1=Пн, ..., 6=Сб

      // Пропускаем воскресенья (нет занятий)
      if (jsDayOfWeek !== 0) {
        // Находим русское название дня для текущего дня недели
        const russianDayName = Object.keys(RUSSIAN_DAY_TO_JS).find((key) => RUSSIAN_DAY_TO_JS[key] === jsDayOfWeek)

        if (!russianDayName) {
          console.warn(`Не найдено русское название для дня недели: ${jsDayOfWeek}`)
          currentDate.setDate(currentDate.getDate() + 1)
          continue
        }

        // Определяем тип недели (числитель/знаменатель)
        // Считаем сколько полных недель прошло с 1 сентября
        const timeDiff = currentDate.getTime() - FIRST_DAY.getTime()
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
        const weekNumber = Math.floor(daysDiff / 7)
        const isNumerator = weekNumber % 2 === 0
        const weekType = isNumerator ? "Числитель" : "Знаменатель"

        // Получаем расписание для этого дня и типа недели
        const dayLessons = timetable[weekType]?.[russianDayName] || {}

        const parsedLessons: Lesson[] = []
        for (const [timeRange, lessonStr] of Object.entries(dayLessons)) {
          const [startTime, endTime] = timeRange.split("-")
          const { subject, room, teacher, type } = parseLessonString(lessonStr)

          parsedLessons.push({
            time: startTime.replace(".", ":"),
            endTime: endTime.replace(".", ":"),
            subject,
            room,
            teacher,
            type,
            weekType: weekType,
          })
        }

        parsedLessons.sort((a, b) => a.time.localeCompare(b.time))
        if (parsedLessons.length > 0) {
          result[dateKey] = parsedLessons
          console.log(`✅ ${dateKey} (${russianDayName}, ${weekType}): ${parsedLessons.length} занятий`)
        }
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    console.log("Парсинг завершен. Всего дней с занятиями:", Object.keys(result).length)
    return result
  }

  // Загрузка расписания
  const fetchTimetable = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Загрузка расписания для studentId:", studentId)
      const response = await fetch(`${URL}/timetable/${studentId}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: TimetableResponse = await response.json()
      setGroupName(data.groupName)

      console.log("✅ Данные получены успешно")
      console.log("Группа:", data.groupName)
      console.log("Номер зачётки:", data.zachNumber)

      // Проверим структуру расписания
      if (data.timetable) {
        console.log("Числитель дни:", Object.keys(data.timetable.Числитель || {}))
        console.log("Знаменатель дни:", Object.keys(data.timetable.Знаменатель || {}))

        // Посмотрим на конкретные дни
        Object.keys(data.timetable.Числитель || {}).forEach((day) => {
          console.log(`Числитель ${day}:`, Object.keys(data.timetable.Числитель[day] || {}).length, "занятий")
        })
      }

      const parsedSchedule = parseTimetableData(data)
      setSchedule(parsedSchedule)

      const todayKey = getLocalDateString(new Date())
      const newSelectedDateKey = parsedSchedule[todayKey] ? todayKey : Object.keys(parsedSchedule)[0] || ""
      setSelectedDateKey(newSelectedDateKey)

      console.log("Выбрана дата:", newSelectedDateKey)
    } catch (err) {
      console.error("❌ Ошибка загрузки расписания:", err)
      setError(t.scheduleLoadError)
    } finally {
      setLoading(false)
    }
  }

  // Настройка WebSocket
  const setupWebSocket = useCallback(() => {
    const socket = new SockJS(`${SOCKET_URL}`)
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.debug(str),

      onConnect: () => {
        setConnectionStatus("connected")
        console.log("WebSocket connected")
        client.subscribe(`/topic/gradebook.updates.${studentId}`, (message) => {
          try {
            const update: WebSocketMessage = JSON.parse(message.body)
            console.log("Received update:", update)

            if (update.studentId === studentId) {
              switch (update.eventType) {
                case "GRADE_CHANGED":
                  handleGradeChange(update)
                  break
                case "ATTENDANCE_UPDATED":
                  handleAttendanceUpdate(update)
                  break
                case "SCHEDULE_CHANGED":
                  fetchTimetable()
                  toast.info(t.scheduleUpdated)
                  break
                default:
                  console.warn("Unknown update type:", update)
              }
            }
          } catch (err) {
            console.error("Error processing WebSocket message:", err)
          }
        })
      },

      onDisconnect: () => {
        setConnectionStatus("disconnected")
        console.log("WebSocket disconnected")
      },

      onStompError: (frame) => {
        setConnectionStatus("disconnected")
        console.error("WebSocket error:", frame.headers.message)
      },
    })

    client.activate()
    stompClientRef.current = client

    return () => {
      if (client.connected) {
        client.deactivate()
      }
    }
  }, [studentId, handleGradeChange, handleAttendanceUpdate, t.scheduleUpdated])

  const generateAllDates = () => {
    const daysOfWeek =
      language === "ru"
        ? ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] // Правильный порядок: 0=Вс, 1=Пн, ..., 6=Сб
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
      const dayIndex = currentDate.getDay() // 0=Вс, 1=Пн, ..., 6=Сб

      generatedDates.push({
        date: currentDate.getDate(),
        day: daysOfWeek[dayIndex], // Правильный индекс
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
  }, [studentId])

  useEffect(() => {
    const cleanup = setupWebSocket()
    return cleanup
  }, [setupWebSocket])

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

  const getAttendanceBadge = (status?: "present" | "absent" | "late") => {
    if (!status) return null

    const styles = {
      present:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
      absent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
      late: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
    }

    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{t[status]}</span>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Шапка */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div>
          <h1 className="text-2xl font-bold">{t.schedule}</h1>
          <p className="text-muted-foreground">{groupName || t.loading}</p>
        </div>
      </div>

      {/* Календарь */}
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

      {/* Выбранная дата */}
      <div className="px-4 mb-4">
        <p className="text-muted-foreground">
          {selectedDateInfo}
          {schedule[selectedDateKey]?.[0]?.weekType &&
            ` • ${getWeekTypeTranslation(schedule[selectedDateKey][0].weekType as "Числитель" | "Знаменатель")}`}
        </p>
      </div>

      {/* Список занятий */}
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
                          <span className="text-primary font-semibold bg-primary/10 px-3 py-1.5 rounded-lg text-sm">
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
                              <span
                                key={i}
                                className="text-foreground font-medium bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-lg text-sm"
                              >
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
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex justify-around py-3">
          <Button variant="ghost" size="icon" onClick={() => onNavigate("schedule")}>
            <Calendar className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onNavigate("rating")}>
            <GraduationCap className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onShowProfile}>
            <User className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}