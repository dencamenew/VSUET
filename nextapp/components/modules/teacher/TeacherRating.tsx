import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { translations } from "@/lib/translations"
import { useLanguage } from "@/hooks/useLanguage"
import { useMe } from "@/hooks/api/useMe"
import { ICheckpoints, useRatingTeacher, useRatingTeacherMark } from "@/hooks/api/useRating"
import { cn } from "@/lib/utils"

export default function TeacherRating({
  userName,
}: {
  userName: string
}) {
  const { lang } = useLanguage();
  const t = translations[lang] || translations.en;

  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);
  const [selectedSbj, setSelectedSbj] = useState<{
    lesson_name: string;
    lesson_type: string;
  } | undefined>(undefined);
  const [grades, setGrades] = useState<Record<string, ICheckpoints | { grade: string }>>({});
  const [focusedCell, setFocusedCell] = useState<string | null>(null);
  const [savingCells, setSavingCells] = useState<Set<string>>(new Set());

  const user = useMe();
  const markMutation = useRatingTeacherMark();

  const groups = useMemo(() => {
    return Object.keys(user?.groups_sbj || {});
  }, [user]);

  const subjects = useMemo(() => {
    if (!user || !selectedGroup) return [];
    return user.groups_sbj[selectedGroup] || [];
  }, [groups, user, selectedGroup]);

  const ratingData = useRatingTeacher(selectedGroup, selectedSbj?.lesson_name);

  const isTextGrading = useMemo(() => {
    if (!ratingData?.ratings || ratingData.ratings.length === 0) return false;
    return 'grade' in ratingData.ratings[0];
  }, [ratingData]);

  useEffect(() => {
    if (ratingData?.ratings) {
      const initialGrades: Record<string, ICheckpoints | { grade: string }> = {};
      ratingData.ratings.forEach((item) => {
        if ('grade' in item) {
          initialGrades[item.student_id] = { grade: item.grade };
        } else if ('rating' in item) {
          initialGrades[item.student_id] = { ...item.rating };
        }
      });
      setGrades(initialGrades);
    }
  }, [ratingData, isTextGrading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !/[0-9]/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "Tab" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "ArrowUp" &&
      e.key !== "ArrowDown" &&
      e.key !== "Enter"
    ) {
      e.preventDefault();
    }

    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const handleGradeChange = (studentId: string, field: keyof ICheckpoints, value: string) => {
    if (value === "" || /^\d+$/.test(value)) {
      const numValue = value === "" ? undefined : Number(value);

      if (numValue === undefined || (numValue >= 1 && numValue <= 100)) {
        setGrades((prev) => {
          const currentGrade = prev[studentId];
          if (currentGrade && 'kt1' in currentGrade) {
            return {
              ...prev,
              [studentId]: {
                ...currentGrade,
                [field]: numValue,
              },
            };
          }
          return prev;
        });
      }
    }
  };

  const handleTextGradeChange = async (studentId: string, value: string) => {
    const cellKey = `${studentId}-grade`;
    
    setGrades((prev) => ({
      ...prev,
      [studentId]: { grade: value },
    }));

    const student = ratingData?.ratings.find(r => r.student_id === studentId);
    const originalValue = student && 'grade' in student ? student.grade : undefined;

    if (value && value !== originalValue) {
      setSavingCells((prev) => new Set(prev).add(cellKey));

      try {
        await markMutation.mutateAsync({
          group_name: selectedGroup!,
          zach_number: studentId,
          subject_name: selectedSbj!.lesson_name,
          control_point: selectedSbj!.lesson_type,
          mark: value,
        });
      } catch (error) {
        console.error("Error saving grade:", error);
        setGrades((prev) => ({
          ...prev,
          [studentId]: { grade: originalValue || "" },
        }));
      } finally {
        setSavingCells((prev) => {
          const newSet = new Set(prev);
          newSet.delete(cellKey);
          return newSet;
        });
      }
    }
  };

  const handleBlur = async (studentId: string, checkpoint: keyof ICheckpoints) => {
    const cellKey = `${studentId}-${checkpoint}`;
    setFocusedCell(null);

    const currentGrade = grades[studentId];
    const newValue = currentGrade && 'kt1' in currentGrade ? currentGrade[checkpoint] : undefined;
    
    const student = ratingData?.ratings.find(r => r.student_id === studentId);
    const originalValue = student && 'rating' in student ? student.rating[checkpoint] : undefined;

    if (newValue !== undefined && newValue !== originalValue) {
      setSavingCells((prev) => new Set(prev).add(cellKey));

      try {
        await markMutation.mutateAsync({
          group_name: selectedGroup!,
          zach_number: studentId,
          subject_name: selectedSbj!.lesson_name,
          control_point: checkpoint,
          mark: newValue,
        });
      } catch (error) {
        console.error("Error saving grade:", error);
        if (currentGrade && 'kt1' in currentGrade) {
          setGrades((prev) => ({
            ...prev,
            [studentId]: {
              ...currentGrade,
              [checkpoint]: originalValue,
            },
          }));
        }
      } finally {
        setSavingCells((prev) => {
          const newSet = new Set(prev);
          newSet.delete(cellKey);
          return newSet;
        });
      }
    }
  };

  const checkpoints: (keyof ICheckpoints)[] = ["kt1", "kt2", "kt3", "kt4", "kt5"];
  const textGradeOptions = ["Неудовлетворительно", "Удовлетворительно", "Хорошо", "Отлично"];

  const selectedSbjValue = useMemo(() => 
    selectedSbj ? JSON.stringify(selectedSbj) : "", 
    [selectedSbj]
  );

  return (
    <div className="h-full bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between py-4 pt-12 px-6">
        <div>
          <h1 className="text-2xl font-bold">{t.rating}</h1>
          <p className="text-muted-foreground md:hidden">{userName}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 px-6 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t.group}</label>
            <Select
              value={selectedGroup || ""}
              onChange={(e) => {
                setSelectedGroup(e.target.value || undefined);
                setSelectedSbj(undefined);
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
              value={selectedSbjValue}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedSbj(value ? JSON.parse(value) : undefined);
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

      {/* Grades Table */}
      {ratingData && ratingData.ratings.length > 0 ? (
        <div className="flex-1 px-6 pb-4 overflow-hidden min-h-0">
          <div className="bg-card border border-border rounded-xl h-full flex flex-col overflow-hidden">
            <div className="flex-shrink-0 p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                {ratingData.subject_name} - {ratingData.group_name}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {isTextGrading
                  ? "Выберите оценку из списка. Изменения сохраняются автоматически"
                  : "Нажмите на оценку для изменения. Изменения сохраняются автоматически"}
              </p>
            </div>

            <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 font-medium text-foreground sticky left-0 top-0 bg-muted z-30 text-center">
                      {t.student}
                    </th>
                    {isTextGrading ? (
                      <th className="text-center p-3 font-medium text-foreground sticky top-0 bg-muted z-20">
                        {t.grade || "Оценка"}
                      </th>
                    ) : (
                      checkpoints.map((checkpoint, index) => (
                        <th
                          key={checkpoint}
                          className="text-center p-3 font-medium text-foreground sticky top-0 bg-muted z-20"
                        >
                          {t.checkpoint} {index + 1}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {ratingData.ratings.map((student, index) => {
                    const currentGrade = grades[student.student_id];
                    const isTextStudent = 'grade' in student;

                    return (
                      <tr key={student.student_id} className={index % 2 === 0 ? "bg-background" : "bg-muted"}>
                        <td
                          className={cn(
                            "p-3 font-medium text-foreground sticky left-0 text-center",
                            index % 2 === 0 ? "bg-background" : "bg-muted"
                          )}
                        >
                          {student.student_id}
                        </td>

                        {isTextGrading && isTextStudent ? (
                          <td className="p-3">
                            <div className="w-full flex justify-center">
                              <Select
                                value={(currentGrade && 'grade' in currentGrade) ? currentGrade.grade : ""}
                                onChange={(e) => handleTextGradeChange(student.student_id, e.target.value)}
                                disabled={savingCells.has(`${student.student_id}-grade`)}
                                className={cn(
                                  "w-48 text-xs transition-all border-primary/30",
                                  savingCells.has(`${student.student_id}-grade`) && "opacity-50 cursor-wait"
                                )}
                              >
                                <option value="">Не выбрано</option>
                                {textGradeOptions.map((grade) => (
                                  <option key={grade} value={grade}>
                                    {grade}
                                  </option>
                                ))}
                              </Select>
                            </div>
                          </td>
                        ) : (
                          checkpoints.map((checkpoint) => {
                            const cellKey = `${student.student_id}-${checkpoint}`;
                            const isFocused = focusedCell === cellKey;
                            const isSaving = savingCells.has(cellKey);
                            const checkpointValue = currentGrade && 'kt1' in currentGrade ? currentGrade[checkpoint] : undefined;

                            return (
                              <td key={checkpoint} className="p-3">
                                <div className="w-full flex justify-center">
                                  <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={checkpointValue ?? ""}
                                    onChange={(e) =>
                                      handleGradeChange(student.student_id, checkpoint, e.target.value)
                                    }
                                    onFocus={() => setFocusedCell(cellKey)}
                                    onBlur={() => handleBlur(student.student_id, checkpoint)}
                                    onKeyDown={handleKeyDown}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    disabled={isSaving}
                                    className={cn(
                                      "w-16 text-center text-xs transition-all border border-primary/30",
                                      isFocused
                                        ? "bg-primary/10 border-primary border-2 ring-2 ring-primary/20 font-semibold"
                                        : "bg-transparent font-medium hover:bg-muted/50",
                                      isSaving && "opacity-50 cursor-wait"
                                    )}
                                  />
                                </div>
                              </td>
                            );
                          })
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xl font-semibold text-foreground/40">
          {t.selectGroupAndSubject || "Выберите группу и предмет"}
        </div>
      )}
    </div>
  );
}
