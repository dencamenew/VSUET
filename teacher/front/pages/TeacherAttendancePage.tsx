"use client"

import { useState, useEffect } from "react"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, User, GraduationCap, Users } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import type { GroupSubjects } from "../app/page"

interface TeacherAttendancePageProps {
  teacherName: string
  groupsSubjects: GroupSubjects
  onNavigate: (page: "schedule" | "rating" | "attendance") => void
  onShowProfile: () => void
  language: Language
}

export default function TeacherAttendancePage({
  teacherName,
  groupsSubjects,
  onNavigate,
  onShowProfile,
  language,
}: TeacherAttendancePageProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")

  const t = translations[language] || translations.en

  // Получаем список групп
  const groups = Object.keys(groupsSubjects || {}).map(groupName => ({
    id: groupName,
    name: groupName
  }))

  // Получаем список предметов для выбранной группы
  const subjects = selectedGroup && groupsSubjects[selectedGroup]
    ? Object.entries(groupsSubjects[selectedGroup]).flatMap(([subjectName, lessonTypes]) => 
        lessonTypes.map(lessonType => ({
          id: `${subjectName}_${lessonType}`,
          name: `${subjectName} (${lessonType})`
        }))
      )
    : []

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
              {groups.map((group) => (
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
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Просто отображаем выбранные значения для проверки */}
      <div className="px-4">
        <p>Выбранная группа: {selectedGroup}</p>
        <p>Выбранный предмет: {selectedSubject}</p>
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