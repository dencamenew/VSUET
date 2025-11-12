import { useMe } from "@/hooks/api/useMe"
import { useLanguage } from "@/hooks/useLanguage"
import Navigation from "@/components/navigation/Navigation"
import Schedule from "../Schedule"
import TeacherRating from "./TeacherRating"
import TeacherAttendance from "./TeacherAttendance"
import { useNavigation } from "@/hooks/useNavigation"
import { motion, AnimatePresence } from 'framer-motion';
import { MODULES_MOTIONS } from "@/lib/motions"
import { TeacherStatements } from "./TeacherStatements"


export function TeacherHandler() {
    const { currentModule, setCurrentModule } = useNavigation();

    const user = useMe();
    if (!user) return null;

    const teacherName = user.first_name + " " + user.last_name;

    const modules = {
        schedule: <Schedule userPlaceholder={teacherName} />,
        rating: <TeacherRating userPlaceholder={teacherName} />,
        attendance: <TeacherAttendance userPlaceholder={teacherName} />,
        statements: <TeacherStatements userPlaceholder={teacherName} />
    };

    return (
        <div className="h-screen w-screen bg-background flex overflow-hidden md:flex-row flex-col-reverse">
            <Navigation
                onNavigate={setCurrentModule}
                currentModule={currentModule}
            />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={currentModule}
                        variants={MODULES_MOTIONS}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="h-full"
                    >
                        {modules[currentModule as keyof typeof modules]}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
