export type Language = "ru" | "en"

export const translations = {
  ru: {
    // Auth
    welcome: "Добро пожаловать",
    enterCredentials: "Введите ваши данные для входа",
    fullNamePlaceholder: "ФИО преподавателя",
    passwordPlaceholder: "Пароль",
    login: "Войти",
    invalidCredentials: "Неверные данные для входа",
    connectionError: "Ошибка подключения",

    // Navigation
    schedule: "Расписание",
    rating: "Оценки",
    attendance: "Посещаемость",
    profile: "Профиль",
    teacher: "Преподаватель",
    student: "Студент",
    admin: "Администратор",

    // Schedule
    selectDate: "Выберите дату",
    loadingSchedule: "Загрузка расписания...",
    noClasses: "Нет занятий на выбранную дату",
    timeLabel: "Время",
    roomLabel: "Аудитория",
    groupLabel: "Группа",
    lecture: "Лекция",
    practice: "Практика",
    lab: "Лабораторная",
    seminar: "Семинар",
    other: "Другое",
    addComment: "Добавить комментарий",
    commentPlaceholder: "Введите комментарий к занятию...",
    commentAdded: "Комментарий добавлен",
    back: "Назад",
    send: "Отправить",

    // Rating
    faculty: "Факультет",
    group: "Группа",
    subject: "Предмет",
    selectFaculty: "Выберите факультет",
    selectGroup: "Выберите группу",
    selectSubject: "Выберите предмет",
    checkpoint: "Контрольная точка",
    finalGrade: "Итоговая оценка",
    practicalWork: "Практическая работа",
    grade: "Оценка",
    saveGrades: "Сохранить оценки",
    gradesSaved: "Оценки сохранены",
    selectGroupAndSubject: "Выберите группу и предмет",

    // Attendance
    saveAttendance: "Сохранить посещаемость",
    attendanceSaved: "Посещаемость сохранена",
    present: "Присутствует",
    absent: "Отсутствует",
    late: "Опоздал",
    choice: "Выберите предмет",

    // Profile
    accountInfo: "Информация об аккаунте",
    teacherName: "Имя преподавателя",
    settings: "Настройки",
    darkTheme: "Темная тема",
    lightTheme: "Светлая тема",
    language: "Язык",
    logout: "Выйти",


    // Добавленные ключи
    comment: "Комментарий",
    close: "Закрыть",

    numerator: "Числитель",
    denominator: "Знаменатель",
    week: "Неделя"
  },
  en: {
    // Auth
    welcome: "Welcome",
    enterCredentials: "Enter your credentials to login",
    fullNamePlaceholder: "Teacher Full Name",
    passwordPlaceholder: "Password",
    login: "Login",
    invalidCredentials: "Invalid credentials",
    connectionError: "Connection error",

    numerator: "Numerator",
    denominator: "Denominator",
    week: "Week",
    // Navigation
    schedule: "Schedule",
    rating: "Grades",
    attendance: "Attendance",
    profile: "Profile",
    teacher: "Teacher",
    student: "Student",
    admin: "Admin",

    // Schedule
    selectDate: "Select date",
    loadingSchedule: "Loading schedule...",
    noClasses: "No classes for selected date",
    timeLabel: "Time",
    roomLabel: "Room",
    groupLabel: "Group",
    lecture: "Lecture",
    practice: "Practice",
    lab: "Lab",
    seminar: "Seminar",
    other: "Other",
    addComment: "Add comment",
    commentPlaceholder: "Enter comment for the lesson...",
    commentAdded: "Comment added",
    back: "Back",
    send: "Send",

    // Rating
    faculty: "Faculty",
    group: "Group",
    subject: "Subject",
    selectFaculty: "Select faculty",
    selectGroup: "Select group",
    selectSubject: "Select subject",
    checkpoint: "Checkpoint",
    finalGrade: "Final Grade",
    practicalWork: "Practical Work",
    grade: "Grade",
    saveGrades: "Save Grades",
    gradesSaved: "Grades saved",
    selectGroupAndSubject: "Select group and subject",

    // Attendance
    saveAttendance: "Save Attendance",
    attendanceSaved: "Attendance saved",
    present: "Present",
    absent: "Absent",
    late: "Late",
    choice: "Select subject",

    // Profile
    accountInfo: "Account Information",
    teacherName: "Teacher Name",
    settings: "Settings",
    darkTheme: "Dark Theme",
    lightTheme: "Light Theme",
    language: "Language",
    logout: "Logout",


    // Добавленные ключи
    comment: "Comment",
    close: "Close",
  },
}
