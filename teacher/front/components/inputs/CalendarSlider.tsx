// CalendarSlider.tsx
"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SideFade } from "../ui/particles/SideFade"

export interface DateItem {
  date: number
  day: string
  month: string
  isToday: boolean
  fullDate: Date
  key: string
  dayOfWeek: number
  weekType: "numerator" | "denominator"
}

interface CalendarSliderProps {
  language: "ru" | "en"
  onChange: (
    dateKey: string, 
    dayOfWeek: number, 
    weekType: "numerator" | "denominator"
  ) => void
}

const ITEM_WIDTH = 70
const GAP = 8
const SWIPE_THRESHOLD = 50

export default function CalendarSlider({
  language,
  onChange
}: CalendarSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [selectedDateKey, setSelectedDateKey] = useState<string>("")
  const [touchStart, setTouchStart] = useState<number>(0)
  const [touchEnd, setTouchEnd] = useState<number>(0)
  const [scrollOffset, setScrollOffset] = useState(0)
  const initialScrollDone = useRef(false)

  // Функция для определения числитель/знаменатель
  const getWeekType = (date: Date): "numerator" | "denominator" => {
    const year = date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1
    const sept1st = new Date(year, 8, 1)

    // Находим понедельник недели, в которую попадает 1 сентября
    const sept1DayOfWeek = sept1st.getDay()
    const daysToMonday = sept1DayOfWeek === 0 ? -6 : 1 - sept1DayOfWeek
    const firstMonday = new Date(sept1st)
    firstMonday.setDate(sept1st.getDate() + daysToMonday)

    // Находим понедельник недели текущей даты
    const currentDayOfWeek = date.getDay()
    const daysToCurrentMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek
    const currentMonday = new Date(date)
    currentMonday.setDate(date.getDate() + daysToCurrentMonday)

    // Вычисляем количество недель
    const diffTime = currentMonday.getTime() - firstMonday.getTime()
    const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000))

    return diffWeeks % 2 === 0 ? "numerator" : "denominator"
  }

  // Генерация всех дат
  const allDates = useMemo(() => {
    const daysOfWeek =
      language === "ru"
        ? ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const months =
      language === "ru"
        ? ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const generatedDates: DateItem[] = []
    const today = new Date()

    // Генерируем даты: 365 дней назад до 365 дней вперед
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 365)

    const endDate = new Date(today)
    endDate.setDate(today.getDate() + 365)

    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateKey = getLocalDateString(currentDate)
      const isToday = getLocalDateString(currentDate) === getLocalDateString(today)
      const dayIndex = currentDate.getDay()
      const dayOfWeek = dayIndex === 0 ? 6 : dayIndex - 1
      const weekType = getWeekType(currentDate)

      generatedDates.push({
        date: currentDate.getDate(),
        day: daysOfWeek[dayIndex],
        month: months[currentDate.getMonth()],
        isToday,
        fullDate: new Date(currentDate),
        key: dateKey,
        dayOfWeek,
        weekType
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return generatedDates
  }, [language])

  // Виртуализация: вычисляем какие элементы рендерить
  const visibleDates = useMemo(() => {
    const itemTotalWidth = ITEM_WIDTH + GAP
    const containerWidth = scrollContainerRef.current?.clientWidth || 400

    // Вычисляем индексы видимых элементов с буфером
    const startIndex = Math.max(0, Math.floor(scrollOffset / itemTotalWidth) - 5)
    const visibleCount = Math.ceil(containerWidth / itemTotalWidth) + 15
    const endIndex = Math.min(allDates.length, startIndex + visibleCount)

    return allDates.slice(startIndex, endIndex).map((date, idx) => ({
      ...date,
      absoluteIndex: startIndex + idx
    }))
  }, [allDates, scrollOffset])

  // Инициализация: центрируем на сегодняшней дате
  useEffect(() => {
    if (initialScrollDone.current || allDates.length === 0) return

    const todayKey = getLocalDateString(new Date())
    const todayIndex = allDates.findIndex(d => d.key === todayKey)

    if (todayIndex !== -1 && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const containerWidth = container.clientWidth
      const itemTotalWidth = ITEM_WIDTH + GAP

      // Центрируем сегодняшнюю дату
      const targetScroll = (todayIndex * itemTotalWidth) - (containerWidth / 2) + (ITEM_WIDTH / 2)

      // Устанавливаем без анимации
      container.scrollLeft = Math.max(0, targetScroll)
      setScrollOffset(container.scrollLeft)

      setSelectedDateKey(allDates[todayIndex].key)
      onChange(allDates[todayIndex].key, allDates[todayIndex].dayOfWeek, allDates[todayIndex].weekType)
      initialScrollDone.current = true
    }
  }, [allDates, onChange])

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollOffset(scrollContainerRef.current.scrollLeft)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > SWIPE_THRESHOLD) {
      scrollRight()
    }
    if (touchStart - touchEnd < -SWIPE_THRESHOLD) {
      scrollLeft()
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -(ITEM_WIDTH + GAP) * 2,
        behavior: "smooth"
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: (ITEM_WIDTH + GAP) * 2,
        behavior: "smooth"
      })
    }
  }

  const handleDateSelect = (dateItem: DateItem) => {
    setSelectedDateKey(dateItem.key)
    onChange(dateItem.key, dateItem.dayOfWeek, dateItem.weekType)

    // Плавно центрируем выбранную дату
    if (scrollContainerRef.current) {
      const dateIndex = allDates.findIndex(d => d.key === dateItem.key)
      if (dateIndex !== -1) {
        const container = scrollContainerRef.current
        const containerWidth = container.clientWidth
        const itemTotalWidth = ITEM_WIDTH + GAP
        const targetScroll = (dateIndex * itemTotalWidth) - (containerWidth / 2) + (ITEM_WIDTH / 2)

        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: "smooth"
        })
      }
    }
  }

  const itemTotalWidth = ITEM_WIDTH + GAP
  const totalWidth = allDates.length * itemTotalWidth

  return (
    <div className="relative w-full">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={scrollLeft}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      
      <div className="relative mx-10">
          <SideFade
            width={120}
            height="100%"
            className="bg-gradient-to-r from-background to-transparent left-0 top-0 z-50"
          />
          <SideFade
            width={120}
            height="100%"
            className="bg-gradient-to-l from-background to-transparent right-0 top-0 z-50"
          />

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="overflow-x-auto pb-2 scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div
            className="relative flex gap-2"
            style={{ 
              width: `${totalWidth}px`,
              height: '92px'
            }}
          >
            {visibleDates.map((dateItem) => (
              <button
                key={dateItem.key}
                onClick={() => handleDateSelect(dateItem)}
                style={{
                  position: 'absolute',
                  left: `${dateItem.absoluteIndex * itemTotalWidth}px`,
                  width: `${ITEM_WIDTH}px`,
                  flexShrink: 0
                }}
                className={cn(
                  "flex flex-col items-center p-3 rounded-2xl transition-all cursor-pointer relative hover:bg-muted",
                  dateItem.isToday
                    ? selectedDateKey === dateItem.key 
                      ? "border border-primary bg-muted" 
                      : "bg-primary text-primary-foreground hover:text-primary"
                    : selectedDateKey === dateItem.key && "bg-muted"
                )}
              >
                <span className="text-xs mb-1">{dateItem.month}</span>
                <span className="text-lg font-semibold">{dateItem.date}</span>
                <span className="text-xs mt-1">{dateItem.day}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={scrollRight}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

function getLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
