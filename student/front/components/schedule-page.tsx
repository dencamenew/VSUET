"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, User, ChevronLeft, ChevronRight, GraduationCap, QrCode, Check, X, Clock, Camera, CameraOff, ChevronDown, ChevronUp } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { toast } from "sonner"
import { Html5QrcodeScanner } from "html5-qrcode"

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

interface Lesson {
  date: string
  time: string
  endTime: string
  subject: string
  room: string
  audience: string
  teacher: string
  type: "lecture" | "practice" | "lab" | "other"
  turnout: boolean
  comment?: string | null
  grades?: {
    value: string
    date: string
  }[]
  attendance?: "present" | "absent" | "late"
  hasPassed: boolean
}

interface TimetableResponse {
  zachNumber: string
  timetable: Lesson[]
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
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [isUpdating, setIsUpdating] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [currentQRSubject, setCurrentQRSubject] = useState<string>("")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const stompClientRef = useRef<Client | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [currentQRDate, setCurrentQRDate] = useState<string>("")
  const [currentQRTime, setCurrentQRTime] = useState<string>("")
  const qrScannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [selectedComment, setSelectedComment] = useState<string | null>(null)
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

  // Проверка, прошло ли уже занятие
  const hasLessonPassed = (lessonDate: string, lessonTime: string): boolean => {
    try {
      const now = new Date()
      const [hours, minutes] = lessonTime.split(':').map(Number)
      const lessonDateTime = new Date(lessonDate)
      lessonDateTime.setHours(hours, minutes, 0, 0)
      
      return now > lessonDateTime
    } catch {
      return false
    }
  }

