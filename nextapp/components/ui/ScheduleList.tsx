'use client'

import { motion, AnimatePresence, Variants } from 'framer-motion'
import { ILessonSlot, LessonTime } from "@/hooks/api/useTimetable"
import { Language, translations } from "@/lib/translations"
import { nanoid } from 'nanoid'
import { SideFade } from './particles/SideFade'

export function ScheduleList(
    {
        currentDate,
        currentSchedule,
        language
    }: {
        currentDate: string | undefined,
        currentSchedule: Record<LessonTime, ILessonSlot> | undefined,
        language: Language
    }
) {
    const t = translations[language] || translations.en

    const getCardStyles = (type: ILessonSlot['class_type']) => {
        switch (type) {
            case "лекция":
                return "bg-card border border-border border-l-4 border-l-blue-500 shadow-sm hover:shadow-md"
            case "практические занятия":
                return "bg-card border border-border border-l-4 border-l-red-500 shadow-sm hover:shadow-md"
            case "лабораторная работа":
                return "bg-card border border-border border-l-4 border-l-green-500 shadow-sm hover:shadow-md"
            case "семинар":
                return "bg-card border border-border border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md"
            default:
                return "bg-card border border-border border-l-4 border-l-purple-500 shadow-sm hover:shadow-md"
        }
    }

    const getTypeStyles = (type: ILessonSlot['class_type']) => {
        switch (type) {
            case "лекция":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            case "практические занятия":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"
            case "лабораторная работа":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800"
            case "семинар":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"
            default:
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
        }
    }

    const getTypeLabel = (type: ILessonSlot['class_type']) => {
        switch (type) {
            case "лекция":
                return t.lecture
            case "практические занятия":
                return t.practice
            case "лабораторная работа":
                return t.lab
            case "семинар":
                return t.seminar
            default:
                return t.other
        }
    }

    const cardVariants: Variants = {
        hidden: {
            opacity: 0,
            scale: 0.85,
            filter: "blur(4px)",
        },
        visible: () => ({
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            zIndex: 50,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 28,
                mass: 0.4,

                opacity: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    mass: 0.6,
                },

                scale: {
                    type: "spring",
                    stiffness: 160,
                    damping: 26,
                    mass: 1.1,
                },

                filter: {
                    type: "spring",
                    stiffness: 180,
                    damping: 18,
                    mass: 0.8,
                }
            }
        }),
        exit: () => ({
            opacity: 0,
            scale: 0.7,
            filter: "blur(8px)",
            zIndex: 40,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 28,
                mass: 0.4,
            }
        })
    }

    const entries = currentSchedule ? Object.entries(currentSchedule).filter(([_, item]) => item && Object.values(item).length) : []

    return (
        <div className='size-full relative overflow-hidden'>
            <div className='absolute px-4 z-60 w-full'>
                <SideFade
                    width="100%"
                    height={24}
                    className="bg-gradient-to-b from-background to-transparent left-0 top-0 relative z-60"
                />
            </div>
            <div className="flex flex-col gap-3 items-center h-full w-full overflow-y-auto px-6 py-6 z-30">
                <AnimatePresence mode="popLayout">
                    {entries.length > 0 ? (
                        entries.map(([time, item], index) => (
                            <motion.div
                                key={`${index}-${currentDate}`}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={getCardStyles(item.class_type) + " p-4 rounded-xl w-full max-w-2xl z-30"}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {time} • {item.auditorium}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{item.group}</p>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${getTypeStyles(item.class_type)}`}
                                    >
                                        {getTypeLabel(item.class_type)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex items-center space-x-2">
                                        {/* Комментарии и QR здесь */}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, filter: "blur(10px)", y: 30, scale: 0.7 }}
                            animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
                            exit={{ opacity: 0, filter: "blur(10px)", y: 30, scale: 0.7 }}
                            transition={{
                                type: "spring",
                                stiffness: 80,
                                damping: 12,
                                mass: 0.8,
                            }}
                            className="size-full pt-10 text-xl text-muted-foreground font-semibold z-20 w-full max-w-2xl"
                        >
                            <div className="rounded-3xl w-full bg-muted py-14 flex items-center justify-center px-10 text-center">
                                {t.noClasses}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
