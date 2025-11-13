"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { translations } from "@/lib/translations"
import { DayOfWeek, useTimetable, WeekType } from "@/hooks/api/useTimetable"
import CalendarSlider, { DateItem } from "@/components/inputs/CalendarSlider"
import { ScheduleList } from "@/components/ui/ScheduleList"
import { useLanguage } from "@/hooks/useLanguage"

interface Lesson {
  id: number
  subject: string
  time: string
  endTime: string
  room: string
  group: string
  type: "lecture" | "practice" | "lab" | "other"
}

export default function Schedule(
  {
    userPlaceholder,
  }: {
    userPlaceholder: string
  }
) {
  const { lang } = useLanguage();
  const t = translations[lang] || translations.en;

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
    <div className="bg-background text-foreground w-full flex-1 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="py-4 pt-12 px-6">
        <div>
          <h1 className="text-2xl font-bold">{t.schedule}</h1>
          <p className="text-muted-foreground md:hidden">{userPlaceholder}</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-shrink-0 px-6">
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
      <div className="flex-1 pt-4 flex flex-col min-h-0 items-center">
        <div className="flex-shrink-0 flex justify-between items-center w-full max-w-2xl px-6 pb-1">
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
    </div>
  )
}