import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, User, GraduationCap, Users, Save, Check, X } from "lucide-react" // Убрал Clock
import { translations, type Language } from "@/lib/translations"
import { mockFaculties, mockGroups, mockSubjects, mockStudents, mockAttendance, type Attendance } from "@/data/mockData"
import { Input } from "@/components/ui/input"

interface TeacherAttendancePageProps {
  teacherName: string
  onNavigate: (page: "schedule" | "rating" | "attendance") => void
  onShowProfile: () => void
  language: Language
}

export default function TeacherAttendancePage({ teacherName, onNavigate, onShowProfile, language }: TeacherAttendancePageProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("")
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState<Record<string, Attendance>>({})
  const [loading, setLoading] = useState(false)

  const t = translations[language] || translations.en

  const availableGroups = mockGroups.filter(group => group.facultyId === selectedFaculty)
  const studentsInGroup = mockStudents.filter(student => student.groupId === selectedGroup)

  useEffect(() => {
    // Load existing attendance when filters change
    if (selectedSubject && selectedDate && studentsInGroup.length > 0) {
      const existingAttendance: Record<string, Attendance> = {}
      studentsInGroup.forEach(student => {
        const existing = mockAttendance.find(a => 
          a.studentId === student.id && 
          a.subjectId === selectedSubject && 
          a.date === selectedDate
        )
        if (existing) {
          existingAttendance[student.id] = existing
        } else {
          existingAttendance[student.id] = {
            studentId: student.id,
            subjectId: selectedSubject,
            date: selectedDate,
            status: "present" // Статус по умолчанию
          }
        }
      })
      setAttendance(existingAttendance)
    }
  }, [selectedSubject, selectedDate, selectedGroup])

  const handleAttendanceChange = (studentId: string, status: "present" | "absent") => { // Убрал "late"
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }))
  }

  const handleSaveAttendance = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Saving attendance:", attendance)
      alert(t.attendanceSaved)
    } catch (error) {
      console.error("Error saving attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const canSave = selectedFaculty && selectedGroup && selectedSubject && selectedDate && studentsInGroup.length > 0

  const getStatusIcon = (status: "present" | "absent") => {
    switch (status) {
      case "present":
        return <Check className="w-4 h-4 text-green-600" />
      case "absent":
        return <X className="w-4 h-4 text-red-600" />
    }
  }

  const getStatusColor = (status: "present" | "absent") => {
    switch (status) {
      case "present":
        return "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300"
      case "absent":
        return "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t.faculty}</label>
            <Select
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value)
                setSelectedGroup("")
                setSelectedSubject("")
              }}
            >
              <option value="">{t.selectFaculty}</option>
              {mockFaculties.map(faculty => (
                <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t.group}</label>
            <Select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value)
                setSelectedSubject("")
              }}
              disabled={!selectedFaculty}
            >
              <option value="">{t.selectGroup}</option>
              {availableGroups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t.subject}</label>
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedGroup}
            >
              <option value="">{t.selectSubject}</option>
              {mockSubjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {language === "ru" ? "Дата" : "Date"}
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="px-4 pb-20">
        {selectedSubject && studentsInGroup.length > 0 ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {mockSubjects.find(s => s.id === selectedSubject)?.name} - {mockGroups.find(g => g.id === selectedGroup)?.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedDate).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US")}
              </p>
            </div>

            <div className="space-y-2 p-4">
              {studentsInGroup.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span className="font-medium text-foreground">{student.name}</span>
                  
                  <div className="flex gap-2">
                    {(["present", "absent"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleAttendanceChange(student.id, status)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          attendance[student.id]?.status === status
                            ? getStatusColor(status)
                            : "bg-background border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {getStatusIcon(status)}
                        <span className="text-sm font-medium">{t[status]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {canSave && (
              <div className="p-4 border-t border-border">
                <Button
                  onClick={handleSaveAttendance}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? `${t.saveAttendance}...` : t.saveAttendance}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-lg">
              {language === "ru" ? "Выберите факультет, группу, предмет и дату" : "Select faculty, group, subject and date"}
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