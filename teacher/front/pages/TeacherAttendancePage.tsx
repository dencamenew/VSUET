"use client"

import { useState, useEffect } from "react"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, User, GraduationCap, Users, Check, Minus } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import {
  mockGroups,
  mockSubjects,
  mockStudents,
  type Attendance,
} from "@/data/mockData"

interface TeacherAttendancePageProps {
  teacherName: string
  onNavigate: (page: "schedule" | "rating" | "attendance") => void
  onShowProfile: () => void
  language: Language
}

export default function TeacherAttendancePage({
  teacherName,
  onNavigate,
  onShowProfile,
  language,
}: TeacherAttendancePageProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [attendance, setAttendance] = useState<Record<string, Attendance>>({})

  const t = translations[language] || translations.en

  const studentsInGroup = mockStudents.filter((student) => student.groupId === selectedGroup)

  // Генерация дат на полгода вперед
  const generateSixMonthsDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 180; i++) { // 6 месяцев примерно 180 дней
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      // Только рабочие дни (пн-пт)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split("T")[0])
      }
    }
    return dates.slice(0, 30) // Ограничим до 30 дат для примера
  }

  const sixMonthsDates = generateSixMonthsDates()

  const handleAttendanceChange = (studentId: string, date: string, status: "present" | "absent") => {
    setAttendance((prev) => ({
      ...prev,
      [`${studentId}-${date}`]: {
        studentId,
        subjectId: selectedSubject,
        date,
        status,
      },
    }))
  }

  const getStatusIcon = (status: "present" | "absent" | undefined) => {
    switch (status) {
      case "present":
        return <Check className="w-4 h-4 text-green-600" />
      case "absent":
        return <Minus className="w-4 h-4 text-gray-400" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div>
          <h1 className="text-2xl font-bold">{t.attendance}</h1>
          <p className="text-muted-foreground">{teacherName}</p>
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
                setSelectedGroup(e.target.value)
                setSelectedSubject("")
              }}
              className="bg-background border-border text-foreground"
            >
              <option value="">{t.selectGroup}</option>
              {mockGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t.subject}</label>
            <Select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value)
              }}
              disabled={!selectedGroup}
              className="bg-background border-border text-foreground disabled:opacity-50"
            >
              <option value="">{t.selectSubject}</option>
              {mockSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="px-4 pb-20 overflow-x-auto">
        {selectedSubject && selectedGroup && studentsInGroup.length > 0 ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {mockSubjects.find((s) => s.id === selectedSubject)?.name} -{" "}
                {mockGroups.find((g) => g.id === selectedGroup)?.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === "ru" ? "Посещаемость за полгода" : "Attendance for six months"}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left text-sm font-medium text-foreground min-w-[200px] sticky left-0 bg-card z-10">
                      {language === "ru" ? "Студент" : "Student"}
                    </th>
                    {sixMonthsDates.map((date) => (
                      <th key={date} className="p-2 text-center text-sm font-medium text-foreground min-w-[50px]">
                        {new Date(date).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studentsInGroup.map((student) => (
                    <tr key={student.id} className="border-b border-border even:bg-muted/20">
                      <td className="p-3 font-medium text-foreground sticky left-0 bg-card z-10 min-w-[200px]">
                        {student.name}
                      </td>
                      {sixMonthsDates.map((date) => {
                        const attendanceKey = `${student.id}-${date}`
                        const status = attendance[attendanceKey]?.status
                        return (
                          <td key={date} className="p-2 text-center min-w-[50px]">
                            <button
                              onClick={() =>
                                handleAttendanceChange(
                                  student.id,
                                  date,
                                  status === "present" ? "absent" : "present"
                                )
                              }
                              className="w-6 h-6 flex items-center justify-center mx-auto rounded-md hover:bg-muted"
                            >
                              {getStatusIcon(status)}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-lg">
              {language === "ru"
                ? "Выберите группу и предмет"
                : "Select group and subject"}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <div className="flex justify-around items-center py-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted"
            onClick={() => onNavigate("schedule")}
          >
            <Calendar className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted"
            onClick={() => onNavigate("rating")}
          >
            <GraduationCap className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-muted"
            onClick={() => onNavigate("attendance")}
          >
            <Users className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted" onClick={onShowProfile}>
            <User className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}