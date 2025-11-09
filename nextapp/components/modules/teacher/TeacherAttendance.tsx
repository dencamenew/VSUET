"use client"

import { useState, useEffect, useMemo } from "react"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, User, GraduationCap, Users, Check, X, Loader2 } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { useSession } from '@/hooks/useSession'
import { GroupSubjects } from "@/app/page"
import BottomNavigation from "@/components/navigation/Navigation"
import { useMe } from "@/hooks/api/useMe"
import { useLanguage } from "@/hooks/useLanguage"
import { nanoid } from "nanoid"
import { useAttendanceTeacher } from "@/hooks/api/useAttendance"

interface TeacherAttendancePageProps {
  teacherName: string
  groupsSubjects: GroupSubjects
  onNavigate: (page: "schedule" | "rating" | "attendance") => void
  onShowProfile: () => void
  language: Language
}

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

export default function TeacherAttendance() {
  const { lang } = useLanguage();


  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([])
  const [dates, setDates] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const { getAuthHeaders } = useSession()

  const t = translations[lang] || translations.en

  // const URL = "http://localhost:8081/api"

  // // Получаем список групп
  // const groups = Object.keys(groupsSubjects || {}).map(groupName => ({
  //   id: groupName,
  //   name: groupName
  // }))

  // // Получаем список предметов для выбранной группы
  // const subjects = selectedGroup && groupsSubjects[selectedGroup]
  //   ? groupsSubjects[selectedGroup].map(subject => ({
  //     id: subject,
  //     name: subject
  //   }))
  //   : []

  // // Загрузка данных посещаемости
  // useEffect(() => {
  //   if (selectedGroup && selectedSubject) {
  //     fetchAttendanceData()
  //   } else {
  //     setAttendanceData([])
  //     setDates([])
  //     setError("")
  //   }
  // }, [selectedGroup, selectedSubject])

  // const fetchAttendanceData = async () => {
  //   setLoading(true)
  //   setError("")
  //   try {
  //     const response = await fetch(
  //       `${URL}/attendance/vedomost?teacher=${encodeURIComponent(teacherName)}&subject=${encodeURIComponent(selectedSubject)}&groupName=${encodeURIComponent(selectedGroup)}`,
  //       {
  //         headers: getAuthHeaders(),
  //       }
  //     )

  //     if (!response.ok) {
  //       throw new Error(`Ошибка HTTP: ${response.status}`)
  //     }

  //     const apiResponse: ApiResponse = await response.json()

  //     if (apiResponse.status === "SUCCESS") {
  //       processAttendanceData(apiResponse.data)
  //     } else {
  //       setError(apiResponse.message || "Не удалось получить данные")
  //       setAttendanceData([])
  //       setDates([])
  //     }
  //   } catch (error) {
  //     console.error("Error fetching attendance data:", error)
  //     setError("Ошибка при загрузке данных")
  //     setAttendanceData([])
  //     setDates([])
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // const processAttendanceData = (records: AttendanceRecord[]) => {
  //   // Группируем записи по студентам
  //   const studentsMap = new Map<string, StudentAttendance>()

  //   records.forEach(record => {
  //     if (!studentsMap.has(record.studentId)) {
  //       studentsMap.set(record.studentId, {
  //         studentId: record.studentId,
  //         studentName: record.studentId,
  //         records: new Map()
  //       })
  //     }
  //     // Сохраняем запись по дате
  //     studentsMap.get(record.studentId)!.records.set(record.date, record)
  //   })

  //   // Получаем уникальные даты и сортируем их
  //   const uniqueDates = Array.from(new Set(records.map(r => r.date)))
  //     .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  //   setDates(uniqueDates)

  //   // Преобразуем Map в массив и сортируем по ID студента
  //   const studentsArray = Array.from(studentsMap.values()).sort((a, b) =>
  //     a.studentId.localeCompare(b.studentId)
  //   )

  //   setAttendanceData(studentsArray)
  // }

  // const updateAttendance = async (recordId: number, turnout: boolean) => {
  //   try {
  //     const response = await fetch(`${URL}/attendance/update-attendance`, {
  //       method: 'PUT',
  //       headers: getAuthHeaders(),
  //       body: JSON.stringify({
  //         id: recordId,
  //         turnout: turnout
  //       }),
  //     })

  //     if (!response.ok) {
  //       throw new Error('Failed to update attendance')
  //     }

  //     const result = await response.json()

  //     if (result.status === "SUCCESS") {
  //       // Обновляем локальное состояние
  //       setAttendanceData(prev => prev.map(student => ({
  //         ...student,
  //         records: new Map(Array.from(student.records.entries()).map(([date, record]) => [
  //           date,
  //           record.id === recordId ? { ...record, turnout } : record
  //         ]))
  //       })))
  //     } else {
  //       throw new Error(result.message || 'Ошибка при обновлении')
  //     }
  //   } catch (error) {
  //     console.error('Error updating attendance:', error)
  //     alert('Ошибка при обновлении посещаемости')
  //   }
  // }

  // // Автоматически выбираем предмет, если он всего один
  // useEffect(() => {
  //   if (subjects.length === 1) {
  //     setSelectedSubject(subjects[0].id)
  //   } else if (subjects.length === 0) {
  //     setSelectedSubject("")
  //   }
  // }, [subjects])
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | undefined>(undefined);
  const [selectedSubjectType, setSelectedSubjectType] = useState<string | undefined>(undefined);

  const user = useMe();

  const groups = useMemo(() => {
    return Object.keys(user?.groups_sbj || {});
  }, [user]);

  const subjects = useMemo(() => {
    if (!user || !selectedGroup) return [];
    return user.groups_sbj[selectedGroup] || [];
  }, [groups, user, selectedGroup]);

  const dataA = useAttendanceTeacher(
    selectedGroup,
    selectedSubjectType,
    selectedSubjectName,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div>
          <h1 className="text-2xl font-bold">{t.attendance}</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t.group}</label>
            <Select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setSelectedSubjectName(undefined);
                setSelectedSubjectType(undefined);
                setAttendanceData([])
                setDates([])
                setError("")
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
              value={selectedSubjectName}
              onChange={(e) => {
                console.log(e.target.value);
                const sbj = JSON.parse(e.target.value);
                console.log(sbj)
                setSelectedSubjectName(sbj.lesson_name);
                setSelectedSubjectType(sbj.lesson_type);
                setAttendanceData([])
                setDates([])
                setError("")
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
          {/* <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t.subject}</label>
            <Select
              value={selectedSubjectType}
              onChange={(e) => {
                setSelectedSubjectType(e.target.value)
                setAttendanceData([])
                setDates([])
                setError("")
              }}
              disabled={!selectedGroup}
              className="bg-background border-border text-foreground disabled:opacity-50"
            >
              <option value="">{t.selectSubject}</option>
              {subjects.map((item, index) => (
                <option key={index} value={item.lesson_name}>
                  {item.lesson_name}
                </option>
              ))}
            </Select>
          </div> */}
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Таблица посещаемости */}
      {loading && (
        <div className="px-4 py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Загрузка данных...</p>
        </div>
      )}

      {!loading && attendanceData.length > 0 && (
        <div className="px-4 pb-24 overflow-x-auto">
          <div className="bg-card rounded-lg border border-border">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Группа: {selectedGroup}</h3>
              <p className="text-sm text-muted-foreground">Предмет: {selectedSubject}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-2 py-2 text-left font-medium text-foreground sticky left-0 bg-card z-10 min-w-[80px] border-r border-border">
                      Студент
                    </th>
                    {dates.map(date => (
                      <th key={date} className="px-1 py-2 text-center font-medium text-foreground min-w-[40px] border-r border-border last:border-r-0">
                        {new Date(date).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((student) => (
                    <tr key={student.studentId} className="border-b border-border hover:bg-muted/50">
                      <td className="px-2 py-2 font-medium sticky left-0 bg-card z-10 border-r border-border">
                        {student.studentId}
                      </td>
                      {dates.map(date => {
                        const record = student.records.get(date)
                        return (
                          <td key={date} className="px-1 py-2 text-center border-r border-border last:border-r-0">
                            {record ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-6 w-6 rounded ${record.turnout
                                  ? 'bg-green-500 hover:bg-green-600 text-white'
                                  : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
                                  }`}
                                onClick={() => updateAttendance(record.id, !record.turnout)}
                              >
                                {record.turnout ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <span className="text-xs">-</span>
                                )}
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* {!loading && selectedGroup && selectedSubject && attendanceData.length === 0 && !error && (
        <div className="px-4 py-8 text-center">
          <p className="text-muted-foreground">Нет данных о посещаемости для выбранной группы и предмета</p>
          <Button
            onClick={fetchAttendanceData}
            variant="outline"
            className="mt-4"
          >
            Попробовать снова
          </Button>
        </div>
      )} */}
    </div>
  )
}