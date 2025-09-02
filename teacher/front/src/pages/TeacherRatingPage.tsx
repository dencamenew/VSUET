import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, User, GraduationCap, Users, Save } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { mockFaculties, mockGroups, mockSubjects, mockStudents, mockGrades, type Faculty, type Group, type Subject, type Student, type Grade } from "@/data/mockData"

interface TeacherRatingPageProps {
  teacherName: string
  onNavigate: (page: "schedule" | "rating" | "attendance") => void
  onShowProfile: () => void
  language: Language
}

export default function TeacherRatingPage({ teacherName, onNavigate, onShowProfile, language }: TeacherRatingPageProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<string>("")
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [grades, setGrades] = useState<Record<string, Grade>>({})
  const [loading, setLoading] = useState(false)

  const t = translations[language] || translations.en

  const availableGroups = mockGroups.filter(group => group.facultyId === selectedFaculty)
  const studentsInGroup = mockStudents.filter(student => student.groupId === selectedGroup)
  const selectedSubjectData = mockSubjects.find(subject => subject.id === selectedSubject)

  useEffect(() => {
    // Load existing grades when subject changes
    if (selectedSubject && studentsInGroup.length > 0) {
      const existingGrades: Record<string, Grade> = {}
      studentsInGroup.forEach(student => {
        const existingGrade = mockGrades.find(g => g.studentId === student.id && g.subjectId === selectedSubject)
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
    const numValue = value === "" ? undefined : Number(value)
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numValue
      }
    }))
  }

  const handleSaveGrades = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Saving grades:", grades)
      alert(t.gradesSaved)
    } catch (error) {
      console.error("Error saving grades:", error)
    } finally {
      setLoading(false)
    }
  }

  const canSave = selectedFaculty && selectedGroup && selectedSubject && studentsInGroup.length > 0

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>

      {/* Grades Table */}
      <div className="px-4 pb-20">
        {selectedSubject && studentsInGroup.length > 0 ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {selectedSubjectData?.name} - {mockGroups.find(g => g.id === selectedGroup)?.name}
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
                              min="2"
                              max="5"
                              value={grades[student.id]?.checkpoint1 || ""}
                              onChange={(e) => handleGradeChange(student.id, "checkpoint1", e.target.value)}
                              className="w-16 text-center"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="2"
                              max="5"
                              value={grades[student.id]?.checkpoint2 || ""}
                              onChange={(e) => handleGradeChange(student.id, "checkpoint2", e.target.value)}
                              className="w-16 text-center"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="2"
                              max="5"
                              value={grades[student.id]?.checkpoint3 || ""}
                              onChange={(e) => handleGradeChange(student.id, "checkpoint3", e.target.value)}
                              className="w-16 text-center"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="2"
                              max="5"
                              value={grades[student.id]?.checkpoint4 || ""}
                              onChange={(e) => handleGradeChange(student.id, "checkpoint4", e.target.value)}
                              className="w-16 text-center"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="2"
                              max="5"
                              value={grades[student.id]?.checkpoint5 || ""}
                              onChange={(e) => handleGradeChange(student.id, "checkpoint5", e.target.value)}
                              className="w-16 text-center"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="2"
                              max="5"
                              value={grades[student.id]?.finalGrade || ""}
                              onChange={(e) => handleGradeChange(student.id, "finalGrade", e.target.value)}
                              className="w-16 text-center font-bold"
                            />
                          </td>
                        </>
                      ) : (
                        <td className="p-3">
                          <Input
                            type="number"
                            min="2"
                            max="5"
                            value={grades[student.id]?.practicalGrade || ""}
                            onChange={(e) => handleGradeChange(student.id, "practicalGrade", e.target.value)}
                            className="w-16 text-center"
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {canSave && (
              <div className="p-4 border-t border-border">
                <Button
                  onClick={handleSaveGrades}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? `${t.saveGrades}...` : t.saveGrades}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground text-lg">
              {language === "ru" ? "Выберите факультет, группу и предмет" : "Select faculty, group and subject"}
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
            className="text-foreground hover:bg-muted"
            onClick={() => onNavigate("rating")}
          >
            <GraduationCap className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-muted"
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