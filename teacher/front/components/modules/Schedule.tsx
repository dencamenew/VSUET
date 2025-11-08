"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import {
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
  MessageSquare,
  Send,
  ArrowLeft,
  Edit,
  Trash2,
  QrCode
} from "lucide-react"
import { QRCodeSVG } from 'qrcode.react'
import { useSession } from '@/hooks/useSession'
import { Language, translations } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import BottomNavigation from "@/components/navigation/Navigation"
import { DayOfWeek, ILessonSlot, useTimetable, WeekType } from "@/hooks/api/useTimetable"
import CalendarSlider, { DateItem } from "@/components/inputs/CalendarSlider"
import { ScheduleList } from "@/components/ui/ScheduleList"
import { useLanguage } from "@/hooks/useLanguage"

interface CachedSchedule {
  data: Record<string, Lesson[]>;
  timestamp: number;
  teacherName: string;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 минут в миллисекундах
const CACHE_KEY = 'teacher_schedule_cache';


interface TeacherSchedulePageProps {
  userName: string
}


// interface DateItem {
//   date: number
//   day: string
//   month: string
//   isToday: boolean
//   fullDate: Date
//   key: string
// }

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  lesson: Lesson | null
  language: Language
  selectedDate: string
  initialComment?: string
  onSaveComment: (comment: string) => void
  onDeleteComment?: () => void
  isEditMode?: boolean
}

interface QRModalProps {
  isOpen: boolean
  onClose: () => void
  lesson: Lesson | null
  language: Language
  selectedDate: string
  teacherName: string
  getAuthHeaders: () => HeadersInit
}

interface ViewCommentModalProps {
  isOpen: boolean
  onClose: () => void
  comment: string
  lesson: Lesson | null
  language: Language
  onEditComment: () => void
  onDeleteComment: () => void
}

interface ApiScheduleItem {
  id: number
  time: string
  date: string
  subject: string
  groupName: string
  typeSubject: string
  audience: string
}

interface ApiScheduleResponse {
  schedule: ApiScheduleItem[]
  teacher: string
  date: string
}

interface Lesson {
  id: number
  subject: string
  time: string
  endTime: string
  room: string
  group: string
  type: "lecture" | "practice" | "lab" | "other"
}

interface CommentResponse {
  success: boolean;
  comment?: string;
  exists?: boolean;
  message?: string;
  error?: string;
  updatedRows?: number;
  deletedRows?: number;
}

interface CommentRequest {
  subject: string;
  groupName: string;
  time: string;
  date: string;
  teacher: string;
  comment: string;
}


// Функция для получения кешированных данных
const getCachedSchedule = (teacherName: string): Record<string, Lesson[]> | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cachedData: CachedSchedule = JSON.parse(cached);

    // Проверяем актуальность кеша и соответствие преподавателя
    const isCacheValid =
      Date.now() - cachedData.timestamp < CACHE_DURATION &&
      cachedData.teacherName === teacherName;

    return isCacheValid ? cachedData.data : null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

