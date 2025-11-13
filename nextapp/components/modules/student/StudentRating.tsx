"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { translations } from "@/lib/translations"
import { useLanguage } from "@/hooks/useLanguage"
import { useMe } from "@/hooks/api/useMe"
import { ISubjectRating, useRatingStudent } from "@/hooks/api/useRating"
import { useMemo } from "react"
import { SideFade } from "@/components/ui/particles/SideFade"

interface SubjectRating {
    name: string
    vedType: string
    ratings: {
        name: string
        value: string | number
    }[]
    finalGrade?: string
    type: "single" | "multiple" | "points"
}

export function StudentRating({
    userPlaceholder
}: {
    userPlaceholder: string
}) {
    const user = useMe();
    const { lang } = useLanguage();
    const t = translations[lang];
    const rating = useRatingStudent(user?.zach_number);

    const capitalizeFirstLetter = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
    }

    const getVedTypeDisplayName = (vedType: string) => {
        const vedTypeMap: Record<string, { ru: string; en: string }> = {
            'экзамен': { ru: 'Экзамен', en: 'Exam' },
            'зачет': { ru: 'Зачёт', en: 'Test' },
            'зачёт': { ru: 'Зачёт', en: 'Test' },
            'диффзачет': { ru: 'Дифф. зачёт', en: 'Diff. test' },
            'зачет с оценкой': { ru: 'Зачёт с оценкой', en: 'Graded test' },
            'курсовая': { ru: 'Курсовая работа', en: 'Coursework' },
            'курсовая работа': { ru: 'Курсовая работа', en: 'Coursework' },
            'выпускная': { ru: 'Выпускная работа', en: 'Graduation work' },
            'выпускная работа': { ru: 'Выпускная работа', en: 'Graduation work' },
            'дипломная работа': { ru: 'Дипломная работа', en: 'Diploma work' },
            'практика': { ru: 'Практика', en: 'Practice' },
            'учебная практика': { ru: 'Учебная практика', en: 'Training practice' },
            'производственная практика': { ru: 'Производственная практика', en: 'Industrial practice' },
            'преддипломная практика': { ru: 'Преддипломная практика', en: 'Pre-diploma practice' },
            'default': { ru: 'Ведомость', en: 'Record' }
        }

        const lowerVedType = vedType.toLowerCase().trim()

        if (lowerVedType.includes('практика') || lowerVedType.includes('practice')) {
            if (vedTypeMap[lowerVedType]) {
                return lang === "ru" ? vedTypeMap[lowerVedType].ru : vedTypeMap[lowerVedType].en
            }
            return lang === "ru" ? 'Практика' : 'Practice'
        }

        if (lowerVedType.includes('курсовая') || lowerVedType.includes('coursework')) {
            return vedTypeMap[lowerVedType] ? (lang === "ru" ? vedTypeMap[lowerVedType].ru : vedTypeMap[lowerVedType].en) : (lang === "ru" ? 'Курсовая работа' : 'Coursework')
        }

        return vedTypeMap[lowerVedType] ? (lang === "ru" ? vedTypeMap[lowerVedType].ru : vedTypeMap[lowerVedType].en) : vedType
    }

    const getGradeColor = (grade: string | number) => {
        const numGrade = Number(grade)
        if (grade === "Отлично" || grade === "Отл" || grade === "5" || numGrade >= 85) return "text-green-500"
        if (grade === "Хорошо" || grade === "Хор" || grade === "4" || numGrade >= 65) return "text-yellow-500"
        if (grade === "Удовлетворительно" || grade === "Удовл" || grade === "3" || numGrade >= 40) return "text-orange-500"
        return "text-red-500"
    }

    const getGradeText = (grade: string | number) => {
        const gradeMap: Record<string, string> = {
            "Отлично": "Отлично",
            "Отл": "5",
            "Хорошо": "Хорошо",
            "Хор": "4",
            "Удовлетворительно": "Удовлетворительно",
            "Удовл": "3",
            "Неудовлетворительно": "Неудовлетворительно",
            "Неуд": "2"
        }
        return gradeMap[String(grade)] || String(grade)
    }

    const processRatings = useMemo((): SubjectRating[] => {
        if (!rating?.ratings) return []

        return Object.entries(rating.ratings).map(([subjectName, data]: [string, ISubjectRating]): SubjectRating => {
            const vedType = getVedTypeDisplayName(data.type || 'default')

            // Если есть только grade (курсовая, практика)
            if ("grade" in data) {
                return {
                    name: capitalizeFirstLetter(subjectName),
                    vedType: vedType,
                    ratings: [{ name: lang === "ru" ? "Оценка" : "Grade", value: data.grade }],
                    type: "single"
                }
            }

            // Если есть kt1-kt5 (контрольные точки)
            if ("kt1" in data) {
                const checkpoints: { name: string; value: number }[] = []
                const keys: Array<'kt1' | 'kt2' | 'kt3' | 'kt4' | 'kt5'> = ['kt1', 'kt2', 'kt3', 'kt4', 'kt5']

                keys.forEach((key) => {
                    checkpoints.push({
                        name: lang === "ru" ? `КТ${key.replace('kt', '')}` : `CP${key.replace('kt', '')}`,
                        value: data[key]
                    })
                })

                return {
                    name: capitalizeFirstLetter(subjectName),
                    vedType: vedType,
                    ratings: checkpoints,
                    type: "points"
                }
            }

            return {
                name: capitalizeFirstLetter(subjectName),
                vedType: vedType,
                ratings: [],
                type: "multiple"
            }
        })
    }, [rating, lang]);

    return (
        <div className="h-full bg-background text-foreground flex flex-col">
            <div className="flex-shrink-0 py-1 pt-12 px-6">
                <h1 className="text-2xl font-bold">{t.rating}</h1>
                <p className="text-muted-foreground md:hidden">{userPlaceholder}</p>
            </div>

            <div className="flex-1 min-h-0 relative overflow-hidden">
                <div className="absolute w-full pointer-events-none z-50 px-6">
                    <SideFade
                        width="100%"
                        height={24}
                        className="bg-gradient-to-b from-background to-transparent relative"
                    />
                </div>

                <div className="h-full px-6 space-y-4 py-6 overflow-y-auto scrollbar-xs">
                    {processRatings.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-muted-foreground text-lg">
                                {lang === "ru" ? "Нет данных о рейтинге" : "No rating data"}
                            </p>
                        </div>
                    ) : (
                        processRatings.map((subject, index) => (
                            <Card key={index} className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-foreground font-medium text-lg">{subject.name}</h3>
                                            <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                                                <FileText className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    {subject.vedType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {subject.type === "single" ? (
                                        <div className="flex justify-between items-center">
                                            <p className="text-muted-foreground text-sm">
                                                {lang === "ru" ? "Оценка:" : "Grade:"}
                                            </p>
                                            <div className={`text-xl font-bold ${getGradeColor(subject.ratings[0].value)}`}>
                                                {getGradeText(subject.ratings[0].value)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-muted-foreground text-sm font-medium mb-2">
                                                {subject.type === "points"
                                                    ? (lang === "ru" ? "Контрольные точки:" : "Checkpoints:")
                                                    : (lang === "ru" ? "Оценки:" : "Grades:")}
                                            </p>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                                {subject.ratings.map((rating, idx) => (
                                                    <div key={idx} className="bg-muted/50 rounded-lg p-2 text-center">
                                                        <p className="text-xs text-muted-foreground">{rating.name}</p>
                                                        <p className={`text-sm font-semibold ${getGradeColor(rating.value)}`}>
                                                            {getGradeText(rating.value)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
};