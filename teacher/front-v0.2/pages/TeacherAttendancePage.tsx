"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Calendar, User, GraduationCap, Users, Save, Check, X, QrCode, ArrowLeft, RotateCcw, Clock } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import {
  mockFaculties,
  mockGroups,
  mockSubjects,
  mockStudents,
  mockAttendance,
  generateMockSchedule,
  type Attendance,
  type Lesson,
} from "@/data/mockData"
import { Input } from "@/components/ui/input"

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
  const [selectedFaculty, setSelectedFaculty] = useState<string>("")
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [selectedLesson, setSelectedLesson] = useState<string>("")
  const [attendance, setAttendance] = useState<Record<string, Attendance>>({})
  const [loading, setLoading] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCodeId, setQrCodeId] = useState(1)
  const [schedule, setSchedule] = useState<Record<string, Lesson[]>>({})

  const t = translations[language] || translations.en

  const availableGroups = mockGroups.filter((group) => group.facultyId === selectedFaculty)
  const studentsInGroup = mockStudents.filter((student) => student.groupId === selectedGroup)

  const availableLessons =
    schedule[selectedDate]?.filter(
      (lesson) =>
        lesson.group === mockGroups.find((g) => g.id === selectedGroup)?.name &&
        lesson.subject === mockSubjects.find((s) => s.id === selectedSubject)?.name,
    ) || []

  useEffect(() => {
    const mockSchedule = generateMockSchedule()
    setSchedule(mockSchedule)
  }, [])

  useEffect(() => {
    if (selectedSubject && selectedDate && selectedLesson && studentsInGroup.length > 0) {
      const existingAttendance: Record<string, Attendance> = {}
      studentsInGroup.forEach((student) => {
        const existing = mockAttendance.find(
          (a) => a.studentId === student.id && a.subjectId === selectedSubject && a.date === selectedDate,
        )
        if (existing) {
          existingAttendance[student.id] = existing
        } else {
          existingAttendance[student.id] = {
            studentId: student.id,
            subjectId: selectedSubject,
            date: selectedDate,
            status: "present",
          }
        }
      })
      setAttendance(existingAttendance)
    }
  }, [selectedSubject, selectedDate, selectedLesson, selectedGroup])

  const handleAttendanceChange = (studentId: string, status: "present" | "absent") => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }))
  }

  const handleSaveAttendance = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Saving attendance:", attendance)
      alert(t.attendanceSaved)
    } catch (error) {
      console.error("Error saving attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const canSave =
    selectedFaculty && selectedGroup && selectedSubject && selectedDate && selectedLesson && studentsInGroup.length > 0

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

  const generateNewQRCode = () => {
    setQrCodeId((prev) => prev + 1)
  }

  const closeQRModal = () => {
    setShowQRModal(false)
    setQrCodeId(1)
  }

  const selectedLessonDetails = availableLessons.find((lesson) => lesson.id === selectedLesson)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div>
          <h1 className="text-2xl font-bold">{t.attendance}</h1>
          <p className="text-muted-foreground">{teacherName}</p>
        </div>
        {canSave && (
          <Button
            onClick={() => setShowQRModal(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <QrCode className="w-4 h-4 mr-2" />
            {language === "ru" ? "QR Посещаемость" : "QR Attendance"}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="px-4 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t.faculty}</label>
            <Select
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value)
                setSelectedGroup("")
                setSelectedSubject("")
                setSelectedLesson("")
              }}
              className="bg-background border-border text-foreground"
            >
              <option value="">{t.selectFaculty}</option>
              {mockFaculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
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
                setSelectedLesson("")
              }}
              disabled={!selectedFaculty}
              className="bg-background border-border text-foreground disabled:opacity-50"
            >
              <option value="">{t.selectGroup}</option>
              {availableGroups.map((group) => (
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
                setSelectedLesson("")
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {language === "ru" ? "Дата" : "Date"}
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setSelectedLesson("")
              }}
              className="w-full bg-background border-border text-foreground focus:border-primary focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              {language === "ru" ? "Время пары" : "Lesson Time"}
            </label>
            <Select
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
              disabled={!selectedSubject || !selectedDate || availableLessons.length === 0}
              className="bg-background border-border text-foreground disabled:opacity-50"
            >
              <option value="">
                {availableLessons.length === 0
                  ? language === "ru"
                    ? "Нет пар"
                    : "No lessons"
                  : language === "ru"
                    ? "Выберите время"
                    : "Select time"}
              </option>
              {availableLessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.time} - {lesson.endTime} ({lesson.room})
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="px-4 pb-20">
        {selectedSubject && selectedLesson && studentsInGroup.length > 0 ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {mockSubjects.find((s) => s.id === selectedSubject)?.name} -{" "}
                {mockGroups.find((g) => g.id === selectedGroup)?.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedDate).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US")}
                {selectedLessonDetails && (
                  <span className="ml-2">
                    • {selectedLessonDetails.time} - {selectedLessonDetails.endTime} • {selectedLessonDetails.room}
                  </span>
                )}
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
                <Button onClick={handleSaveAttendance} disabled={loading} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? `${t.saveAttendance}...` : t.saveAttendance}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-lg">
              {language === "ru"
                ? "Выберите факультет, группу, предмет, дату и время пары"
                : "Select faculty, group, subject, date and lesson time"}
            </p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedLessonDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-xl max-w-md w-full p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {language === "ru" ? "QR Код для посещаемости" : "QR Code for Attendance"}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeQRModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>

            {/* QR Code Display */}
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg border-2 border-border">
                <img
                  src={`/qr-code-.png?key=rvy5z&height=200&width=200&query=QR code ${qrCodeId} lesson ${selectedLessonDetails.id} ${selectedLessonDetails.time} ${selectedSubject} ${selectedGroup} ${selectedDate}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {language === "ru"
                    ? "Студенты могут отсканировать этот код для отметки посещаемости"
                    : "Students can scan this code to mark their attendance"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === "ru" ? `Код #${qrCodeId}` : `Code #${qrCodeId}`}
                </p>
              </div>

              {/* Generate New QR Button */}
              <Button onClick={generateNewQRCode} variant="outline" className="w-full bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                {language === "ru" ? "Обновить QR код" : "Generate New QR"}
              </Button>
            </div>

            {/* Subject and Group Info */}
            <div className="mt-6 p-3 bg-muted/20 rounded-lg">
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">{t.subject}:</span>{" "}
                  {mockSubjects.find((s) => s.id === selectedSubject)?.name}
                </p>
                <p>
                  <span className="font-medium">{t.group}:</span> {mockGroups.find((g) => g.id === selectedGroup)?.name}
                </p>
                <p>
                  <span className="font-medium">{language === "ru" ? "Дата" : "Date"}:</span>{" "}
                  {new Date(selectedDate).toLocaleDateString(language === "ru" ? "ru-RU" : "en-US")}
                </p>
                <p>
                  <span className="font-medium">{language === "ru" ? "Время" : "Time"}:</span>{" "}
                  {selectedLessonDetails.time} - {selectedLessonDetails.endTime}
                </p>
                <p>
                  <span className="font-medium">{language === "ru" ? "Аудитория" : "Room"}:</span>{" "}
                  {selectedLessonDetails.room}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
