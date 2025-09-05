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

    qrScanSuccess: "QR-код успешно отсканирован",
    qrScannerError: "Не удалось инициализировать сканер QR-кодов",

    studentNotFound: "Студент с таким номером зачётки не найден",
    connectionError: "Ошибка соединения с сервером",

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

    selectDate: "Select date",
    loading: "Loading...",
    other: "Other",

    // Rating page
    rating: "Рейтинг",
    grades: "Оценки",
    controlPoints: "Контрольные точки",
    totalScore: "Общий балл",

    // Navigation
    back: "Назад",

    loadingSchedule: "Загрузка расписания...",

    gradesLabel: "Оценки",
    gradeUpdated: "Оценка обновлена",
    attendanceUpdated: "Посещаемость обновлена",
    present: "Присутствовал",
    absent: "Отсутствовал",
    late: "Опоздал",
    synced: "Синхронизировано",
    connecting: "Подключение...",
    offline: "Оффлайн",
    updating: "Обновление...",
    scheduleUpdated: "Расписание обновлено",
    scheduleLoadError: "Ошибка загрузки расписания",

    // Добавьте в объект ru:
    qrCameraError: "Ошибка доступа к камере",
    scanQRCode: "Сканировать QR-код",
    cancel: "Отмена",
    simulateScan: "Симулировать сканирование",
    attendanceMarked: "Посещение отмечено",
    attendanceError: "Ошибка при отметке посещения",
    invalidQRCode: "Неверный QR-код",

    cameraAccessError: "Ошибка доступа к камере",
    noCamera: "Камера не найдена",
    scanning: "Сканирование...",
    pointCamera: "Наведите камеру на QR-код",
    retry: "Повторить",
    teacherComment: "Комментарий преподавателя",
    showMore: "Показать больше",
    close: "Закрыть",

  },
  en: {

    scanQRCode: "Scan QR Code",
    teacherComment: "Teacher's comment",
    showMore: "Show more",
    close: "Close",
    cancel: "Cancel",
    retry: "Retry",
    attendanceMarked: "Attendance marked",
    attendanceError: "Error marking attendance",
    invalidQRCode: "Invalid QR code",
    qrScannerError: "QR scanner initialization error",
    cameraAccessError: "Camera access error",
    noCamera: "Camera not found",
    scanning: "Scanning...",
    pointCamera: "Point camera at QR code",
  
    qrScanSuccess: "QR code scanned successfully",


    qrCameraError: "Camera access error",
    simulateScan: "Simulate scan",
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

    selectDate: "Выберите дату",
    loading: "Загрузка...",
    other: "Другое",

    loadingSchedule: "Loading schedule...",

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

    gradesLabel: "Grades",
    gradeUpdated: "Grade updated",
    attendanceUpdated: "Attendance updated",
    present: "Present",
    absent: "Absent",
    late: "Late",
    synced: "Synced",
    connecting: "Connecting...",
    offline: "Offline",
    updating: "Updating...",
    scheduleUpdated: "Schedule updated",
    scheduleLoadError: "Error loading schedule",

    studentNotFound: "Student with this ID not found",
    connectionError: "Connection error"
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.ru
