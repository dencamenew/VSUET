import { Input } from "@/components/ui/input";
import { SideFade } from "@/components/ui/particles/SideFade";
import { useAttendanceStudent } from "@/hooks/api/useAttendance";
import { useMe } from "@/hooks/api/useMe";
import { IStudentSubject } from "@/hooks/api/useStudentInfo";
import { useStudentInfoSubjects } from "@/hooks/api/useStudentInfo";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { VList } from "virtua";
import { Loading } from "@/components/ui/loading";

function AttendanceCard({
    subject_name,
    subject_type
}: IStudentSubject) {
    const dataAttendance = useAttendanceStudent(subject_name, subject_type);

    const attendanceDates = useMemo(() => {
        if (!dataAttendance?.attendance) return [];

        return Object.entries(dataAttendance.attendance.attendance)
            .map(([date, status]) => ({
                date,
                status
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [dataAttendance]);

    const stats = useMemo(() => {
        if (!attendanceDates.length) return { present: 0, absent: 0 };

        const present = attendanceDates.filter(d => d.status).length;
        const total = attendanceDates.length;
        const absent = total - present;

        return { present, absent };
    }, [attendanceDates]);

    return (
        <div
            className="rounded-2xl bg-card border border-border p-4 space-y-4 m-2"
        >
            <div>
                <h3 className="text-lg font-semibold">
                    {subject_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {subject_type}
                </p>
            </div>

            {/* Статистика */}
            <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-green-300 dark:bg-green-800" />
                    <span className="text-muted-foreground">
                        Присутствовал: <span className="font-semibold text-foreground">{stats.present}</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-red-300 dark:bg-red-800" />
                    <span className="text-muted-foreground">
                        Отсутствовал: <span className="font-semibold text-foreground">{stats.absent}</span>
                    </span>
                </div>
            </div>

            {/* Таблица посещаемости */}
            {attendanceDates.length > 0 ? (
                <div className="border rounded-md overflow-hidden bg-muted">
                    <div className="max-h-[300px] overflow-y-auto scrollbar-xs">
                        <table className="w-full text-sm">
                            <thead className="bg-muted sticky top-0 z-10">
                                <tr>
                                    <th className="text-left p-2 font-semibold">Дата</th>
                                    <th className="text-center p-2 font-semibold">Статус</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {attendanceDates.map(({ date, status }) => (
                                    <tr
                                        key={date}
                                        className="bg-background hover:bg-muted/50 transition-colors"
                                    >
                                        <td className="p-2">
                                            {new Date(date).toLocaleDateString('ru', {
                                                day: '2-digit',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-2 text-center">
                                            {status ? (
                                                <div className="inline-flex items-center justify-center size-6 rounded-full bg-green-100 dark:bg-green-900/30">
                                                    <Check className="size-4 text-green-600 dark:text-green-400" />
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center justify-center size-6 rounded-full bg-red-100 dark:bg-red-900/30">
                                                    <X className="size-4 text-red-600 dark:text-red-400" />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                    Нет данных о посещаемости
                </p>
            )}
        </div>
    );
}


export function StudentAttendance({
    userPlaceholder
}: {
    userPlaceholder: string
}) {
    const { lang } = useLanguage();
    const t = translations[lang];
    const user = useMe();


    const [searchQuery, setSearchQuery] = useState("");


    const dataSubjects = useStudentInfoSubjects(user?.zach_number);


    const subjects = useMemo(() => {
        if (dataSubjects && user && user.zach_number) {
            return dataSubjects[user.zach_number] || [];
        }
        return [];
    }, [dataSubjects, user]);


    const filteredSubjects = useMemo(() => {
        if (!searchQuery.trim()) return subjects;


        const query = searchQuery.toLowerCase();
        return subjects.filter(subject =>
            subject.subject_name.toLowerCase().includes(query) ||
            subject.subject_type.toLowerCase().includes(query)
        );
    }, [subjects, searchQuery]);

    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShouldRender(true), 400);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="h-full bg-background text-foreground flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between pt-12 py-4 px-6">
                <div>
                    <h1 className="text-2xl font-bold">{t.attendance}</h1>
                    <p className="text-muted-foreground md:hidden">{userPlaceholder}</p>
                </div>
            </div>


            <div className="pb-4 px-6">
                <Input
                    placeholder="Поиск дисциплины"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>


            <div className="flex-1 min-h-0 relative overflow-hidden">
                <div className="absolute w-full pointer-events-none z-50 px-6">
                    <SideFade
                        width="100%"
                        height={24}
                        className="bg-gradient-to-b from-background to-transparent relative"
                    />
                </div>
                {shouldRender && filteredSubjects.length > 0 ?
                    <VList className="w-full h-full px-4 py-4 pb-2 pr-2 overflow-y-auto scrollbar-xs flex flex-col">
                        {filteredSubjects.map((subject, index) => (
                            <AttendanceCard key={index} {...subject} />
                        ))}
                    </VList>
                    :
                    <div className="h-full w-full flex items-center justify-center">
                        <div className="text-muted-foreground text-center text-xl font-semibold">
                            {shouldRender ?
                                (searchQuery
                                    ? "Дисциплины не найдены"
                                    : "Нет данных о дисциплинах"
                                )
                                :
                                <div className="size-10 text-foreground">
                                    <Loading />
                                </div>
                            }
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}