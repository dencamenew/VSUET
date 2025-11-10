import { useTheme } from "@/hooks/ui/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { atom, useAtom } from "jotai";
import { Globe, Moon, Sun } from "lucide-react";
import { useEffect } from "react";


export function useAppSettings() {
    const { lang, setLang } = useLanguage();
    const { isDarkMode, toggleTheme } = useTheme();

    const toggleLanguage = () => {
        const newLanguage = lang === "ru" ? "en" : "ru"
        localStorage.setItem("language", newLanguage)
        setLang(newLanguage);
    }

    return {
        isDarkMode,
        toggleTheme,
        toggleLanguage
    }
}

export function AppSettings() {
    const { lang } = useLanguage();
    const t = translations[lang];
    const { isDarkMode, toggleTheme, toggleLanguage } = useAppSettings();

    return (
        <div className="flex flex-col gap-4">
            {/* Theme Switch */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {isDarkMode ? (
                        <Moon className="w-5 h-5 text-muted-foreground" />
                    ) : (
                        <Sun className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className="text-muted-foreground">
                        {isDarkMode ? t.darkTheme : t.lightTheme}
                    </span>
                </div>
                <button
                    onClick={toggleTheme}
                    className={cn(
                        "cursor-pointer relative inline-flex h-8 w-16 items-center rounded-full transition-colors",
                        isDarkMode ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                >
                    <span
                        className={cn(
                            "inline-block h-6 w-6 transform rounded-full bg-muted transition-transform shadow-md",
                            isDarkMode ? "translate-x-9" : "translate-x-1"
                        )}
                    />
                    <Sun
                        className={cn(
                            "absolute left-1.5 w-4 h-4 transition-opacity pointer-events-none ml-0.5",
                            !isDarkMode ? "text-yellow-500 opacity-100" : "text-muted"
                        )}
                    />
                    <Moon
                        className={cn(
                            "absolute right-1.5 w-4 h-4 transition-opacity pointer-events-none  mr-0.5",
                            isDarkMode ? "text-foreground opacity-100" : "text-muted-foreground/50 opacity-50"
                        )}
                    />
                </button>
            </div>

            {/* Lang Switch */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{t.language}</span>
                </div>
                <button
                    onClick={toggleLanguage}
                    className={cn(
                        "cursor-pointer relative inline-flex h-8 w-16 items-center rounded-full transition-colors",
                        lang === "en" ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                >
                    {/* Slider */}
                    <span
                        className={cn(
                            "inline-block h-6 w-6 transform rounded-full bg-muted  transition-transform shadow-md",
                            lang === "en" ? "translate-x-9" : "translate-x-1"
                        )}
                    />
                    {/* Labels */}
                    <span
                        className={cn(
                            "absolute left-2 text-[0.65rem] font-bold transition-colors pointer-events-none select-none text-foreground",
                            lang === "ru" ? "text-foreground" : "text-muted"
                        )}
                    >
                        RU
                    </span>
                    <span
                        className={cn(
                            "absolute right-2 text-[0.65rem] font-bold transition-colors pointer-events-none select-none text-foreground",
                        )}
                    >
                        EN
                    </span>
                </button>
            </div>
        </div>
    )
}
