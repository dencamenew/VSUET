export const translations = {
  ru: {
    // Auth page
    welcome: "Добро пожаловать",
    enterStudentId: "Введите номер зачетки",
    studentIdPlaceholder: "Номер зачетки",
    login: "Войти",

    // Schedule page
    schedule: "Расписание",
    noClasses: "Нет занятий",

    // Class card labels
    timeLabel: "ВРЕМЯ ПРОВЕДЕНИЯ",
    roomLabel: "АУДИТОРИЯ",
    teacherLabel: "ПРЕПОДАВАТЕЛЬ",

    // Class types
    lecture: "Лекция",
    practice: "Практика",
    lab: "Лабораторная работа",

    // Days of week
    mon: "Пн",
    tue: "Вт",
    wed: "Ср",
    thu: "Чт",
    fri: "Пт",
    sat: "Сб",
    sun: "Вс",

    // Months
    january: "Январь",
    february: "Февраль",
    march: "Март",
    april: "Апрель",
    may: "Май",
    june: "Июнь",
    july: "Июль",
    august: "Август",
    september: "Сентябрь",
    october: "Октябрь",
    november: "Ноябрь",
    december: "Декабрь",

    // Rating page
    rating: "Рейтинг",
    grades: "Оценки",
    controlPoints: "Контрольные точки",
    totalScore: "Общий балл",

    // Navigation
    back: "Назад",
  },
  en: {
    // Auth page
    welcome: "Welcome",
    enterStudentId: "Enter student ID",
    studentIdPlaceholder: "Student ID",
    login: "Login",

    // Schedule page
    schedule: "Schedule",
    noClasses: "No classes",

    // Class card labels
    timeLabel: "TIME",
    roomLabel: "ROOM",
    teacherLabel: "TEACHER",

    // Class types
    lecture: "Lecture",
    practice: "Practice",
    lab: "Laboratory work",

    // Days of week
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",

    // Months
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",

    // Rating page
    rating: "Rating",
    grades: "Grades",
    controlPoints: "Control Points",
    totalScore: "Total Score",

    // Navigation
    back: "Back",
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.ru
