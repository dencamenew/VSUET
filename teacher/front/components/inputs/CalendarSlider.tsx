// CalendarSlider.tsx
"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DateItem {
  date: number
  day: string
  month: string
  isToday: boolean
  fullDate: Date
  key: string
  dayOfWeek: number // 0-6, где 0 = понедельник, 6 = воскресенье
}

interface CalendarSliderProps {
  language: "ru" | "en"
  onChangeDate: (dateKey: string, dayOfWeek: number) => void
  startDate?: Date
  endDate?: Date
  initialDate?: string
}

const VISIBLE_ITEMS = 7
const ITEM_WIDTH = 70
const SWIPE_THRESHOLD = 50

export default function CalendarSlider({
  language,
  onChangeDate,
  startDate = new Date(2025, 8, 1),
  endDate = new Date(2025, 11, 31),
  initialDate
}: CalendarSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [selectedDateKey, setSelectedDateKey] = useState<string>("")
  const [touchStart, setTouchStart] = useState<number>(0)
  const [touchEnd, setTouchEnd] = useState<number>(0)

  const dates = useMemo(() => {
    const daysOfWeek =
      language === "ru" 
        ? ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] 
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const months =
      language === "ru"
        ? ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const generatedDates: DateItem[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateKey = getLocalDateString(currentDate)
      const today = new Date()
      const isToday = getLocalDateString(currentDate) === getLocalDateString(today)
      const dayIndex = currentDate.getDay()
      
      // Конвертируем день недели: 0 (Вс) -> 6, 1 (Пн) -> 0, 2-6 -> 1-5
      const dayOfWeek = dayIndex === 0 ? 6 : dayIndex - 1

      generatedDates.push({
        date: currentDate.getDate(),
        day: daysOfWeek[dayIndex],
        month: months[currentDate.getMonth()],
        isToday,
        fullDate: new Date(currentDate),
        key: dateKey,
        dayOfWeek
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return generatedDates
  }, [language, startDate, endDate])

  const [scrollOffset, setScrollOffset] = useState(0)

  const visibleDates = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollOffset / ITEM_WIDTH) - 2)
    const endIndex = Math.min(dates.length, startIndex + VISIBLE_ITEMS + 4)
    return dates.slice(startIndex, endIndex).map((date, idx) => ({
      ...date,
      virtualIndex: startIndex + idx
    }))
  }, [dates, scrollOffset])

  useEffect(() => {
    const targetDate = initialDate || getLocalDateString(new Date())
    const targetIndex = dates.findIndex(d => d.key === targetDate)
    
    if (targetIndex !== -1) {
      setSelectedDateKey(dates[targetIndex].key)
      const targetOffset = targetIndex * ITEM_WIDTH - (VISIBLE_ITEMS / 2) * ITEM_WIDTH
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = targetOffset
      }
      onChangeDate(dates[targetIndex].key, dates[targetIndex].dayOfWeek)
    } else if (dates.length > 0) {
      setSelectedDateKey(dates[0].key)
      onChangeDate(dates[0].key, dates[0].dayOfWeek)
    }
  }, [dates])

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
      scrollContainerRef.current.scrollBy({ left: -ITEM_WIDTH * 3, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: ITEM_WIDTH * 3, behavior: "smooth" })
    }
  }

  const handleDateSelect = (dateItem: DateItem) => {
    setSelectedDateKey(dateItem.key)
    onChangeDate(dateItem.key, dateItem.dayOfWeek)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={scrollLeft}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex gap-2 overflow-x-auto pb-2 mx-10 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {visibleDates.map((dateItem) => (
          <button
            key={dateItem.key}
            onClick={() => handleDateSelect(dateItem)}
            style={{
              minWidth: `${ITEM_WIDTH - 10}px`,
              transform: `translateX(${dateItem.virtualIndex * ITEM_WIDTH}px)`
            }}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
              dateItem.isToday
                ? "bg-primary text-primary-foreground"
                : selectedDateKey === dateItem.key
                ? "bg-muted"
                : "hover:bg-muted"
            }`}
          >
            <span className="text-xs text-muted-foreground mb-1">{dateItem.month}</span>
            <span className="text-lg font-semibold">{dateItem.date}</span>
            <span className="text-xs mt-1">{dateItem.day}</span>
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
  )
}

function getLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