// Функция для сохранения данных в кеш
const saveToCache = (data: Record<string, Lesson[]>, teacherName: string) => {
  try {
    const cacheData: CachedSchedule = {
      data,
      timestamp: Date.now(),
      teacherName
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

function CommentModal({
  isOpen,
  onClose,
  lesson,
  language,
  selectedDate,
  initialComment = "",
  onSaveComment,
  onDeleteComment,
  isEditMode = false
}: CommentModalProps) {
  const [comment, setComment] = useState(initialComment)
  const t = translations[language] || translations.en
  const MAX_COMMENT_LENGTH = 100

  useEffect(() => {
    setComment(initialComment)
  }, [initialComment])

  if (!isOpen || !lesson) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    onSaveComment(comment.trim())
    setComment("")
    onClose()
  }

  const handleDelete = () => {
    if (onDeleteComment) {
      onDeleteComment()
    }
    onClose()
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

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_COMMENT_LENGTH) {
      setComment(e.target.value)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
      <div className="w-full max-w-md bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{t.comment || "Комментарий"}</h3>
          <div className="flex gap-1">
            {isEditMode && onDeleteComment && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="p-1 hover:bg-muted rounded-lg text-destructive"
                title={t.delete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg"
              title={t.back}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-foreground">{lesson.subject}</p>
          <p className="text-xs text-muted-foreground">
            {lesson.time} - {lesson.endTime} • {lesson.group}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(selectedDate)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder={t.commentPlaceholder}
              value={comment}
              onChange={handleCommentChange}
              className="min-h-[100px] bg-background border-border text-foreground focus:border-primary focus:ring-primary/20 resize-none"
              autoFocus
              maxLength={MAX_COMMENT_LENGTH}
            />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">
                {comment.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>
          </div>
          <Button
            type="submit"
            disabled={!comment.trim()}
            className="w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-black"
          >
            <Send className="w-4 h-4 mr-2 text-black" />
            {isEditMode ? t.save : t.send}
          </Button>
        </form>
      </div>
    </div>
  )
}

function QRModal({ isOpen, onClose, lesson, language, selectedDate, teacherName, getAuthHeaders }: QRModalProps) {
  const [currentQrUrl, setCurrentQrUrl] = useState<string>("")
  const [nextQrUrl, setNextQrUrl] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [timer, setTimer] = useState<number>(120)
  const [isSwitching, setIsSwitching] = useState<boolean>(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const switchRef = useRef<NodeJS.Timeout | null>(null)




  const URL = "http://localhost:8081/api"

  useEffect(() => {
    if (isOpen && lesson) {
      generateQRCodeForLesson()
    } else {
      setCurrentQrUrl("")
      setNextQrUrl("")
      setError("")
      setTimer(120)
      setIsSwitching(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (switchRef.current) {
        clearTimeout(switchRef.current)
        switchRef.current = null
      }
    }
  }, [isOpen, lesson, selectedDate])

  useEffect(() => {
    if (currentQrUrl && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [currentQrUrl, timer])



  useEffect(() => {
    if (timer === 0 && timerRef.current && currentQrUrl) {
      clearInterval(timerRef.current)
      timerRef.current = null

      // Начинаем процесс плавной смены QR-кода
      setIsSwitching(true)

      // Генерируем следующий QR-код
      generateNextQRCode()
    }
  }, [timer, currentQrUrl])

  useEffect(() => {
    if (nextQrUrl && isSwitching) {
      // Плавно переключаем на новый QR-код
      switchRef.current = setTimeout(() => {
        setCurrentQrUrl(nextQrUrl)
        setNextQrUrl("")
        setIsSwitching(false)
        setTimer(120)
      }, 200)
    }

    return () => {
      if (switchRef.current) {
        clearTimeout(switchRef.current)
      }
    }
  }, [nextQrUrl, isSwitching])

  const generateNextQRCode = async () => {
    if (!lesson) return

    try {
      const request = {
        subject: lesson.subject,
        groupName: lesson.group,
        time: lesson.time, // ← ИЗМЕНИТЬ: было startLessonTime
        endLessonTime: lesson.endTime,
        date: selectedDate, // ← ИЗМЕНИТЬ: было classDate
        teacher: teacherName // ← ИЗМЕНИТЬ: было teacherName
      }

      const response = await fetch(`${URL}/qr/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Ошибка при создании QR-кода')
      }

      const qrUrl = await response.text() // Теперь получаем просто строку с URL

      if (qrUrl) {
        setNextQrUrl(qrUrl)
      } else {
        throw new Error('Пустой ответ от сервера')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      console.error('Error generating QR:', err)
      // Если ошибка, сбрасываем состояние переключения
      setIsSwitching(false)
      setTimer(10) // Перезапускаем таймер
    }
  }

  const generateQRCodeForLesson = async () => {
    if (!lesson) return

    setLoading(true)
    setError("")
    setTimer(10)

    try {
      const request = {
        subject: lesson.subject,
        groupName: lesson.group,
        time: lesson.time, // ← ИЗМЕНИТЬ: было startLessonTime
        endLessonTime: lesson.endTime,
        date: selectedDate, // ← ИЗМЕНИТЬ: было classDate
        teacher: teacherName // ← ИЗМЕНИТЬ: было teacherName
      }

      const response = await fetch(`${URL}/qr/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Ошибка при создании QR-кода')
      }

      const qrUrl = await response.text() // Теперь получаем просто строку с URL

      if (qrUrl) {
        setCurrentQrUrl(qrUrl)
      } else {
        throw new Error('Пустой ответ от сервера')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      console.error('Error generating QR:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !lesson) return null

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
          {loading && !currentQrUrl ? (
            <div className="w-48 h-48 flex items-center justify-center bg-white rounded-lg border-2 border-border">
              <p className="text-muted-foreground">
                {language === "ru" ? "Загрузка..." : "Loading..."}
              </p>
            </div>
          ) : error ? (
            <div className="w-48 h-48 flex items-center justify-center bg-white rounded-lg border-2 border-border">
              <p className="text-destructive text-center text-sm">
                {error}
              </p>
            </div>
          ) : currentQrUrl ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 border-2 border-border w-48 h-48 flex items-center justify-center">
                {/* Анимация только opacity без scale */}
                <div className={`transition-opacity duration-300 ${isSwitching ? 'opacity-0' : 'opacity-100'
                  }`}>
                  <QRCodeSVG
                    value={currentQrUrl}
                    size={192}
                    level="H"
                    includeMargin
                  />
                </div>
              </div>

              <div className="mt-2 text-center">
                <p className="text-xs text-muted-foreground">
                  {language === "ru" ? "Доступен еще:" : "Available for:"}
                </p>
                <p className="text-md font-semibold text-primary">
                  {formatTime(timer)}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-white rounded-lg border-2 border-border">
              <p className="text-muted-foreground text-center text-sm">
                {language === "ru" ? "Генерация QR-кода..." : "Generating QR code..."}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 text-center">
            <p className="text-destructive text-sm mb-2">{error}</p>
            <p className="text-xs text-muted-foreground">
              {language === "ru" ? "Новый QR-код будет сгенерирован автоматически" : "New QR code will be generated automatically"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ViewCommentModal({
  isOpen,
  onClose,
  comment,
  lesson,
  language,
  onEditComment,
  onDeleteComment
}: ViewCommentModalProps) {
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
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditComment}
              className="p-1 hover:bg-muted rounded-lg"
              title={t.edit}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteComment}
              className="p-1 hover:bg-muted rounded-lg text-destructive"
              title={t.delete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg"
              title={t.back}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-foreground">{lesson.subject}</p>
          <p className="text-xs text-muted-foreground">
            {lesson.time} - {lesson.endTime} • {lesson.group}
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
          <p className="text-foreground whitespace-pre-wrap break-words">{comment}</p>
        </div>
      </div>
    </div>
  )
}

export default function Schedule({
  userName,
}: TeacherSchedulePageProps) {
  const { lang } = useLanguage();
  const t = translations[lang] || translations.en;

  // const [selectedDateKey, setSelectedDateKey] = useState<string>("")
  // const [dates, setDates] = useState<DateItem[]>([])
  // const [schedule, setSchedule] = useState<Record<string, Lesson[]>>({})
  // const [loading, setLoading] = useState<boolean>(true)
  // const [commentModal, setCommentModal] = useState<{
  //   isOpen: boolean;
  //   lesson: Lesson | null;
  //   initialComment?: string;
  //   isEditMode?: boolean;
  // }>({
  //   isOpen: false,
  //   lesson: null,
  //   initialComment: "",
  //   isEditMode: false
  // })
  // // const [qrModal, setQrModal] = useState<{ isOpen: boolean; lesson: Lesson | null }>({
  // //   isOpen: false,
  // //   lesson: null,
  // // })
  // const [viewCommentModal, setViewCommentModal] = useState<{
  //   isOpen: boolean
  //   comment: string
  //   lesson: Lesson | null
  // }>({
  //   isOpen: false,
  //   comment: "",
  //   lesson: null,
  // })
  // const [lessonComments, setLessonComments] = useState<Record<string, string>>({})
  // const scrollContainerRef = useRef<HTMLDivElement>(null)

  // const URL = "http://localhost:8081/api"
  // const COMMENT_URL = "http://localhost:8081/api/comments"


  // const getLocalDateString = (date: Date): string => {
  //   const year = date.getFullYear()
  //   const month = String(date.getMonth() + 1).padStart(2, "0")
  //   const day = String(date.getDate()).padStart(2, "0")
  //   return `${year}-${month}-${day}`
  // }

  // const currentScheduleData = useMemo(() => {
  //   return schedule[selectedDateKey] || []
  // }, [schedule, selectedDateKey])

  // // Функция для преобразования времени в формат "HH:MM"
  // const formatTime = (timeString: string): string => {
  //   const time = new Date(`2000-01-01T${timeString}`)
  //   return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  // }

  // // Функция для вычисления времени окончания пары (длительность 1 час 35 минут)
  // const calculateEndTime = (startTime: string): string => {
  //   const [hours, minutes] = startTime.split(':').map(Number)
  //   const startDate = new Date(0, 0, 0, hours, minutes)
  //   const endDate = new Date(startDate.getTime() + 95 * 60 * 1000) // 95 минут = 1 час 35 минут
  //   return endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  // }

  // // Функция для определения типа занятия по типу предмета
  // const getLessonType = (typeSubject: string): "lecture" | "practice" | "lab" | "other" => {
  //   const type = typeSubject.toLowerCase()
  //   if (type.includes('лекция') || type.includes('lecture')) {
  //     return "lecture"
  //   } else if (type.includes('практические') || type.includes('практика') || type.includes('practice')) {
  //     return "practice"
  //   } else if (type.includes('лабораторные') || type.includes('лабораторная') || type.includes('lab')) {
  //     return "lab"
  //   } else {
  //     return "other"
  //   }
  // }

  // const COMMENT_CACHE_KEY = 'teacher_comments_cache';
  // const COMMENT_CACHE_DURATION = 30 * 60 * 1000; // 30 минут

  // // Функция для получения кешированных комментариев
  // const getCachedComments = (): Record<string, string> | null => {
  //   try {
  //     const cached = localStorage.getItem(COMMENT_CACHE_KEY);
  //     if (!cached) return null;

  //     const cachedData = JSON.parse(cached);
  //     const isCacheValid = Date.now() - cachedData.timestamp < COMMENT_CACHE_DURATION;

  //     return isCacheValid ? cachedData.data : null;
  //   } catch (error) {
  //     console.error('Error reading comments cache:', error);
  //     return null;
  //   }
  // };

  // // Функция для сохранения комментариев в кеш
  // const saveCommentsToCache = (data: Record<string, string>) => {
  //   try {
  //     const cacheData = {
  //       data,
  //       timestamp: Date.now()
  //     };
  //     localStorage.setItem(COMMENT_CACHE_KEY, JSON.stringify(cacheData));
  //   } catch (error) {
  //     console.error('Error saving comments to cache:', error);
  //   }
  // };

  // // Функция для группировки занятий по времени, предмету и аудитории
  // const groupLessonsByTimeAndSubject = (lessons: ApiScheduleItem[]): Lesson[] => {
  //   const grouped: Record<string, ApiScheduleItem[]> = {}

  //   lessons.forEach(lesson => {
  //     const key = `${lesson.time}_${lesson.subject}_${lesson.audience}`
  //     if (!grouped[key]) {
  //       grouped[key] = []
  //     }
  //     grouped[key].push(lesson)
  //   })

  //   return Object.values(grouped).map(group => {
  //     const firstLesson = group[0]
  //     const groups = group.map(l => l.groupName).join('/')

  //     return {
  //       id: firstLesson.id,
  //       subject: firstLesson.subject,
  //       time: formatTime(firstLesson.time),
  //       endTime: calculateEndTime(formatTime(firstLesson.time)),
  //       room: firstLesson.audience,
  //       group: groups,
  //       type: getLessonType(firstLesson.typeSubject)
  //     }
  //   })
  // }

  // // Функция для загрузки комментариев
  // const loadComments = async () => {
  //   if (!selectedDateKey || currentScheduleData.length === 0) return;

  //   try {
  //     // Пытаемся загрузить из кэша
  //     const cachedComments = getCachedComments();
  //     if (cachedComments) {
  //       setLessonComments(cachedComments);
  //       return;
  //     }

  //     const commentsMap: Record<string, string> = {};

  //     for (const lesson of currentScheduleData) {
  //       const mainGroup = lesson.group.split('/')[0];

  //       const params = new URLSearchParams({
  //         subject: lesson.subject,
  //         groupName: mainGroup,
  //         time: lesson.time,
  //         date: selectedDateKey,
  //         teacher: teacherName
  //       });

  //       const response = await fetch(`${COMMENT_URL}?${params}`, {
  //         headers: getAuthHeaders(),
  //         credentials: 'include'
  //       });

  //       if (response.ok) {
  //         const result: CommentResponse = await response.json();

  //         if (result.success && result.comment && result.exists) {
  //           const commentKey = getCommentKey(lesson);
  //           commentsMap[commentKey] = result.comment;
  //         }
  //       }
  //     }

  //     setLessonComments(commentsMap);
  //     saveCommentsToCache(commentsMap); // Сохраняем в кэш

  //   } catch (error) {
  //     console.error('Error loading comments:', error);
  //   }
  // };

  // // Первый useEffect - инициализация дат и загрузка расписания


  // // Второй useEffect - загрузка комментариев при изменении даты или расписания
  // useEffect(() => {
  //   loadComments();
  // }, [selectedDateKey, currentScheduleData]);

  // // Третий useEffect - выбор даты после загрузки расписания
  // useEffect(() => {
  //   if (!loading && Object.keys(schedule).length > 0) {
  //     const todayKey = getLocalDateString(new Date())
  //     const newSelectedDateKey = schedule[todayKey] ? todayKey : Object.keys(schedule)[0] || ""
  //     setSelectedDateKey(newSelectedDateKey)
  //   }
  // }, [loading, schedule]);



  // const scrollLeft = () => {
  //   if (scrollContainerRef.current) {
  //     scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" })
  //   }
  // }

  // const scrollRight = () => {
  //   if (scrollContainerRef.current) {
  //     scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" })
  //   }
  // }






  // const getCommentKey = (lesson: Lesson) => {
  //   return `${lesson.subject}_${lesson.group}_${lesson.time}`
  // }

  // const truncateComment = (text: string, maxLength = 40) => {
  //   if (text.length <= maxLength) return text
  //   return text.substring(0, maxLength) + "..."
  // }

  // const openCommentModal = (lesson: Lesson, isEditMode = false) => {
  //   const commentKey = getCommentKey(lesson)
  //   const existingComment = lessonComments[commentKey] || ""

  //   setCommentModal({
  //     isOpen: true,
  //     lesson,
  //     initialComment: existingComment,
  //     isEditMode
  //   })
  // }

  // const closeCommentModal = () => {
  //   setCommentModal({ isOpen: false, lesson: null, initialComment: "" })
  // }

  // // Функция сохранения комментария
  // const handleSaveComment = async (comment: string) => {
  //   if (commentModal.lesson) {
  //     try {
  //       const mainGroup = commentModal.lesson.group.split('/')[0];

  //       const request: CommentRequest = {
  //         subject: commentModal.lesson.subject,
  //         groupName: mainGroup,
  //         time: commentModal.lesson.time,
  //         date: selectedDateKey,
  //         teacher: teacherName,
  //         comment: comment
  //       };

  //       const response = await fetch(COMMENT_URL, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           ...getAuthHeaders()
  //         },
  //         body: JSON.stringify(request),
  //         credentials: 'include'
  //       });

  //       const result: CommentResponse = await response.json();

  //       if (response.ok && result.success) {
  //         const commentKey = getCommentKey(commentModal.lesson)
  //         const newComments = {
  //           ...lessonComments,
  //           [commentKey]: comment
  //         };

  //         setLessonComments(newComments);
  //         saveCommentsToCache(newComments); // Обновляем кэш


  //       } else {
  //         throw new Error(result.error || result.message || 'Ошибка сохранения');
  //       }
  //     } catch (error) {
  //       console.error('Error saving comment:', error);

  //     }
  //   }
  // }

  // const handleDeleteComment = async () => {
  //   if (commentModal.lesson) {
  //     try {
  //       const mainGroup = commentModal.lesson.group.split('/')[0];

  //       const params = new URLSearchParams({
  //         subject: commentModal.lesson.subject,
  //         groupName: mainGroup,
  //         time: commentModal.lesson.time,
  //         date: selectedDateKey,
  //         teacher: teacherName
  //       });

  //       const response = await fetch(`${COMMENT_URL}?${params}`, {
  //         method: 'DELETE',
  //         headers: getAuthHeaders(),
  //         credentials: 'include'
  //       });

  //       const result: CommentResponse = await response.json();

  //       if (response.ok && result.success) {
  //         const commentKey = getCommentKey(commentModal.lesson)
  //         const newComments = { ...lessonComments }
  //         delete newComments[commentKey]

  //         setLessonComments(newComments);
  //         saveCommentsToCache(newComments); // Обновляем кэш


  //         closeCommentModal();
  //       } else {
  //         throw new Error(result.error || result.message || 'Ошибка удаления');
  //       }
  //     } catch (error) {
  //       console.error('Error deleting comment:', error);

  //     }
  //   }
  // }

  // // const openQRModal = (lesson: Lesson) => {
  // //   setQrModal({ isOpen: true, lesson })
  // // }

  // // const closeQRModal = () => {
  // //   setQrModal({ isOpen: false, lesson: null })
  // // }

  // const openViewCommentModal = (comment: string, lesson: Lesson) => {
  //   setViewCommentModal({ isOpen: true, comment, lesson })
  // }

  // const closeViewCommentModal = () => {
  //   setViewCommentModal({ isOpen: false, comment: "", lesson: null })
  // }

  // const handleEditCommentFromView = () => {
  //   if (viewCommentModal.lesson) {
  //     closeViewCommentModal()
  //     openCommentModal(viewCommentModal.lesson, true)
  //   }
  // }

  // const handleDeleteCommentFromView = async () => {
  //   if (viewCommentModal.lesson) {
  //     try {
  //       const mainGroup = viewCommentModal.lesson.group.split('/')[0];

  //       const params = new URLSearchParams({
  //         subject: viewCommentModal.lesson.subject,
  //         groupName: mainGroup,
  //         time: viewCommentModal.lesson.time,
  //         date: selectedDateKey,
  //         teacher: teacherName
  //       });

  //       const response = await fetch(`${COMMENT_URL}?${params}`, {
  //         method: 'DELETE',
  //         headers: getAuthHeaders(),
  //         credentials: 'include'
  //       });

  //       const result: CommentResponse = await response.json();

  //       if (response.ok && result.success) {
  //         const commentKey = getCommentKey(viewCommentModal.lesson)
  //         setLessonComments(prev => {
  //           const newComments = { ...prev }
  //           delete newComments[commentKey]
  //           return newComments
  //         });

  //         closeViewCommentModal();
  //       } else {
  //         throw new Error(result.error || result.message || 'Ошибка удаления');
  //       }
  //     } catch (error) {
  //       console.error('Error deleting comment:', error);
  //     }
  //   }
  // }

  const [currentDate, setCurrentDate] = useState<
    {
      dayOfWeek: number | undefined;
      weekType: DateItem["weekType"] | undefined;
      dateKey: string | undefined;
    }
  >({
    dayOfWeek: undefined,
    weekType: undefined,
    dateKey: undefined
  });

  const selectedDateInfo = useMemo(() => {
    if (!currentDate?.dateKey) return t.selectDate;

    const date = new Date(currentDate.dateKey);
    return date.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "short"
    })
  }, [currentDate, lang, t.selectDate]);

  const timetable = useTimetable();

  const currentSchedule = useMemo(() => {
    if (!timetable?.timetable || !currentDate?.weekType || currentDate?.dayOfWeek === undefined) {
      return undefined;
    }

    if (currentDate.dayOfWeek > 4) {
      return undefined;
    }

    const daysOrder: DayOfWeek[] = ["ПОНЕДЕЛЬНИК", "ВТОРНИК", "СРЕДА", "ЧЕТВЕРГ", "ПЯТНИЦА"];
    const currentDay: DayOfWeek = daysOrder[currentDate.dayOfWeek];
    const ruWeekType: WeekType = currentDate.weekType === "numerator" ? "Числитель" : "Знаменатель";

    const daySchedule = timetable.timetable[ruWeekType]?.[currentDay];

    return daySchedule;
  }, [timetable, currentDate]);

  return (
    <div className="bg-background text-foreground w-full flex-1">
      {/* Header */}
      <div className="flex items-center justify-between py-4 pt-12">
        <div>
          <h1 className="text-2xl font-bold">{t.schedule}</h1>
          <p className="text-muted-foreground">{userName}</p>
        </div>
      </div>

      {/* Calendar */}

      <div>
        <CalendarSlider
          language={lang}
          onChange={(dateKey, dayOfWeek, weekType) => {
            setCurrentDate({
              weekType,
              dayOfWeek,
              dateKey
            })
          }}
        />
      </div>

      {/* Schedule */}
      <div className="pt-4 pb-20">
        <div className="mb-4 flex justify-between items-center w-full max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold">{selectedDateInfo}</h2>
          {currentDate.weekType &&
            <h2 className="font-semibold">{t[currentDate.weekType]}</h2>
          }
        </div>

        <ScheduleList
          currentDate={currentDate.dateKey}
          currentSchedule={currentSchedule}
          language={lang}
        />
      </div>

      {/* Navigation */}


      {/* Modals */}
      {/* <CommentModal
        isOpen={commentModal.isOpen}
        onClose={closeCommentModal}
        lesson={commentModal.lesson}
        language={lang}
        selectedDate={selectedDateKey}
        initialComment={commentModal.initialComment}
        onSaveComment={handleSaveComment}
        onDeleteComment={handleDeleteComment}
        isEditMode={commentModal.isEditMode}
      /> */}

      {/* <QRModal
        isOpen={qrModal.isOpen}
        onClose={closeQRModal}
        lesson={qrModal.lesson}
        language={language}
        selectedDate={selectedDateKey}
        teacherName={teacherName}
        getAuthHeaders={getAuthHeaders}
      /> */}

      {/* <ViewCommentModal
        isOpen={viewCommentModal.isOpen}
        onClose={closeViewCommentModal}
        comment={viewCommentModal.comment}
        lesson={viewCommentModal.lesson}
        language={lang}
        onEditComment={handleEditCommentFromView}
        onDeleteComment={handleDeleteCommentFromView}
      /> */}
    </div>
  )
}