import { atom, useAtom } from "jotai";
import { useLayoutEffect } from "react";

const isDarkThemeAtom = atom<boolean>(false);


export function useTheme() {
    const [isDarkMode, setIsDarkMode] = useAtom(isDarkThemeAtom);

    useLayoutEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setIsDarkMode(savedTheme === "dark")
            if (savedTheme === "dark") {
                document.documentElement.classList.add("dark")
            } else {
                document.documentElement.classList.remove("dark")
            }
        }
    }, []);

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

    return {
        isDarkMode,
        toggleTheme
    }
}