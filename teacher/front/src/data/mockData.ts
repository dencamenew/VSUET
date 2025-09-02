export interface Faculty {
  id: string
  name: string
}

export interface Group {
  id: string
  name: string
  facultyId: string
}

export interface Subject {
  id: string
  name: string
  type: "exam" | "practical"
}

export interface Student {
  id: string
  name: string
  groupId: string
}

export interface Lesson {
  id: string
  time: string
  endTime: string
  subject: string
  room: string
  group: string
  type: "lecture" | "practice" | "lab" | "other"
  weekType: "Числитель" | "Знаменатель"
}

export interface Grade {
  studentId: string
  subjectId: string
  checkpoint1?: number
  checkpoint2?: number
  checkpoint3?: number
  checkpoint4?: number
  checkpoint5?: number
  finalGrade?: number
  practicalGrade?: number
}

export interface Attendance {
  studentId: string
  subjectId: string
  date: string
  status: "present" | "absent" | "late"
}

// Mock data
export const mockFaculties: Faculty[] = [
  { id: "1", name: "Факультет информационных технологий" },
  { id: "2", name: "Экономический факультет" },
  { id: "3", name: "Юридический факультет" },
]

export const mockGroups: Group[] = [
  { id: "1", name: "ИТ-21-1", facultyId: "1" },
  { id: "2", name: "ИТ-21-2", facultyId: "1" },
  { id: "3", name: "ИТ-22-1", facultyId: "1" },
  { id: "4", name: "ЭК-21-1", facultyId: "2" },
  { id: "5", name: "ЭК-21-2", facultyId: "2" },
  { id: "6", name: "ЮР-21-1", facultyId: "3" },
]

export const mockSubjects: Subject[] = [
  { id: "1", name: "Программирование", type: "exam" },
  { id: "2", name: "Базы данных", type: "exam" },
  { id: "3", name: "Веб-разработка", type: "practical" },
  { id: "4", name: "Алгоритмы и структуры данных", type: "exam" },
  { id: "5", name: "Математический анализ", type: "exam" },
]

export const mockStudents: Student[] = [
  { id: "1", name: "Иванов Иван Иванович", groupId: "1" },
  { id: "2", name: "Петров Петр Петрович", groupId: "1" },
  { id: "3", name: "Сидоров Сидор Сидорович", groupId: "1" },
  { id: "4", name: "Козлова Анна Сергеевна", groupId: "1" },
  { id: "5", name: "Морозов Алексей Владимирович", groupId: "1" },
  { id: "6", name: "Волкова Елена Николаевна", groupId: "2" },
  { id: "7", name: "Соколов Дмитрий Александрович", groupId: "2" },
]

// Generate schedule for current week
export const generateMockSchedule = (): Record<string, Lesson[]> => {
  const schedule: Record<string, Lesson[]> = {}
  const today = new Date()
  
  // Generate schedule for 7 days starting from today
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateKey = date.toISOString().split('T')[0]
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    const lessons: Lesson[] = [
      {
        id: `${dateKey}-1`,
        time: "09:00",
        endTime: "10:30",
        subject: "Программирование",
        room: "ауд. 301",
        group: "ИТ-21-1",
        type: "lecture",
        weekType: "Числитель"
      },
      {
        id: `${dateKey}-2`,
        time: "10:45",
        endTime: "12:15",
        subject: "Базы данных",
        room: "ауд. 205",
        group: "ИТ-21-2",
        type: "practice",
        weekType: "Числитель"
      },
      {
        id: `${dateKey}-3`,
        time: "13:00",
        endTime: "14:30",
        subject: "Веб-разработка",
        room: "ауд. 401",
        group: "ИТ-22-1",
        type: "lab",
        weekType: "Знаменатель"
      }
    ]
    
    schedule[dateKey] = lessons
  }
  
  return schedule
}

export const mockGrades: Grade[] = [
  {
    studentId: "1",
    subjectId: "1",
    checkpoint1: 4,
    checkpoint2: 5,
    checkpoint3: 4,
    checkpoint4: 5,
    checkpoint5: 4,
    finalGrade: 4
  },
  {
    studentId: "2",
    subjectId: "1",
    checkpoint1: 3,
    checkpoint2: 4,
    checkpoint3: 3,
    checkpoint4: 4,
    checkpoint5: 3,
    finalGrade: 3
  },
  {
    studentId: "3",
    subjectId: "3",
    practicalGrade: 5
  }
]

export const mockAttendance: Attendance[] = [
  {
    studentId: "1",
    subjectId: "1",
    date: "2025-01-15",
    status: "present"
  },
  {
    studentId: "2",
    subjectId: "1",
    date: "2025-01-15",
    status: "late"
  },
  {
    studentId: "3",
    subjectId: "1",
    date: "2025-01-15",
    status: "absent"
  }
]