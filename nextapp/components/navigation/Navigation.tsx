"use client"

import { Calendar, User, GraduationCap, Users, Settings, Table } from "lucide-react"
import { translations } from "@/lib/translations"
import { TRoles, useMe } from "@/hooks/api/useMe"
import { Drawer } from "../modals/Drawer"
import { useEffect, useRef, useState, useMemo } from "react"
import { useRole } from "../security/useRole"
import { useLanguage } from "@/hooks/useLanguage"
import UserProfile from "../modules/UserProfile"
import { cn } from "@/lib/utils"
import { ResizableY } from "../motion/Resizable"
import { useDimensions } from "@/hooks/ui/useDimensions"
import { motion, useMotionValue, animate } from "framer-motion"
import { Nav } from "@/hooks/useNavigation"
import { AppSettings } from "./AppSettings"

interface BottomNavigationProps {
  onNavigate: (page: Nav) => void
  currentModule: Nav;
}

const NAV_CONFIG: Record<Exclude<TRoles, undefined>, readonly { module: string; icon: typeof Calendar; titleKey: string }[]> = {
  student: [
    { module: "schedule", icon: Calendar, titleKey: "schedule" },
    { module: "rating", icon: GraduationCap, titleKey: "rating" },
  ],
  teacher: [
    { module: "schedule", icon: Calendar, titleKey: "schedule" },
    { module: "attendance", icon: Users, titleKey: "attendance" },
    { module: "rating", icon: GraduationCap, titleKey: "rating" },
    { module: "statements", icon: Table, titleKey: "statements" },
  ],
  admin: [],
} as const;

function SettingsHandler() {
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
        <div ref={resizeRef} className="p-4">
          <AppSettings />
        </div>
      </ResizableY>
    </div>
  )
}

export default function Navigation({
  onNavigate,
  currentModule,
}: BottomNavigationProps) {
  const { lang } = useLanguage();
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

  const navButtons = useMemo(() => {
    return role && NAV_CONFIG[role] ? NAV_CONFIG[role] : [];
  }, [role]);

  const pages = useMemo(() => {
    return navButtons.map(btn => btn.module);
  }, [navButtons]);

  const activeIndex = pages.indexOf(currentModule);

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
  }, [role]);

  useEffect(() => {
    if (!mobileContainerRef.current) return;

    const measureButtons = () => {
      const buttons = mobileContainerRef.current!.querySelectorAll<HTMLButtonElement>("[data-mobile-nav-button]:not([data-profile-button])");
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
  }, [role]);

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

          {navButtons.map((btn, index) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.module}
                data-nav-button
                onClick={() => onNavigate(btn.module as Nav)}
                className={cn(
                  "cursor-pointer relative z-10 w-full flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                  currentModule === btn.module ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{t.navigation[btn.titleKey as keyof typeof t.navigation]}</span>
              </button>
            );
          })}
        </div>
        <SettingsHandler />
      </div>

      {/* Мобилка */}
      <div className="md:hidden flex bg-background border-t border-border p-4 gap-2 w-full relative" ref={mobileContainerRef}>
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 bg-foreground rounded-md pointer-events-none z-0"
          style={{
            left: mobileIndicatorX,
            width: mobileIndicatorW,
            height: 40,
          }}
        />

        {navButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.module}
              data-mobile-nav-button
              onClick={() => onNavigate(btn.module as Nav)}
              className={cn(
                "relative z-10 flex-1 h-10 flex items-center justify-center rounded-md transition-colors",
                currentModule === btn.module ? "text-primary-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}

        <button
          data-profile-button
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
          onClose={() => setShowProfile(false)}
        />
      </Drawer>
    </>
  )
}
