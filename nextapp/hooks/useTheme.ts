import { useLayoutEffect, useState } from "react"

export function useTheme() {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

    useLayoutEffect(() => {
        if (theme === "dark" || theme === null) {
            document.documentElement.classList.add("dark")
            if (theme === null) {
                localStorage.setItem("theme", "dark")
            }
        } else {
            document.documentElement.classList.remove("dark");
        };
    }, [theme]);

    return {
        theme,
        setTheme
    }
};