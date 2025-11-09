import { useMe } from "@/hooks/api/useMe"
import { useState } from "react"
import { useLanguage } from "@/hooks/useLanguage"
import Navigation from "@/components/navigation/Navigation"
import Schedule from "../Schedule"
import TeacherRating from "./TeacherRating"
import TeacherAttendance from "./TeacherAttendance"
import { useNavigation } from "@/hooks/useNavigation"

export function TeacherHandler() {
    const { lang, setLang } = useLanguage();
    const { currentModule, setCurrentModule } = useNavigation();

    const user = useMe();
    if (!user) return null;

    const teacherName = user.first_name + " " + user.last_name;

    return (
        <div className="h-screen w-screen bg-background flex overflow-hidden md:flex-row flex-col-reverse">
            <Navigation
                onNavigate={setCurrentModule}
                language={lang}
                setLang={setLang}
                currentPage={currentModule}
            />
            <div className="flex-1 flex flex-col px-6 h-full overflow-hidden">
                {currentModule === "schedule" && (
                    <Schedule
                        userName={teacherName}
                    // onNavigate={setCurrentPage}
                    />
                )}
                {currentModule === "rating" && (
                    <TeacherRating
                        teacherName={teacherName}
                        onNavigate={setCurrentModule}
                        onShowProfile={() => setShowProfile(true)}
                        language={lang}
                    />
                )}
                {currentModule === "attendance" && (
                    <TeacherAttendance
                        userName={teacherName}
                    />
                )}
            </div>
        </div>
    );
}
