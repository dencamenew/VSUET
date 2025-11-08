import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { translations, type Language } from "@/lib/translations"
import { mockFaculties, mockGroups, mockSubjects, mockStudents, mockGrades, type Grade } from "@/data/mockData"
import BottomNavigation from "@/components/navigation/Navigation"

interface TeacherRatingPageProps {
  teacherName: string
  onNavigate: (page: "schedule" | "rating" | "attendance") => void
  onShowProfile: () => void
  language: Language
}

export default function TeacherRatingPage({
  teacherName,
  onNavigate,
  onShowProfile,
  language,
}: TeacherRatingPageProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [grades, setGrades] = useState<Record<string, Grade>>({})
  const [loading, setLoading] = useState(false)

  const t = translations[language] || translations.en

  const studentsInGroup = mockStudents.filter((student) => student.groupId === selectedGroup)
  const selectedSubjectData = mockSubjects.find((subject) => subject.id === selectedSubject)

  // Функция для блокировки нечисловых символов
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Разрешаем: цифры, Backspace, Delete, Tab, стрелки
    if (
      !/[0-9]/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "ArrowUp" &&
      e.key !== "ArrowDown"
    ) {
      e.preventDefault()
    }
  }

  useEffect(() => {
    // Load existing grades when subject changes
    if (selectedSubject && studentsInGroup.length > 0) {
      const existingGrades: Record<string, Grade> = {}
      studentsInGroup.forEach((student) => {
        const existingGrade = mockGrades.find((g) => g.studentId === student.id && g.subjectId === selectedSubject)
        if (existingGrade) {
          existingGrades[student.id] = existingGrade
        } else {
          existingGrades[student.id] = {
            studentId: student.id,
            subjectId: selectedSubject,
          }
        }
      })
      setGrades(existingGrades)
    }
  }, [selectedSubject, selectedGroup])

  const handleGradeChange = (studentId: string, field: keyof Grade, value: string) => {
    // Разрешаем только цифры и пустую строку
    if (value === "" || /^\d+$/.test(value)) {
      const numValue = value === "" ? undefined : Number(value)

      // Проверяем диапазон только если значение не пустое
      if (numValue === undefined || (numValue >= 1 && numValue <= 100)) {
        setGrades((prev) => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [field]: numValue,
          },
        }))
      }
    }
  }

  const handleSaveGrades = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Saving grades:", grades)
      alert(t.gradesSaved)
    } catch (error) {
      console.error("Error saving grades:", error)
    } finally {
      setLoading(false)
    }
  }

  const canSave = selectedGroup && selectedSubject && studentsInGroup.length > 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div>
          <h1 className="text-2xl font-bold">{t.rating}</h1>
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
              {mockGroups.map((group) => {
                const faculty = mockFaculties.find(f => f.id === group.facultyId);
                return (
                  <option key={group.id} value={group.id}>
                    {group.name} {faculty ? `(${faculty.name})` : ''}
                  </option>
                )
              })}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t.subject}</label>
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
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

      {/* Grades Table */}
      <div className="px-4 pb-20">
        {selectedSubject && studentsInGroup.length > 0 ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {selectedSubjectData?.name} - {mockGroups.find((g) => g.id === selectedGroup)?.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedSubjectData?.type === "exam" ? t.checkpoint : t.practicalWork}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-foreground">{t.student}</th>
                    {selectedSubjectData?.type === "exam" ? (
                      <>
                        <th className="text-center p-3 font-medium text-foreground">{t.checkpoint} 1</th>
                        <th className="text-center p-3 font-medium text-foreground">{t.checkpoint} 2</th>
                        <th className="text-center p-3 font-medium text-foreground">{t.checkpoint} 3</th>
                        <th className="text-center p-3 font-medium text-foreground">{t.checkpoint} 4</th>
                        <th className="text-center p-3 font-medium text-foreground">{t.checkpoint} 5</th>
                        <th className="text-center p-3 font-medium text-foreground">{t.finalGrade}</th>
                      </>
                    ) : (
                      <th className="text-center p-3 font-medium text-foreground">{t.grade}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {studentsInGroup.map((student, index) => (
                    <tr key={student.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="p-3 font-medium text-foreground">{student.name}</td>
                      {selectedSubjectData?.type === "exam" ? (
                        <>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={grades[student.id]?.checkpoint1 || ""}
                              onChange={(e) => handleGradeChange(student.id, "checkpoint1", e.target.value)}
                              onKeyDown={handleKeyDown}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="w-16 text-center bg-background border-border text-foreground focus:border-primary focus:ring-primary/20"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={grades[student.id]?.checkpoint2 || ""}
                              onChange={(e) => handleGradeChange(student.id, "checkpoint2", e.target.value)}
                              onKeyDown={handleKeyDown}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="w-16 text-center bg-background border-border text-foreground focus:border-primary focus:ring-primary/20"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={grades[student.id]?.checkpoint3 || ""}
                              onChange={(e) => handleGradeChange(student.id, "checkpoint3", e.target.value)}
                              onKeyDown={handleKeyDown}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="w-16 text-center bg-background border-border text-foreground focus:border-primary focus:ring-primary/20"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={grades[student.id]?.checkpoint4 || ""}
                              onChange={(e) => handleGradeChange(student.id, "checkpoint4", e.target.value)}
                              onKeyDown={handleKeyDown}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="w-16 text-center bg-background border-border text-foreground focus:border-primary focus:ring-primary/20"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={grades[student.id]?.checkpoint5 || ""}
                              onChange={(e) => handleGradeChange(student.id, "checkpoint5", e.target.value)}
                              onKeyDown={handleKeyDown}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="w-16 text-center bg-background border-border text-foreground focus:border-primary focus:ring-primary/20"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={grades[student.id]?.finalGrade || ""}
                              onChange={(e) => handleGradeChange(student.id, "finalGrade", e.target.value)}
                              onKeyDown={handleKeyDown}
                              onWheel={(e) => e.currentTarget.blur()}
                              className="w-16 text-center bg-background border-border text-foreground focus:border-primary focus:ring-primary/20"
                            />
                          </td>
                        </>
                      ) : (
                        <td className="p-3">
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            value={grades[student.id]?.practicalGrade || ""}
                            onChange={(e) => handleGradeChange(student.id, "practicalGrade", e.target.value)}
                            onKeyDown={handleKeyDown}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="w-16 text-center bg-background border-border text-foreground focus:border-primary focus:ring-primary/20"
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-lg">
              {language === "ru" ? "Выберите группу и предмет" : "Select group and subject"}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        onNavigate={onNavigate}
        onShowProfile={onShowProfile}
        language={language}
        currentPage="rating"
      />
    </div>
  )
}