import { useEffect, useState } from "react";

type TeacherNav = "schedule" | "rating" | "attendance";
type StudentNav = "schedule" | "rating";

export function useNavigation() {
    const [currentModule, setCurrentModule] = useState<TeacherNav | StudentNav>(
        localStorage.getItem("currentModule") as TeacherNav | StudentNav || "schedule" 
    );

    useEffect(() => {
        localStorage.setItem("currentModule", currentModule);
    }, [currentModule]);

    return {
        currentModule,
        setCurrentModule
    }
}