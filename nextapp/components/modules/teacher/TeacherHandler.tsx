import { useMe } from "@/hooks/api/useMe"
import { useState } from "react"
import { useLanguage } from "@/hooks/useLanguage"
import Navigation from "@/components/navigation/Navigation"
import Schedule from "../Schedule"
import TeacherRating from "./TeacherRating"
import TeacherAttendance from "./TeacherAttendance"
import { useNavigation } from "@/hooks/useNavigation"

import { motion, AnimatePresence, Variants } from 'framer-motion';

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: -40,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

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
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                    {currentModule === "schedule" && (
                        <motion.div
                            key="schedule"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="h-full"
                        >
                            <Schedule userName={teacherName} />
                        </motion.div>
                    )}
                    {currentModule === "rating" && (
                        <motion.div
                            key="rating"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="h-full"
                        >
                            <TeacherRating userName={teacherName} />
                        </motion.div>
                    )}
                    {currentModule === "attendance" && (
                        <motion.div
                            key="attendance"
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="h-full"
                        >
                            <TeacherAttendance userName={teacherName} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
