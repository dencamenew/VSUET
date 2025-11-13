import Navigation from "@/components/navigation/Navigation";
import { useMe } from "@/hooks/api/useMe";
import { useLanguage } from "@/hooks/useLanguage";
import Schedule from "../Schedule";
import { useNavigation } from "@/hooks/useNavigation";
import { AnimatePresence, motion } from "framer-motion";
import { StudentRating } from "./StudentRating";
import { MODULES_MOTIONS } from "@/lib/motions";
import { StudentLibrary } from "./StudentLibrary";
import { StudentAttendance } from "./StudentAttendance";

export function StudentHandler() {
    const { currentModule, setCurrentModule } = useNavigation();

    const user = useMe();
    if (!user) return null;

    const studentName = user.first_name + " " + user.last_name;

    const studentInfo = studentName;

    const modules = {
        schedule: <Schedule userPlaceholder={studentInfo} />,
        rating: <StudentRating userPlaceholder={studentInfo} />,
        attendance: <StudentAttendance userPlaceholder={studentInfo} />,
        library: <StudentLibrary userPlaceholder={studentInfo} />
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