  // Функция запроса разрешения камеры
  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      // Проверяем, есть ли уже разрешение
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: "camera" as PermissionName });
        
        if (permissionStatus.state === "granted") {
          setCameraPermission("granted");
          return true;
        }
        
        if (permissionStatus.state === "denied") {
          setCameraPermission("denied");
          return false;
        }
      }

      // Запрашиваем доступ к камере
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment" // Предпочитаем заднюю камеру для сканирования QR-кодов
        } 
      });
      
      // Немедленно останавливаем поток, так как нам нужно только разрешение
      stream.getTracks().forEach(track => track.stop());
      
      setCameraPermission("granted");
      return true;
    } catch (error) {
      console.error("Разрешение камеры отклонено:", error);
      setCameraPermission("denied");
      return false;
    }
  };

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
                  turnout: update.status === "present",
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

  // Определение типа занятия на основе названия
  const determineLessonType = (subject: string): "lecture" | "practice" | "lab" | "other" => {
    const lowerSubject = subject.toLowerCase()
    
    if (lowerSubject.includes("лекция") || lowerSubject.includes("lecture")) {
      return "lecture"
    } else if (lowerSubject.includes("практика") || lowerSubject.includes("практические") || lowerSubject.includes("practice")) {
      return "practice"
    } else if (lowerSubject.includes("лабораторные") || lowerSubject.includes("lab")) {
      return "lab"
    } else {
      return "other"
    }
  }

  // Загрузка расписания для конкретной даты
  const fetchTimetableForDate = async (date: string) => {
    try {
      const response = await fetch(`${URL}/${date}/${studentId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          return [] // Нет занятий в этот день
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: TimetableResponse = await response.json()
      
      // Преобразуем данные в формат Lesson
      const lessons: Lesson[] = data.timetable.map(lesson => {
        const hasPassed = hasLessonPassed(lesson.date, lesson.time)

        const str = lesson.subject;
        const separator = ":";

        let subject = "";
        const index = str.indexOf(separator);

        if (index !== -1) {
          subject = str.slice(index + 1).trim();
        } else {
          subject =str;
        }

        
        return {
          date: lesson.date,
          time: lesson.time,
          endTime: calculateEndTime(lesson.time),
          subject: subject,
          room: lesson.audience,
          audience: lesson.audience,
          teacher: lesson.teacher,
          type: determineLessonType(lesson.subject),
          turnout: lesson.turnout,
          comment: lesson.comment, // Добавляем комментарий
          attendance: lesson.turnout ? "present" : hasPassed ? "absent" : undefined,
          hasPassed
        }
      })

      return lessons
    } catch (err) {
      console.error(`Ошибка загрузки расписания на ${date}:`, err)
      return []
    }
  }

  // Вычисление времени окончания занятия
  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endDate = new Date()
    endDate.setHours(hours)
    endDate.setMinutes(minutes)
    endDate.setHours(endDate.getHours() + 1, endDate.getMinutes() + 30)
    
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`
  }

  // Загрузка всего расписания
  const fetchFullTimetable = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log("Загрузка расписания для studentId:", studentId)
      
      const startDate = new Date(2025, 8, 1)
      const endDate = new Date(2025, 11, 31)
      
      const allSchedule: Record<string, Lesson[]> = {}
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const dateKey = getLocalDateString(currentDate)
        
        if (currentDate.getDay() !== 0) {
          const lessons = await fetchTimetableForDate(dateKey)
          
          if (lessons.length > 0) {
            allSchedule[dateKey] = lessons
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      setSchedule(allSchedule)
      
      const todayKey = getLocalDateString(new Date())
      const newSelectedDateKey = allSchedule[todayKey] ? todayKey : Object.keys(allSchedule)[0] || ""
      setSelectedDateKey(newSelectedDateKey)
      
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
                  fetchFullTimetable()
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

  // Генерация всех дат
  const generateAllDates = () => {
    const daysOfWeek =
      language === "ru"
        ? ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const months =
      language === "ru"
        ? ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const startDate = new Date(2025, 8, 1)
    const endDate = new Date(2025, 11, 31)
    const today = new Date()

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

  // Инициализация дат и WebSocket
  useEffect(() => {
    const allDates = generateAllDates()
    setDates(allDates)
  }, [language])

  useEffect(() => {
    let cleanup: () => void

    const init = async () => {
      await fetchFullTimetable()
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

  // Функции для сканирования QR-кода
  const startQRScanner = async (subject: string, date: string, time: string) => {
    const hasPermission = await requestCameraPermission();
    
    if (!hasPermission) {
      toast.error("Для сканирования QR-кодов необходим доступ к камере");
      return;
    }
    
    setCurrentQRSubject(subject);
    setCurrentQRDate(date);
    setCurrentQRTime(time);
    setShowQRScanner(true);
    
    // Инициализация сканера QR-кода после небольшой задержки для монтирования DOM
    setTimeout(() => {
      initQRScanner();
    }, 100);
  }

  const stopQRScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.clear().catch(error => {
        console.error("Failed to clear QR scanner", error)
      })
      qrScannerRef.current = null
    }
    
    // Остановка потока камеры
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    setShowQRScanner(false)
    setCurrentQRSubject("")
    setCurrentQRDate("")
    setCurrentQRTime("")
  }

  const initQRScanner = () => {
    if (!document.getElementById('qr-reader')) return
    
    try {
      // Создаем сканер QR-кода
      qrScannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [] 
        },
        false
      )
      
      // Обработка успешного сканирования
      qrScannerRef.current.render((decodedText, decodedResult) => {
        console.log(`QR Code detected: ${decodedText}`, decodedResult)
        handleScannedQRCode(decodedText)
      }, (errorMessage) => {
        // Игнорируем ошибки, так как они происходят постоянно, пока не найден QR-код
      })
    } catch (error) {
      console.error("Error initializing QR scanner:", error)
      toast.error(t.qrScannerError)
      stopQRScanner()
    }
  }

  const handleScannedQRCode = (qrData: string) => {
    try {
      // Парсим данные QR-кода (ожидаем JSON)
      const qrDataObj = JSON.parse(qrData)
      
      // Проверяем, что QR-код содержит нужные данные
      if (qrDataObj.subject && qrDataObj.date && qrDataObj.time) {
        // Отправляем данные на сервер для отметки посещения
        markAttendance(qrDataObj.subject, qrDataObj.date, qrDataObj.time)
      } else {
        toast.error(t.invalidQRCode)
      }
    } catch (error) {
      console.error("Error parsing QR code data:", error)
      toast.error(t.invalidQRCode)
    }
    
    stopQRScanner()
  }

  const markAttendance = async (subject: string, date: string, time: string) => {
    try {
      setIsUpdating(true)
      
      const response = await fetch(`${URL}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          subject,
          date,
          time,
          status: "present"
        }),
      })
      
      if (response.ok) {
        toast.success(t.attendanceMarked)
        
        // Обновляем локальное состояние
        setSchedule(prev => {
          const newSchedule = { ...prev }
          const dateKey = getLocalDateString(new Date(date))
          
          if (newSchedule[dateKey]) {
            newSchedule[dateKey] = newSchedule[dateKey].map(lesson => {
              if (lesson.subject === subject && lesson.date === date && lesson.time === time) {
                return {
                  ...lesson,
                  turnout: true,
                  attendance: "present"
                }
              }
              return lesson
            })
          }
          
          return newSchedule
        })
      } else {
        throw new Error("Failed to mark attendance")
      }
    } catch (error) {
      console.error("Error marking attendance:", error)
      toast.error(t.attendanceError)
    } finally {
      setIsUpdating(false)
    }
  }

  // Проверка статуса разрешения камеры при загрузке
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        if (navigator.permissions) {
          const permissionStatus = await navigator.permissions.query({ name: "camera" as PermissionName });
          setCameraPermission(permissionStatus.state as "granted" | "denied" | "prompt");
          
          // Слушаем изменения разрешения
          permissionStatus.onchange = () => {
            setCameraPermission(permissionStatus.state as "granted" | "denied" | "prompt");
          };
        }
      } catch (error) {
        console.error("Ошибка проверки разрешения камеры:", error);
      }
    };
    
    checkCameraPermission();
  }, []);

  // Функция для обрезки комментария
  const truncateComment = (comment: string, maxLength: number = 10): string => {
    if (comment.length <= maxLength) return comment;
    return comment.substring(0, maxLength) + '...';
  };

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

  const isToday = (dateString: string): boolean => {
    return getLocalDateString(new Date()) === dateString;
  };

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

  // Функция для отображения индикатора посещаемости
  const renderAttendanceIndicator = (lesson: Lesson) => {
    if (!lesson.hasPassed) {
      // Занятие еще не прошло - белый кружок
      return (
        <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
          <Clock className="w-3 h-3 text-gray-400" />
        </div>
      )
    }

    if (lesson.turnout) {
      // Посещено - зеленый кружок
      return (
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <Check className="w-4 w-4 text-white" />
        </div>
      )
    } else {
      // Не посещено - красный кружок
      return (
        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
          <X className="w-4 w-4 text-white" />
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Модальное окно для полного комментария */}
      {/* Модальное окно для полного комментария */}
      {selectedComment && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedComment(null)}
        >
          <div 
            className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{t.teacherComment}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedComment(null)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="bg-muted p-4 rounded-lg mb-4 overflow-auto max-h-60">
              <p className="text-foreground break-words whitespace-pre-wrap hyphens-auto text-justify">
                {selectedComment}
              </p>
            </div>
            
            <Button 
              onClick={() => setSelectedComment(null)}
              className="w-full"
            >
              {t.close}
            </Button>
          </div>
        </div>
      )}

      {showQRScanner && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{t.scanQRCode}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={stopQRScanner}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4 text-center">
              {currentQRSubject}
            </p>
            
            {/* Контейнер для сканера QR-кода */}
            <div 
              id="qr-reader" 
              className="w-full mb-4 rounded-lg overflow-hidden border border-border bg-black"
            />
            
            <div className="flex flex-col gap-2">
              
              {cameraPermission === "denied" && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
                  <p className="text-destructive text-sm text-center">
                    {t.qrCameraError}
                  </p>
                </div>
              )}
              
              <div className="flex justify-center gap-3 mt-2">
                <Button 
                  onClick={stopQRScanner} 
                  variant="outline"
                  className="flex-1"
                >
                  {t.cancel}
                </Button>
                
                {cameraPermission === "denied" && (
                  <Button 
                    onClick={() => {
                      stopQRScanner();
                      setTimeout(() => startQRScanner(currentQRSubject, currentQRDate, currentQRTime), 100);
                    }}
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {t.retry}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Шапка */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div>
          <h1 className="text-2xl font-bold">{t.schedule}</h1>
          <p className="text-muted-foreground">{studentId}</p>
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
              <div key={index} className={`${getCardStyles(lesson.type)} rounded-xl p-4 transition-all duration-200 relative`}>
                {/* Индикатор посещаемости */}
                <div className="absolute top-4 right-4">
                  {renderAttendanceIndicator(lesson)}
                </div>

                {/* Кнопка QR-сканера */}
                {lesson.hasPassed && !lesson.turnout && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-12"
                    onClick={() => startQRScanner(lesson.subject, lesson.date, lesson.time)}
                    title={t.scanQRCode}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-8">
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

                    {lesson.comment && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          {t.teacherComment}
                        </div>
                        <button
                          onClick={() => setSelectedComment(lesson.comment || '')}
                          className="text-left bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-lg transition-colors text-sm w-[100px] whitespace-nowrap overflow-hidden" // Теперь такой же стиль как у других элементов
                        >
                          <p className="text-foreground font-medium truncate"> {/* Добавил font-medium */}
                            {truncateComment(lesson.comment)}
                          </p>
                        </button>
                      </div>
                    )}
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