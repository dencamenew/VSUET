import { useMe } from "@/hooks/api/useMe"
import { useState } from "react"
import { useLanguage } from "@/hooks/useLanguage"
import Navigation from "@/components/navigation/Navigation"
import Schedule from "../Schedule"
import TeacherRating from "./TeacherRating"
import TeacherAttendance from "./TeacherAttendance"

export function TeacherHandler() {
    const { lang, setLang } = useLanguage();
    const [currentPage, setCurrentPage] = useState<"schedule" | "rating" | "attendance">("schedule");

    const user = useMe();
    if (!user) return null;

    const teacherName = user.first_name + " " + user.last_name;

    return (
        <div className="h-screen w-screen bg-background flex overflow-hidden md:flex-row flex-col-reverse">
            <Navigation
                onNavigate={setCurrentPage}
                language={lang}
                setLang={setLang}
                currentPage={currentPage}
            />
            <div className="flex-1 flex flex-col overflow-y-auto px-6">
                {currentPage === "schedule" && (
                    <Schedule
                        userName={teacherName}
                    // onNavigate={setCurrentPage}
                    />
                )}
                {currentPage === "rating" && (
                    <TeacherRating
                        teacherName={teacherName}
                        onNavigate={setCurrentPage}
                        onShowProfile={() => setShowProfile(true)}
                        language={lang}
                    />
                )}
                {currentPage === "attendance" && (
                    <TeacherAttendance />
                )}
            </div>
        </div>
    );
}
