import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/api/useMe";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";
import { useDownloadAttendance, useDownloadRating, useDownloadAverage } from "@/hooks/api/useStatements";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";

export function TeacherStatements(
    {
        userPlaceholder
    }: {
        userPlaceholder: string
    }
) {
    const { lang } = useLanguage();
    const t = translations[lang].statements;

    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [selectedSbj, setSelectedSbj] = useState<{
        lesson_name: string;
        lesson_type: string;
    } | undefined>(undefined);

    const user = useMe();

    const groups = useMemo(() => {
        return Object.keys(user?.groups_sbj || {});
    }, [user]);

    const subjects = useMemo(() => {
        if (!user || !selectedGroup) return [];
        return user.groups_sbj ? user.groups_sbj[selectedGroup] : [];
    }, [user, selectedGroup]);

    // Мутации для скачивания
    const downloadAttendance = useDownloadAttendance();
    const downloadRating = useDownloadRating();
    const downloadAverage = useDownloadAverage();

    // Обработчики кнопок
    const handleDownloadAttendance = () => {
        if (!selectedGroup || !selectedSbj) return;

        downloadAttendance.mutate({
            groupName: selectedGroup,
            subjectType: selectedSbj.lesson_type,
            subjectName: selectedSbj.lesson_name,
        });
    };

    const handleDownloadRating = () => {
        if (!selectedGroup || !selectedSbj) return;

        downloadRating.mutate({
            groupName: selectedGroup,
            subjectName: selectedSbj.lesson_name,
        });
    };

    const handleDownloadAverage = () => {
        if (!selectedGroup) return;

        downloadAverage.mutate({
            groupName: selectedGroup,
        });
    };

    // Условия для disabled кнопок
    const canDownloadAttendance = selectedGroup && selectedSbj && !downloadAttendance.isPending;
    const canDownloadRating = selectedGroup && selectedSbj && !downloadRating.isPending;
    const canDownloadAverage = selectedGroup && !downloadAverage.isPending;

    return (
        <div className="h-full bg-background text-foreground flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between py-4 pt-12 px-6">
                <div>
                    <h1 className="text-2xl font-bold">{t.title}</h1>
                    <p className="text-muted-foreground md:hidden">{userPlaceholder}</p>
                    <p className="pt-4">
                        {t.description}
                    </p>
                </div>
            </div>

            <div className="h-full overflow-y-auto pt-6 px-6">
                <div className="rounded-xl bg-muted p-6 space-y-6">
                    {/* Селекторы */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Селектор группы */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Группа</label>
                            <Select
                                className="bg-background"
                                value={selectedGroup}
                                onChange={(e) => {
                                    setSelectedGroup(e.target.value);
                                    setSelectedSbj(undefined);
                                }}
                            >
                                <option value="">Выберите группу</option>
                                {groups.map((group) => (
                                    <option key={group} value={group}>
                                        {group}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        {/* Селектор предмета */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Предмет</label>
                            <Select
                                className="bg-background"
                                value={selectedSbj ? `${selectedSbj.lesson_name}_${selectedSbj.lesson_type}` : ""}
                                onChange={(e) => {
                                    const subject = subjects.find(
                                        s => `${s.lesson_name}_${s.lesson_type}` === e.target.value
                                    );
                                    setSelectedSbj(subject);
                                }}
                                disabled={!selectedGroup}
                            >
                                <option value="">Выберите предмет</option>
                                {subjects.map((subject, idx) => (
                                    <option
                                        key={idx}
                                        value={`${subject.lesson_name}_${subject.lesson_type}`}
                                    >
                                        {subject.lesson_name} ({subject.lesson_type})
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    {/* Кнопки скачивания */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium">Скачать ведомости</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            {/* Посещаемость */}
                            <Button
                                onClick={handleDownloadAttendance}
                                disabled={!canDownloadAttendance}
                                variant="default"
                                className="w-full"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {downloadAttendance.isPending ? 'Скачивание...' : 'Посещаемость'}
                            </Button>

                            {/* Рейтинг */}
                            <Button
                                onClick={handleDownloadRating}
                                disabled={!canDownloadRating}
                                variant="default"
                                className="w-full"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {downloadRating.isPending ? 'Скачивание...' : 'Рейтинг'}
                            </Button>

                            {/* Средний балл */}
                            <Button
                                onClick={handleDownloadAverage}
                                disabled={!canDownloadAverage}
                                variant="default"
                                className="w-full"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {downloadAverage.isPending ? 'Скачивание...' : 'Средний балл'}
                            </Button>
                        </div>

                        {/* Сообщения об ошибках */}
                        {downloadAttendance.isError && (
                            <p className="text-sm text-red-500">
                                Ошибка скачивания посещаемости
                            </p>
                        )}
                        {downloadRating.isError && (
                            <p className="text-sm text-red-500">
                                Ошибка скачивания рейтинга
                            </p>
                        )}
                        {downloadAverage.isError && (
                            <p className="text-sm text-red-500">
                                Ошибка скачивания среднего балла
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
