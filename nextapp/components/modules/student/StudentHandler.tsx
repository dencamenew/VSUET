import Navigation from "@/components/navigation/Navigation";
import { useMe } from "@/hooks/api/useMe";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import Schedule from "../Schedule";

export function StudentHandler() {
    const { lang, setLang } = useLanguage();
    const [currentPage, setCurrentPage] = useState<"schedule" | "rating" | "attendance">("schedule");

    const user = useMe();
    if (!user) return null;

    const studentName = user.first_name + " " + user.last_name;

    return (
        <div className="h-screen w-screen bg-background flex overflow-hidden md:flex-row flex-col-reverse">
            <Navigation
                onNavigate={setCurrentPage}
                language={lang}
                setLang={setLang}
                currentPage={currentPage}
            />
            <div className="flex-1 flex flex-col px-6">
                {currentPage === "schedule" && (
                    <Schedule
                        userName={studentName}
                        // onNavigate={setCurrentPage}
                        // language={lang}
                    />
                )}
                {currentPage === "rating" && (
                    <TeacherRatingPage
                        teacherName={teacherName}
                        onNavigate={setCurrentPage}
                        onShowProfile={() => setShowProfile(true)}
                        language={lang}
                    />
                )}
                {currentPage === "attendance" && (
                    <TeacherAttendancePage
                        teacherName={teacherName}
                        groupsSubjects={groupsSubjects}
                        onNavigate={setCurrentPage}
                        onShowProfile={() => setShowProfile(true)}
                        language={lang}
                    />
                )}
            </div>
        </div>
    );
}