"use client"

import { useState, useEffect, useMemo } from "react"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { useMe } from "@/hooks/api/useMe"
import { useLanguage } from "@/hooks/useLanguage"
import { IAttendaceTable, useAttendanceTeacher, useToggleAttendanceTeacher } from "@/hooks/api/useAttendance"

interface AttendanceRecord {
  id: number
  studentId: string
  time: string
  date: string
  turnout: boolean
}

interface ApiResponse {
  status: string
  message: string
  teacher: string
  subject: string
  groupName: string
  data: AttendanceRecord[]
  count: number
}

interface StudentAttendance {
  studentId: string
  studentName: string
  records: Map<string, AttendanceRecord>
}

export default function TeacherAttendance(
  {
    userName
  }: {
    userName: string
  }
) {
  const { lang } = useLanguage();
  const t = translations[lang] || translations.en
  const toggleMutation = useToggleAttendanceTeacher();

  const [table, setTable] = useState<IAttendaceTable | undefined>(undefined);
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);
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
    return user.groups_sbj[selectedGroup] || [];
  }, [groups, user, selectedGroup]);

  const fetchAttendance = useAttendanceTeacher(
    selectedGroup,
    selectedSbj?.lesson_type,
    selectedSbj?.lesson_name,
  );

  const { dates, students } = useMemo(() => {
    if (!table || table.length === 0) {
      return { dates: [], students: [] };
    }

    const firstStudent = table[0];
    const allDates = Object.keys(firstStudent.attendance).sort();

    const studentsData = table.map(item => ({
      studentId: item.student_id,
      attendance: item.attendance
    }));

    return {
      dates: allDates,
      students: studentsData
    };
  }, [table]);

  useEffect(() => {
    if (fetchAttendance && fetchAttendance.attendance_json)
      setTable(fetchAttendance.attendance_json);
    else
      setTable(undefined);
  }, [fetchAttendance]);

  const toggleAttendance = (studentId: string, date: string, currentValue: boolean) => {
    if (!selectedGroup || !selectedSbj) return;

    toggleMutation.mutate({
      group_name: selectedGroup,
      subject_name: selectedSbj.lesson_name,
      subject_type: selectedSbj.lesson_type,
      date: date,
      zach: studentId,
      status: !currentValue,
    });
  };

  return (
    <div className="h-full bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between pt-12 py-4">
        <div>
          <h1 className="text-2xl font-bold">{t.attendance}</h1>
          <p className="text-muted-foreground md:hidden">{userName}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t.group}</label>
            <Select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
              }}
              className="bg-background border-border text-foreground"
            >
              <option value="">{t.selectGroup}</option>
              {groups.map((name, index) => (
                <option key={`${name}-${index}`} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t.subject}</label>
            <Select
              value={JSON.stringify(selectedSbj)}
              onChange={(e) => {
                console.log(e.target.value);
                const sbj = JSON.parse(e.target.value);
                setSelectedSbj(sbj);
              }}
              disabled={!selectedGroup}
              className="bg-background border-border text-foreground disabled:opacity-50"
            >
              <option value="">{t.selectSubject}</option>
              {subjects.map((item, index) => (
                <option key={index} value={JSON.stringify(item)}>
                  {item.lesson_name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Таблица посещаемости */}
      {table && table.length > 0 && (
        <div className="h-full pb-4 overflow-hidden">
          <div className="bg-card rounded-lg border border-border h-full flex flex-col overflow-hidden">
            {/* Заголовок таблицы - фиксированный */}
            <div className="flex-shrink-0 p-4 border-b border-border">
              <h3 className="font-semibold">Группа: {selectedGroup}</h3>
              <p className="text-sm text-muted-foreground">
                Предмет: {selectedSbj?.lesson_name} ({selectedSbj?.lesson_type})
              </p>
            </div>

            {/* Контейнер с прокруткой */}
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse text-xs">
                <thead className="sticky top-0 bg-card z-20">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-foreground sticky left-0 bg-card z-30 min-w-[80px] relative">
                      <div className="px-2 py-2 absolute inset-0 border-border border-r border-b flex items-center">
                        Студент
                      </div>
                    </th>
                    {dates.map(date => (
                      <th
                        key={date}
                        className="px-1 py-2 text-center font-medium text-foreground min-w-[60px] relative h-10 *:border-r last:*:border-r-0"
                      >
                        <div className="px-2 py-2 absolute inset-0 border-border border-r border-b flex items-center w-full justify-center">
                          {new Date(date).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.studentId}
                      className="border-b border-border hover:bg-muted/50 last:border-b-0"
                    >
                      <td className="relative font-medium sticky left-0 bg-card z-10">
                        <div className="px-2 py-2 absolute inset-0 border-border border-r flex items-center">
                          {student.studentId}
                        </div>
                      </td>
                      {dates.map(date => {
                        const isPresent = student.attendance[date as keyof typeof student.attendance];
                        return (
                          <td
                            key={date}
                            className="px-1 py-2 text-center border-r border-border last:border-r-0"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-6 w-6 rounded ${isPresent
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
                                }`}
                              onClick={() => toggleAttendance(student.studentId.toString(), date, Boolean(isPresent))}
                            >
                              {isPresent ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <span className="text-xs">-</span>
                              )}
                            </Button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {
        !table &&
        <div className="size-full flex justify-center items-center text-xl font-semibold text-foreground/40">
          {t.choice}
        </div>
      }
    </div>
  );
}