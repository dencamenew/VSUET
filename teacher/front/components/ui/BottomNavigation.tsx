"use client"

import { Button } from "@/components/ui/button"
import { Calendar, User, GraduationCap, Users } from "lucide-react"
import { translations, type Language } from "@/lib/translations"

interface BottomNavigationProps {
  onNavigate: (page: "schedule" | "rating" | "attendance") => void
  onShowProfile: () => void
  language: Language
  currentPage: "schedule" | "rating" | "attendance"
}

export default function BottomNavigation({
  onNavigate,
  onShowProfile,
  language,
  currentPage
}: BottomNavigationProps) {
  const t = translations[language] || translations.en

  const getButtonVariant = (page: string) => {
    return currentPage === page ? "default" : "ghost"
  }

  const getButtonClass = (page: string) => {
    return currentPage === page
      ? "flex-1 mx-1 bg-primary text-primary-foreground"
      : "flex-1 mx-1 text-muted-foreground"
  }

  return (
    <div className="z-50 fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex justify-around *:cursor-pointer">
      <Button
        variant={getButtonVariant("schedule")}
        onClick={() => onNavigate("schedule")}
        className={getButtonClass("schedule")}
      >
        <Calendar className="w-5 h-5" />
        <p className="hidden md:block ps-2">
          {t.schedule}
        </p>
      </Button>
      <Button
        variant={getButtonVariant("attendance")}
        onClick={() => onNavigate("attendance")}
        className={getButtonClass("attendance")}
      >
        <Users className="w-5 h-5" />
        <p className="hidden md:block ps-2">
          {t.attendance}
        </p>
      </Button>
      <Button
        variant={getButtonVariant("rating")}
        onClick={() => onNavigate("rating")}
        className={getButtonClass("rating")}
      >
        <GraduationCap className="w-5 h-5" />
        <p className="hidden md:block ps-2">
          {t.rating}
        </p>
      </Button>
      <Button
        variant="ghost"
        onClick={onShowProfile}
        className="flex-1 mx-1 text-muted-foreground"
      >
        <User className="w-5 h-5" />
        <p className="hidden md:block ps-2">
          {t.profile}
        </p>
      </Button>
    </div>
  )
}