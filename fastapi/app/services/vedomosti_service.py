# app/services/vedomosti_service.py
import logging
import traceback
import json
from datetime import datetime, date
from reportlab.lib.pagesizes import A4, portrait
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import cm
import os
from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import io
from fastapi.responses import Response

from app.services.attendance_service import AttendanceService
from app.services.rating_service import RatingService
from app.repositories.student_info_repository import StudentInfoRepository
from app.repositories.groups_repository import GroupsRepository

logger = logging.getLogger(__name__)

class VedomostiService:
    def __init__(self, db: Session):
        self.db = db
        self.attendance_service = AttendanceService(db)
        self.rating_service = RatingService(db)
        
        # === НАСТРОЙКИ ШРИФТА ===
        font_path_candidates = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/local/share/fonts/DejaVuSans.ttf",
            "C:/Windows/Fonts/DejaVuSans.ttf",
            "DejaVuSans.ttf",
        ]
        self.font_path = next((p for p in font_path_candidates if os.path.exists(p)), None)
        if not self.font_path:
            raise FileNotFoundError("⚠️ Не найден шрифт DejaVuSans.ttf — установите его или поместите рядом со скриптом.")
        
        pdfmetrics.registerFont(TTFont("DejaVuSans", self.font_path))

    def _setup_document(self):
        """Настройка базового документа в памяти"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=portrait(A4),
            leftMargin=2 * cm,
            rightMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm,
        )
        
        styles = getSampleStyleSheet()
        styles["Normal"].fontName = "DejaVuSans"

        style_header = ParagraphStyle(
            "header",
            fontName="DejaVuSans",
            fontSize=12,
            leading=14,
            alignment=1,  # CENTER
        )

        return doc, styles, style_header, buffer

    def _create_footer(self, styles):
        """Создание подвала документа"""
        date_str = datetime.now().strftime("%d.%m.%Y")
        
        footer_table = Table(
            [
                [
                    f"Дата: {date_str}", 
                    "Ответственный преподаватель: _____________________________ __________"
                ],
                ["", "                                        (ФИО)                   (Подпись)"]
            ],
            colWidths=[8*cm, 10*cm],
            hAlign='LEFT'
        )

        footer_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, -1), "DejaVuSans"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ALIGN", (0, 0), (0, 0), "LEFT"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        
        return footer_table

    async def generate_attendance_report(
        self, 
        teacher_max_id: str,
        group_name: str, 
        subject_type: str, 
        subject_name: str
    ) -> Response:
        """Генерация отчёта по посещаемости с реальными данными"""
        try:
            logger.info(f"Начало генерации отчета посещаемости для группы {group_name}, предмет: {subject_name}, тип: {subject_type}")
            
            # Получаем реальные данные через AttendanceService
            logger.info(f"Вызов attendance_service.get_teacher_attendance...")
            data = self.attendance_service.get_teacher_attendance(
                max_id=teacher_max_id,
                group_name=group_name,
                subject_type=subject_type,
                subject_name=subject_name
            )
            
            logger.info(f"Получены данные от AttendanceService: {data is not None}")
            
            # Проверяем, что данные не None и имеют правильную структуру
            if data is None:
                logger.error("AttendanceService вернул None")
                raise HTTPException(
                    status_code=404, 
                    detail="Данные о посещаемости не найдены"
                )
            
            # Проверяем структуру данных (аналогично RatingService)
            if not hasattr(data, 'attendance_json') and not isinstance(data, dict):
                logger.error(f"Неправильная структура данных: {type(data)}")
                raise HTTPException(
                    status_code=500, 
                    detail="Неправильная структура данных о посещаемости"
                )
            
            # Создаем PDF в памяти
            doc, styles, style_header, buffer = self._setup_document()
            elements = []

            # === ТИТУЛЬНАЯ ЧАСТЬ ===
            university_name = """ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ<br/>
            ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ ВЫСШЕГО ОБРАЗОВАНИЯ<br/>
            «ВОРОНЕЖСКИЙ ГОСУДАРСТВЕННЫЙ УНИВЕРСИТЕТ<br/>
            ИНЖЕНЕРНЫХ ТЕХНОЛОГИЙ»"""
            elements.append(Paragraph(university_name, style_header))
            elements.append(Spacer(1, 12))

            faculty = "Факультет УИТС"
            elements.append(Paragraph(faculty, style_header))
            elements.append(Spacer(1, 6))

            # Получаем данные из объекта (аналогично RatingService)
            if isinstance(data, dict):
                actual_group_name = data.get('group_name', group_name)
                actual_subject_name = data.get('subject_name', subject_name)
                attendance_json = data.get("attendance_json", [])
            else:
                # Если это объект модели
                actual_group_name = getattr(data, 'group_name', group_name)
                actual_subject_name = getattr(data, 'subject_name', subject_name)
                attendance_json = getattr(data, 'attendance_json', [])
            
            group_info = f"Группа: {actual_group_name}"
            elements.append(Paragraph(group_info, style_header))
            elements.append(Spacer(1, 12))

            title = f"Ведомость посещаемости по предмету «{actual_subject_name}»"
            elements.append(Paragraph(title, style_header))
            elements.append(Spacer(1, 20))

            # === ТАБЛИЦА ПОСЕЩАЕМОСТИ ===
            table_data = [["№ зачётки", "Всего пар", "Посещено", "Процент пропусков"]]

            # Обрабатываем данные как в оригинальном скрипте
            if not attendance_json:
                logger.warning("Нет данных attendance_json для отображения")
                table_data.append(["Нет данных", "—", "—", "—"])
            else:
                logger.info(f"Обработка {len(attendance_json)} записей посещаемости")
                
                for entry in attendance_json:
                    if not isinstance(entry, dict):
                        logger.warning(f"Пропуск некорректной записи: {type(entry)}")
                        continue
                        
                    attendance = entry.get("attendance", {})
                    student_id = entry.get("student_id", "—")
                    
                    # Отбираем только даты с 1 сентября по текущую дату
                    filtered_dates = []
                    for date_str in attendance.keys():
                        try:
                            date_obj = datetime.fromisoformat(date_str).date()
                            # Фильтруем только прошедшие даты
                            if date_obj <= date.today():
                                filtered_dates.append(date_str)
                        except ValueError:
                            # Пропускаем некорректные даты
                            logger.warning(f"Некорректная дата: {date_str}")
                            continue
                    
                    total = len(filtered_dates)
                    attended = sum(1 for d in filtered_dates if attendance.get(d) is True)
                    missed = total - attended
                    percent_missed = round((missed / total * 100) if total else 0, 2)

                    table_data.append([
                        student_id,
                        total,
                        attended,
                        f"{percent_missed} %",
                    ])
                    
                    logger.debug(f"Студент {student_id}: всего {total}, посещено {attended}, пропущено {percent_missed}%")

            logger.info(f"Сформирована таблица с {len(table_data)-1} студентами")

            # Создаем таблицу
            table = Table(table_data, repeatRows=1)
            table.setStyle(TableStyle([
                ("FONTNAME", (0, 0), (-1, -1), "DejaVuSans"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ]))

            elements.append(table)
            elements.append(Spacer(1, 80))

            # === ПОДВАЛ ===
            elements.append(self._create_footer(styles))

            # === СОЗДАНИЕ PDF ===
            logger.info("Создание PDF документа...")
            doc.build(elements)
            buffer.seek(0)
            logger.info("PDF успешно создан")

            safe_filename = f"attendance.pdf"
            
            return Response(
                content=buffer.getvalue(),
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename={safe_filename}"
                }
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Критическая ошибка при генерации отчёта посещаемости: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Ошибка генерации отчёта посещаемости: {str(e)}")

    async def generate_rating_report(
        self, 
        group_name: str, 
        subject_name: str
    ) -> Response:
        """Генерация ведомости рейтинга с реальными данными"""
        try:
            logger.info(f"Генерация ведомости рейтинга для группы {group_name}, предмет: {subject_name}")
            
            # Получаем реальные данные через RatingService
            data = self.rating_service.get_group_rating(group_name, subject_name)
            logger.info(f"Получены данные от RatingService: {data is not None}")

            if data is None:
                logger.error("RatingService вернул None")
                raise HTTPException(
                    status_code=404, 
                    detail="Данные о рейтинге не найдены"
                )

            # Создаем PDF в памяти
            doc, styles, style_header, buffer = self._setup_document()
            elements = []

            # === ТИТУЛЬНАЯ ЧАСТЬ ===
            ministry = "МИНИСТЕРСТВО НАУКИ И ВЫСШЕГО ОБРАЗОВАНИЯ<br/>РОССИЙСКОЙ ФЕДЕРАЦИИ"
            elements.append(Paragraph(ministry, style_header))
            elements.append(Spacer(1, 8))

            university_name = """ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ<br/>
            ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ ВЫСШЕГО ОБРАЗОВАНИЯ<br/>
            «ВОРОНЕЖСКИЙ ГОСУДАРСТВЕННЫЙ УНИВЕРСИТЕТ<br/>
            ИНЖЕНЕРНЫХ ТЕХНОЛОГИЙ»"""
            elements.append(Paragraph(university_name, style_header))
            elements.append(Spacer(1, 12))

            faculty = "Факультет УИТС"
            elements.append(Paragraph(faculty, style_header))
            elements.append(Spacer(1, 6))

            # Получаем данные из объекта
            actual_group_name = data.get('group_name', group_name)
            actual_subject_name = data.get('subject_name', subject_name)
            
            group_info = f"Группа: {actual_group_name}"
            elements.append(Paragraph(group_info, style_header))
            elements.append(Spacer(1, 12))

            title = f"Ведомость по предмету «{actual_subject_name}»"
            elements.append(Paragraph(title, style_header))
            elements.append(Spacer(1, 20))

            # === ТАБЛИЦА РЕЙТИНГА ===
            ratings = data.get("ratings", [])
            
            if not ratings:
                elements.append(Paragraph("Нет данных для отображения", styles["Normal"]))
                logger.warning("Нет данных рейтинга для отображения")
            else:
                # Определяем тип данных (с КТ или просто оценки)
                is_detailed = any("rating" in entry for entry in ratings)

                if is_detailed:
                    table_data = [["№ зачётки", "КТ1", "КТ2", "КТ3", "КТ4", "КТ5", "Средний балл"]]
                    for entry in ratings:
                        if "rating" in entry:
                            r = entry["rating"]
                            kt_values = [r.get(f"kt{i}", "—") for i in range(1, 6)]
                            numeric_values = [v for v in kt_values if isinstance(v, (int, float))]
                            avg = round(sum(numeric_values) / len(numeric_values), 2) if numeric_values else "—"
                            table_data.append([
                                entry.get("student_id", "—"),
                                *kt_values,
                                avg
                            ])
                else:
                    table_data = [["№ зачётки", "Оценка"]]
                    for entry in ratings:
                        table_data.append([
                            entry.get("student_id", "—"), 
                            entry.get("grade", "—")
                        ])

                table = Table(table_data, repeatRows=1)
                table.setStyle(TableStyle([
                    ("FONTNAME", (0, 0), (-1, -1), "DejaVuSans"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("LEFTPADDING", (0, 0), (-1, -1), 4),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ]))
                elements.append(table)

            elements.append(Spacer(1, 80))
            elements.append(self._create_footer(styles))

            doc.build(elements)
            buffer.seek(0)

            safe_filename = f"rating.pdf"
            return Response(
                content=buffer.getvalue(),
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename={safe_filename}"
                }
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Ошибка генерации ведомости рейтинга: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Ошибка генерации ведомости рейтинга: {str(e)}")

    async def generate_average_rating_report(
        self, 
        group_name: str
    ) -> Response:
        """Генерация отчёта среднего балла с реальными данными"""
        try:
            logger.info(f"Начало генерации отчета среднего балла для группы {group_name}")
            
            # Получаем реальный список студентов группы
            students = self._get_group_students(group_name)
            logger.info(f"Найдено студентов: {len(students)}")

            if not students:
                logger.error(f"В группе {group_name} не найдено студентов")
                raise HTTPException(
                    status_code=404, 
                    detail=f"В группе {group_name} не найдено студентов"
                )

            # Создаем PDF в памяти
            doc, styles, style_header, buffer = self._setup_document()
            elements = []

            # === ТИТУЛЬНАЯ ЧАСТЬ ===
            university_name = """ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ<br/>
            ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ ВЫСШЕГО ОБРАЗОВАНИЯ<br/>
            «ВОРОНЕЖСКИЙ ГОСУДАРСТВЕННЫЙ УНИВЕРСИТЕТ<br/>
            ИНЖЕНЕРНЫХ ТЕХНОЛОГИЙ»"""
            elements.append(Paragraph(university_name, style_header))
            elements.append(Spacer(1, 12))

            faculty = "Факультет УИТС"
            elements.append(Paragraph(faculty, style_header))
            elements.append(Spacer(1, 6))

            group_info = f"Группа: {group_name}"
            elements.append(Paragraph(group_info, style_header))
            elements.append(Spacer(1, 12))

            title = "Средний балл по всем предметам студентов группы"
            elements.append(Paragraph(title, style_header))
            elements.append(Spacer(1, 20))

            # === ТАБЛИЦА СРЕДНИХ БАЛЛОВ ===
            table_data = [["№ зачётки", "Средний балл"]]
            
            for student in students:
                zach_number = student.get("zach_number")
                if not zach_number:
                    continue
                    
                try:
                    logger.debug(f"Обработка студента: {zach_number}")
                    
                    # Получаем реальные рейтинги студента через RatingService
                    ratings = self.rating_service.get_student_ratings(zach_number)
                    logger.debug(f"Получены рейтинги для {zach_number}: {len(ratings)} предметов")
                    
                    # Рассчитываем средний балл
                    values = []
                    for subject_name, subject_data in ratings.items():
                        if isinstance(subject_data, dict):
                            # Для обычных предметов - берем KT оценки
                            kt_values = [v for k, v in subject_data.items() 
                                       if k.startswith("kt") and isinstance(v, (int, float))]
                            values.extend(kt_values)
                    
                    if values:
                        avg_rating = round(sum(values) / len(values), 2)
                        logger.debug(f"Средний балл для {zach_number}: {avg_rating}")
                    else:
                        avg_rating = "—"
                        logger.debug(f"Нет оценок для {zach_number}")
                        
                    table_data.append([zach_number, avg_rating])
                    
                except Exception as e:
                    logger.error(f"Ошибка при обработке студента {zach_number}: {str(e)}")
                    table_data.append([zach_number, "Ошибка"])

            logger.info(f"Сформирована таблица с {len(table_data)-1} студентами")

            table = Table(table_data, repeatRows=1)
            table.setStyle(TableStyle([
                ("FONTNAME", (0, 0), (-1, -1), "DejaVuSans"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ]))
            elements.append(table)
            elements.append(Spacer(1, 80))

            # === ПОДВАЛ ===
            elements.append(self._create_footer(styles))

            # Создаем PDF
            logger.info("Создание PDF документа...")
            doc.build(elements)
            buffer.seek(0)
            logger.info("PDF успешно создан")

            safe_filename = f"average_rating.pdf"
            return Response(
                content=buffer.getvalue(),
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename={safe_filename}"
                }
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Критическая ошибка при генерации отчета: {str(e)}")
            logger.error(traceback.format_exc())
            raise HTTPException(
                status_code=500, 
                detail=f"Ошибка генерации отчёта среднего балла: {str(e)}"
            )

    def _get_group_students(self, group_name: str) -> List[Dict[str, str]]:
        """Вспомогательный метод для получения студентов группы"""
        try:
            logger.info(f"Получение студентов группы {group_name}")
            
            student_repo = StudentInfoRepository(self.db)
            group_repo = GroupsRepository(self.db)
            
            # Получаем реальных студентов через StudentInfoRepository
            students_data = student_repo.get_by_group_name(group_name)
            if students_data:
                students = [{"zach_number": student.zach_number} for student in students_data]
                logger.info(f"Найдено студентов через StudentInfoRepository: {len(students)}")
                return students
            
            logger.warning(f"Студенты для группы {group_name} не найдены")
            return []
            
        except Exception as e:
            logger.error(f"Ошибка при получении студентов группы {group_name}: {str(e)}")
            logger.error(traceback.format_exc())
            return []