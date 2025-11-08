"use client"

import { Button } from "@/components/ui/button"
import { Calendar, User, GraduationCap, Users, Settings2, Settings, Moon, Sun, Globe } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { useMe } from "@/hooks/api/useMe"
import { Drawer } from "../modals/Drawer"
import TeacherProfile from "../modules/UserProfile"
import { useEffect, useRef, useState } from "react"
import { useRole } from "../security/useRole"
import { useLanguage } from "@/hooks/useLanguage"
import UserProfile from "../modules/UserProfile"
import { cn } from "@/lib/utils"
import { ResizableY } from "../motion/Resizable"
import { useDimensions } from "@/hooks/ui/useDimensions"

interface BottomNavigationProps {
  onNavigate: (page: "schedule" | "rating" | "attendance") => void
  language: Language
  currentPage: "schedule" | "rating" | "attendance";
  setLang: (lang: Language) => void
};

function SettingsHandler(
  {
    isDarkMode,
    toggleTheme,
    toggleLanguage
  }: {
    isDarkMode: boolean,
    toggleTheme: () => void,
    toggleLanguage: () => void
  }
) {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const t = translations[lang] || translations.en;
  const resizeRef = useRef<HTMLDivElement>(null);
  const { height } = useDimensions(resizeRef, [isOpen]);

  return (
    <div className="bg-muted rounded-md overflow-hidden">
      <div className={cn("transition-all duration-400", isOpen && "p-2")}>
        <div
          onClick={() => setIsOpen(prev => !prev)}
          className={cn(
            "h-9 w-full box-border cursor-pointer flex justify-center items-center gap-2 bg-foreground text-primary-foreground rounded-md py-2 text-sm  hover:bg-primary/90 transition-all",
            isOpen && "bg-primary/80 hover:bg-primary/70"

          )}
        >
          <Settings className="size-5" />
          Настройки
        </div>
      </div>
      <ResizableY
        open={isOpen}
        initial={{ width: '100%', height: 0 }}
        width={"100%"}
        height={height}
      >
        <div ref={resizeRef} className="bg-muted p-4">
          <div className="space-y-4">
            {/* Theme Settings */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
                <span className="text-muted-foreground">{isDarkMode ? t.darkTheme : t.lightTheme}</span>
              </div>
              <div className="relative">
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-8 w-18 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-soft ${isDarkMode ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${isDarkMode ? "translate-x-10" : "translate-x-1"
                      }`}
                  />
                  <Sun
                    className={`absolute left-2 w-4 transition-colors ${!isDarkMode ? "text-yellow-500" : "text-muted-foreground/70"
                      }`}
                  />
                  <Moon
                    className={`absolute right-2 w-4 h-4 transition-colors ${isDarkMode ? "text-white" : "text-muted-foreground/70"
                      }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">{t.language}</span>
              </div>
              <div className="relative">
                <button
                  onClick={toggleLanguage}
                  className={`relative inline-flex h-8 w-18 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-soft ${lang === "en" ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${lang === "en" ? "translate-x-10" : "translate-x-1"
                      }`}
                  />
                  <span
                    className={`absolute left-2 text-xs font-semibold transition-colors ${lang === "ru" ? "text-white" : "text-muted-foreground/70"
                      }`}
                  >
                    RU
                  </span>
                  <span
                    className={`absolute right-2 text-xs font-semibold transition-colors ${lang === "en" ? "text-white" : "text-muted-foreground/70"
                      }`}
                  >
                    EN
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </ResizableY>
    </div>
  )
}

export default function Navigation({
  onNavigate,
  currentPage,
}: BottomNavigationProps) {

  const [isDarkMode, setIsDarkMode] = useState(true);
  const { lang, setLang } = useLanguage();

  const user = useMe();
  const { role } = useRole();

  const t = translations[lang] || translations.en;
  const [isProfileOpen, setShowProfile] = useState(false);

  const getButtonVariant = (page: string) => {
    return currentPage === page ? "default" : "ghost"
  }

  const getButtonClass = (page: string) => {
    return currentPage === page
      ? "w-full bg-primary text-primary-foreground justify-start"
      : "w-full text-muted-foreground justify-start"
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark")
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")

    if (newTheme) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const toggleLanguage = () => {
    const newLanguage = lang === "ru" ? "en" : "ru"
    localStorage.setItem("language", newLanguage)
    setLang(newLanguage);
  }


  if (!user) return null;
  const userName = user.first_name + " " + user.last_name;

  const handleLogout = () => { }


  return (
    <>
      <div className="hidden md:flex md:flex-col w-74 bg-background border-r border-border p-4 gap-2 h-screen justify-between pt-14 pb-4">
        <div className="flex flex-col gap-2">
          <div className="pb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center shadow-soft bg-muted">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{userName}</h2>
                {role && <p className="text-muted-foreground text-sm">{t[role]}</p>}
              </div>
            </div>
          </div>
          <Button
            onClick={() => onNavigate("schedule")}
            className={getButtonClass("schedule")}
          >
            <Calendar className="w-5 h-5" />
            <span className="ps-2">
              {t.schedule}
            </span>
          </Button>
          <Button
            variant={getButtonVariant("attendance")}
            onClick={() => onNavigate("attendance")}
            className={getButtonClass("attendance")}
          >
            <Users className="w-5 h-5" />
            <span className="ps-2">
              {t.attendance}
            </span>
          </Button>
          <Button
            variant={getButtonVariant("rating")}
            onClick={() => onNavigate("rating")}
            className={getButtonClass("rating")}
          >
            <GraduationCap className="w-5 h-5" />
            <span className="ps-2">
              {t.rating}
            </span>
          </Button>
          {/* <Button
            variant="ghost"
            onClick={() => setShowProfile(true)}
            className="w-full text-muted-foreground justify-start"
          >
            <User className="w-5 h-5" />
            <span className="ps-2">
              {t.profile}
            </span>
          </Button> */}
        </div>
        <SettingsHandler
          toggleTheme={toggleTheme}
          toggleLanguage={toggleLanguage}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Для мобилки */}
      <div className="md:hidden flex bg-background border-t border-border p-4 gap-2 w-full">
        <Button
          size="icon"
          onClick={() => onNavigate("schedule")}
          variant={getButtonVariant("schedule")}
          className="flex-1"
        >
          <Calendar className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant={getButtonVariant("attendance")}
          onClick={() => onNavigate("attendance")}
          className="flex-1"
        >
          <Users className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant={getButtonVariant("rating")}
          onClick={() => onNavigate("rating")}
          className="flex-1"
        >
          <GraduationCap className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowProfile(true)}
          className="flex-1"
        >
          <User className="w-5 h-5" />
        </Button>
      </div>
      <Drawer
        isOpen={isProfileOpen}
        onClose={() => setShowProfile(false)}
      >
        <UserProfile
          userName={userName}
          onLogout={handleLogout}
          onClose={() => setShowProfile(false)}
          onLanguageChange={setLang}
          language={lang}
          toggleTheme={toggleTheme}
          toggleLanguage={toggleLanguage}
          isDarkMode={isDarkMode}
        />
      </Drawer>
    </>
  )
}
