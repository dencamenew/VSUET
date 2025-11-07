import { useMe } from "@/hooks/api/useMe"
import TeacherAttendancePage from "./TeacherAttendancePage"
import TeacherProfilePage from "./TeacherProfile"
import TeacherRatingPage from "./TeacherRatingPage"
import TeacherSchedulePage from "./TeacherSchedulePage"
import { useRole } from "@/components/security/useRole"
import { useState } from "react"
import { Drawer } from "@/components/modals/Drawer"
import BottomNavigation from "@/components/ui/BottomNavigation"
import { useLanguage } from "@/hooks/useLanguage"

const sessionId = '';

export function TeacherHandler(

) {
    
    const { lang, setLang } = useLanguage();
    const [isProfileOpen, setShowProfile] = useState(false);
    const [currentPage, setCurrentPage] = useState<"schedule" | "rating" | "attendance">("schedule");

    const user = useMe();
    if (!user) return null;

    const handleLogout = () => {}

    return (
        <div className="min-h-screen bg-background">
            {currentPage === "schedule" && (
                <TeacherSchedulePage
                    teacherName={user.first_name}
                    onNavigate={setCurrentPage}
                    onShowProfile={() => setShowProfile(true)}
                    language={lang}
                />
            )}
            {currentPage === "rating" && (
                <TeacherRatingPage
                    teacherName={teacherName}
                    onNavigate={setCurrentPage}
                    onShowProfile={() => setShowProfile(true)}
                    language={lang}
                    sessionId={sessionId}
                />
            )}
            {currentPage === "attendance" && (
                <TeacherAttendancePage
                    teacherName={teacherName}
                    groupsSubjects={groupsSubjects}
                    onNavigate={setCurrentPage}
                    onShowProfile={() => setShowProfile(true)}
                    language={lang}
                    sessionId={sessionId}
                />
            )}
            <BottomNavigation
                onNavigate={setCurrentPage}
                onShowProfile={() => setShowProfile(true)}
                language={lang}
                currentPage="schedule"
            />


            <Drawer
                isOpen={isProfileOpen}
                onClose={() => setShowProfile(false)}
            >
                <TeacherProfilePage
                    teacherName={user.first_name}
                    onLogout={handleLogout}
                    onClose={() => setShowProfile(false)}
                    onLanguageChange={setLang}
                    language={lang}
                    sessionId={sessionId}
                />
            </Drawer>
        </div>
    );
}