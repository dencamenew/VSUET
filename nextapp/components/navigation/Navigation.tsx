"use client"

import { Button } from "@/components/ui/button"
import { Calendar, User, GraduationCap, Users, Settings, Moon, Sun, Globe } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { useMe } from "@/hooks/api/useMe"
import { Drawer } from "../modals/Drawer"
import { useEffect, useRef, useState } from "react"
import { useRole } from "../security/useRole"
import { useLanguage } from "@/hooks/useLanguage"
import UserProfile from "../modules/UserProfile"
import { cn } from "@/lib/utils"
import { ResizableY } from "../motion/Resizable"
import { useDimensions } from "@/hooks/ui/useDimensions"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"

interface BottomNavigationProps {
  onNavigate: (page: "schedule" | "rating" | "attendance") => void
  language: Language
  currentPage: "schedule" | "rating" | "attendance";
  setLang: (lang: Language) => void
}

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
  const { lang } = useLanguage();
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
          <Settings className={cn("size-5 duration-500 transition-transform", isOpen && "rotate-180")} />
          {t.settings}
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonRects, setButtonRects] = useState<{ top: number; height: number }[]>([]);
  const indicatorY = useMotionValue(0);
  const indicatorH = useMotionValue(0);
  const hasMounted = useRef(false);

  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const [mobileButtonRects, setMobileButtonRects] = useState<{ left: number; width: number }[]>([]);
  const mobileIndicatorX = useMotionValue(0);
  const mobileIndicatorW = useMotionValue(0);
  const mobileHasMounted = useRef(false);

  const pages = ["schedule", "attendance", "rating"] as const;
  const activeIndex = pages.indexOf(currentPage);

  useEffect(() => {
    if (!containerRef.current) return;

    const measureButtons = () => {
      const buttons = containerRef.current!.querySelectorAll<HTMLButtonElement>("[data-nav-button]");
      const rects = Array.from(buttons).map(b => {
        const { top, height } = b.getBoundingClientRect();
        const containerTop = containerRef.current!.getBoundingClientRect().top;
        return { top: top - containerTop, height };
      });
      setButtonRects(rects);
    };

    setTimeout(measureButtons, 0);
    window.addEventListener('resize', measureButtons);
    return () => window.removeEventListener('resize', measureButtons);
  }, []);

  useEffect(() => {
    if (!mobileContainerRef.current) return;

    const measureButtons = () => {
      const buttons = mobileContainerRef.current!.querySelectorAll<HTMLButtonElement>("[data-mobile-nav-button]");
      if (buttons.length === 0) return;

      const rects = Array.from(buttons).map(b => {
        const { left, width } = b.getBoundingClientRect();
        const containerLeft = mobileContainerRef.current!.getBoundingClientRect().left;
        return { left: left - containerLeft, width };
      });

      setMobileButtonRects(rects);
    };

    const timer = setTimeout(measureButtons, 100);
    window.addEventListener('resize', measureButtons);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureButtons);
    };
  }, []);

  useEffect(() => {
    if (!buttonRects[activeIndex]) return;

    if (!hasMounted.current) {
      indicatorY.set(buttonRects[activeIndex].top);
      indicatorH.set(buttonRects[activeIndex].height);
      hasMounted.current = true;
    } else {
      animate(indicatorY, buttonRects[activeIndex].top, {
        type: "spring",
        stiffness: 280,
        damping: 35,
      });
      animate(indicatorH, buttonRects[activeIndex].height, {
        type: "spring",
        stiffness: 280,
        damping: 35,
      });
    }
  }, [activeIndex, buttonRects, indicatorY, indicatorH]);

  useEffect(() => {
    if (!mobileButtonRects[activeIndex]) return;

    if (!mobileHasMounted.current) {
      mobileIndicatorX.set(mobileButtonRects[activeIndex].left);
      mobileIndicatorW.set(mobileButtonRects[activeIndex].width);
      mobileHasMounted.current = true;
    } else {
      animate(mobileIndicatorX, mobileButtonRects[activeIndex].left, {
        type: "spring",
        stiffness: 280,
        damping: 35,
      });
      animate(mobileIndicatorW, mobileButtonRects[activeIndex].width, {
        type: "spring",
        stiffness: 280,
        damping: 35,
      });
    }
  }, [activeIndex, mobileButtonRects, mobileIndicatorX, mobileIndicatorW]);

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
      {/* Десктоп */}
      <div className="hidden md:flex md:flex-col w-74 bg-background border-r border-border p-4 gap-2 h-screen justify-between pt-14 pb-4">
        <div className="flex flex-col gap-2 relative" ref={containerRef}>
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

          <motion.div
            className="absolute left-0 w-full bg-primary rounded-md pointer-events-none z-0"
            style={{
              y: indicatorY,
              height: indicatorH,
            }}
          />

          <button
            data-nav-button
            onClick={() => onNavigate("schedule")}
            className={cn(
              "cursor-pointer relative z-10 w-full flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
              currentPage === "schedule" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Calendar className="w-5 h-5" />
            <span>{t.schedule}</span>
          </button>

          <button
            data-nav-button
            onClick={() => onNavigate("attendance")}
            className={cn(
              "cursor-pointer relative z-10 w-full flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
              currentPage === "attendance" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-5 h-5" />
            <span>{t.attendance}</span>
          </button>

          <button
            data-nav-button
            onClick={() => onNavigate("rating")}
            className={cn(
              "cursor-pointer relative z-10 w-full flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
              currentPage === "rating" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GraduationCap className="w-5 h-5" />
            <span>{t.rating}</span>
          </button>
        </div>
        <SettingsHandler
          toggleTheme={toggleTheme}
          toggleLanguage={toggleLanguage}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Мобилка с анимацией */}
      <div className="md:hidden flex bg-background border-t border-border p-4 gap-2 w-full relative" ref={mobileContainerRef}>
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 bg-foreground rounded-md pointer-events-none z-0"
          style={{
            left: mobileIndicatorX,
            width: mobileIndicatorW,
            height: 40,
          }}
        />

        <button
          data-mobile-nav-button
          onClick={() => onNavigate("schedule")}
          className={cn(
            "relative z-10 flex-1 h-10 flex items-center justify-center rounded-md transition-colors",
            currentPage === "schedule" ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          <Calendar className="w-5 h-5" />
        </button>

        <button
          data-mobile-nav-button
          onClick={() => onNavigate("attendance")}
          className={cn(
            "relative z-10 flex-1 h-10 flex items-center justify-center rounded-md transition-colors",
            currentPage === "attendance" ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          <Users className="w-5 h-5" />
        </button>

        <button
          data-mobile-nav-button
          onClick={() => onNavigate("rating")}
          className={cn(
            "relative z-10 flex-1 h-10 flex items-center justify-center rounded-md transition-colors",
            currentPage === "rating" ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          <GraduationCap className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowProfile(true)}
          className="relative z-10 flex-1 h-10 flex items-center justify-center rounded-md text-muted-foreground"
        >
          <User className="w-5 h-5" />
        </button>
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

