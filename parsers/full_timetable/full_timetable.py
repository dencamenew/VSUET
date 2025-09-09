import psycopg2
import logging
from datetime import datetime, timedelta
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from bs4 import BeautifulSoup
import os
import requests
import re

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] - [%(levelname)s] --> %(message)s'
)
logger = logging.getLogger(__name__)

def save_to_file(data, filename):
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"✅ Данные сохранены в файл: {filename}")
    except Exception as e:
        logger.error(f"❌ Ошибка при сохранении в файл {filename}: {e}")

def load_from_file(filename):
    try:
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.info(f"✅ Данные загружены из файла: {filename}")
            return data
        return {}
    except Exception as e:
        logger.error(f"❌ Ошибка при загрузке из файла {filename}: {e}")
        return {}

def check_db_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="db",
            user="admin",
            password="admin"
        )
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            
        logger.info("✅ Подключение к БД успешно установлено ✅")
        conn.close()
        return True
        
    except psycopg2.Error as e:
        logger.error(f"❌ Ошибка подключения к БД: {e}")
        return False
        
    except Exception as e:
        logger.error(f"❌ Общая ошибка: {e}")
        return False

def parse_timetable():
    logger.info("🚀 Начало парсинга расписания")
    
    chrome_options = Options()
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.page_load_strategy = 'eager'
    driver = webdriver.Chrome(options=chrome_options)
    driver.get("https://timetable.vsuet.ru/")

    try:
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.ID, "selectvaluegroup"))
        )

        group_select = Select(WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "selectvaluegroup"))
        ))

        check_select = Select(WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "selectvalueweek"))
        ))
        
        groups = [opt.text for opt in group_select.options if opt.text and opt.text.strip()]
        timetable = {}
        
        for group in groups:
            logger.info(group)
            group_select = Select(WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "selectvaluegroup"))
            ))
            group_select.select_by_visible_text(group)
            
            for check in ["Числитель", "Знаменатель"]:
                check_select = Select(WebDriverWait(driver, 30).until(
                    EC.element_to_be_clickable((By.ID, "selectvalueweek"))
                ))
                check_select.select_by_visible_text(check)

                time.sleep(0.1)
                page_html = driver.page_source
                soup = BeautifulSoup(page_html, 'html.parser')
                table = soup.find_all("table", class_="table table-hover table-bordered table-sm")
                full_info = {}

                if group not in timetable:
                    timetable[group] = {"Числитель": None, "Знаменатель": None}
                
                for info in table:
                    weekday = info.find("div", class_="vertical").text.strip()
                    stime = info.find_all("th", class_="align-middle")[1].text[:-2].strip('\n')
                    subj = ','.join(info.find("td", class_="align-middle").text.strip().rsplit(',')[:-1])
                    
                    if info.find("div", class_="box_rounded link_prepod px-3"):
                        teacher = info.find("div", class_="box_rounded link_prepod px-3").text.strip()
                        if weekday not in full_info:
                            full_info[weekday] = {}
                        full_info[weekday][stime] = [subj, teacher]

                        if check == "Числитель":
                            timetable[str(group)]["Числитель"] = full_info
                        else:
                            timetable[str(group)]["Знаменатель"] = full_info
                    else:
                        if weekday not in full_info:
                            full_info[weekday] = {}
                        
                        full_info[weekday][stime] = [subj, ""]

                        if check == "Числитель":
                            timetable[str(group)]["Числитель"] = full_info
                        else:
                            timetable[str(group)]["Знаменатель"] = full_info

        save_to_file(timetable, "timetable.json")
        logger.info("✅ Json с расписанием ✅")
        return timetable
        
    except Exception as e:
        logger.error(f"Ошибка при парсинге расписания: {e}")
        return {}
    finally:
        driver.quit()

def parse_zachetki(timetable_groups):
    logger.info("🚀 Начало парсинга зачёток")
    
    chrome_options = Options()
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.page_load_strategy = 'eager'
    driver = webdriver.Chrome(options=chrome_options)
    driver.get("https://rating.vsuet.ru/web/Ved/Default.aspx")

    try:
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbYears"))
        )

        try:
            year_select = Select(WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "ctl00_ContentPage_cmbYears"))
            ))
            
            try:
                year_select.select_by_visible_text("2024-2025")
                logger.info("Выбран учебный год: 2024-2025")
            except:
                available_years = [opt.text for opt in year_select.options if opt.text and opt.text.strip()]
                if available_years:
                    latest_year = available_years[-1]  
                    year_select.select_by_visible_text(latest_year)
                    logger.info(f"Год 2024-2025 не найден. Выбран последний доступный: {latest_year}")
                else:
                    logger.warning("Не найдено доступных учебных годов")
            
            time.sleep(2)
            
        except Exception as e:
            logger.error(f"Ошибка при выборе учебного года: {e}")

        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbFacultets"))
        )

        faculty_select = Select(WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbFacultets"))
        ))
        faculties = [opt.text for opt in faculty_select.options if opt.text and opt.text.strip()]

        group_with_zach = {}
        
        for faculty in faculties:
            if faculty == "Выберите факультет":
                continue
                
            faculty_select = Select(WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "ctl00_ContentPage_cmbFacultets"))
            ))
            faculty_select.select_by_visible_text(faculty)
            
            logger.info(f"Обрабатывается факультет: {faculty}")
            
            WebDriverWait(driver, 10).until(
                lambda d: Select(d.find_element(By.ID, "ctl00_ContentPage_cmbGroups")).options[0].text != "Выберите группу"
            )
            
            group_select = Select(WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbGroups"))
            ))
            groups = [opt.text for opt in group_select.options if opt.text and opt.text.strip() and opt.text != "Выберите группу"]
            

            for group in groups:
                if group not in timetable_groups:
                    logger.info(f"Группа {group} отсутствует в расписании, пропускаем")
                    continue
                    
                group_select = Select(WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.ID, "ctl00_ContentPage_cmbGroups"))
                ))
                group_select.select_by_visible_text(group)

                logger.info(f"Обрабатывается группа: {group}")
                
                try:
                    table = WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.ID, "ctl00_ContentPage_ucListVedBox_Grid"))
                    )

                    for link in table.find_elements(By.TAG_NAME, "a"):
                        href = link.get_attribute('href')
                        resp = requests.get(href)
                        soup = BeautifulSoup(resp.text, 'html.parser')

                        group_name = soup.find('a', {'id': 'ucVedBox_lblGroup'}).text.strip()
                        table_rows = soup.find_all('tr', class_=['VedRow1', 'VedRow2'])
                        
                        zach = []
                        for row in table_rows:
                            tds = row.find_all('td')
                            number_zach = tds[1].text.strip()
                            zach.append(number_zach)
                        group_with_zach[group_name] = zach
                        break
                    logger.info(f"Студенты из группы {group_name} обработаны")
                        
                except Exception as e:
                    logger.warning(f"Не удалось найти таблицу ведомостей для группы {group}: {e}")
                    continue

        save_to_file(group_with_zach, "zachetki.json")
        logger.info("✅ Зачётки студентов ✅")
        return group_with_zach
        
    except Exception as e:
        logger.error(f"Ошибка при парсинге зачёток: {e}")
        return {}
    finally:
        driver.quit()

def get_weekday_name(weekday_num):
    weekdays = {
        0: "Понедельник",
        1: "Вторник",
        2: "Среда",
        3: "Четверг",
        4: "Пятница",
        5: "Суббота",
        6: "Воскресенье"
    }
    return weekdays.get(weekday_num, "")

def get_week_type(date):
    start_date = datetime(2025, 9, 1)
    delta_weeks = (date - start_date).days // 7
    return 'Числитель' if delta_weeks % 2 == 0 else 'Знаменатель'

def get_weekday_russian(date):
    weekdays = {
        0: 'ПОНЕДЕЛЬНИК',
        1: 'ВТОРНИК', 
        2: 'СРЕДА',
        3: 'ЧЕТВЕРГ',
        4: 'ПЯТНИЦА',
        5: 'СУББОТА',
        6: 'ВОСКРЕСЕНЬЕ'
    }
    return weekdays[date.weekday()]

def populate_full_timetable_from_dicts(timetable, group_with_zach):
    conn = None
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="db",
            user="admin",
            password="admin"
        )
        
        with conn.cursor() as cursor:
            logger.info("Подключение к БД установлено")
            
            if not timetable or not group_with_zach:
                logger.error("Нет данных для вставки!")
                return
            
            logger.info(f"Расписание для {len(timetable)} групп, зачётки для {len(group_with_zach)} групп")
            
            start_date = datetime(2025, 9, 1)
            end_date = datetime(2025, 12, 31)
            current_date = start_date
            
            total_inserted = 0
            
            while current_date <= end_date:
                if current_date.weekday() < 5:
                    week_type = get_week_type(current_date)
                    weekday_russian = get_weekday_russian(current_date)
                    
                    if total_inserted % 100 == 0:
                        logger.info(f"Обрабатывается дата: {current_date.date()} ({weekday_russian}, {week_type})")
                    
                    for group_name, group_data in timetable.items():
                        if group_name not in group_with_zach:
                            continue
                            
                        zach_numbers = group_with_zach[group_name]
                        if not zach_numbers:
                            continue
                        
                        if week_type not in group_data or not group_data[week_type]:
                            continue
                            
                        week_schedule = group_data[week_type]
                        
                        if weekday_russian not in week_schedule:
                            continue
                            
                        day_schedule = week_schedule[weekday_russian]
                        
                        for time_slot, lesson_info in day_schedule.items():
                            if not isinstance(lesson_info, list) or len(lesson_info) < 2:
                                continue
                                
                            subject, teacher = lesson_info
                            
                            clean_subject, audience = clean_subject_and_get_audience(subject)
                            
                            subject_lower = subject.lower()
                            if "лек" in subject_lower:
                                type_subject = "Лекция"
                            elif "прак" in subject_lower:
                                type_subject = "Практика" 
                            elif "лаб" in subject_lower:
                                type_subject = "Лабораторная"
                            else:
                                type_subject = "Другое"
                            
                            try:
                                time_str = time_slot.split('-')[0].strip()
                                time_str = time_str.replace('.', ':')
                                time_obj = datetime.strptime(time_str, '%H:%M').time()
                            except Exception as e:
                                logger.warning(f"Неверный формат времени: {time_slot}, ошибка: {e}")
                                continue
                            
                            for zach_number in zach_numbers:
                                try:
                                    cursor.execute("""
                                        INSERT INTO full_timetable 
                                        (date, group_name, zach_number, time, subject, type_subject, teacher, turnout, audience)
                                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                                        ON CONFLICT (date, zach_number, time) 
                                        DO UPDATE SET
                                            group_name = EXCLUDED.group_name,
                                            subject = EXCLUDED.subject,
                                            type_subject = EXCLUDED.type_subject,
                                            teacher = EXCLUDED.teacher,
                                            turnout = EXCLUDED.turnout,
                                            audience = EXCLUDED.audience
                                    """, (
                                        current_date.date(),
                                        group_name,
                                        zach_number,
                                        time_obj,
                                        clean_subject,
                                        type_subject,
                                        teacher,
                                        False,
                                        audience
                                    ))
                                    
                                    total_inserted += 1
                                    
                                    if total_inserted % 10000 == 0:
                                        logger.info(f"Добавлено {total_inserted} записей...")
                                        
                                except Exception as e:
                                    logger.error(f"Ошибка при вставке: {e}")
                                    continue
                
                current_date += timedelta(days=1)
            
            conn.commit()
            logger.info(f"Успешно добавлено/обновлено {total_inserted} записей")
            
            cursor.execute("SELECT COUNT(*) FROM full_timetable")
            total_count = cursor.fetchone()[0]
            logger.info(f"Всего записей в full_timetable: {total_count}")
            
    except Exception as e:
        logger.error(f"Ошибка при заполнении таблицы: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()
            logger.info("Подключение к БД закрыто")

def clean_subject_and_get_audience(subject):
    audience = ""
    audience_match = re.search(r'\(([^)]+)\)', subject)
    if audience_match:
        audience_str = audience_match.group(1)
        number_match = re.search(r'\{[^.]*\.(\d+)\}', audience_str)
        if number_match:
            audience = number_match.group(1)
        else:
            audience = audience_str
    
    clean_subject = re.sub(r'^.*?:', '', subject).strip()
    clean_subject = re.sub(r'\([^)]*\)', '', clean_subject).strip()
    
    words = clean_subject.split()
    if len(words) > 2:
        last_two = ' '.join(words[-2:])
        if re.search(r'[А-Я][а-я]*\s[А-Я]\.[А-Я]\.', last_two) or '.' in last_two:
            clean_subject = ' '.join(words[:-2])
    
    return clean_subject.strip(), audience

def main():
    db_connected = check_db_connection()
    if not db_connected:
        logger.error("Не удалось подключиться к БД. Завершение работы.")
        return
    
    timetable = load_from_file("timetable.json")
    group_with_zach = load_from_file("zachetki.json")
    
    if not timetable:
        logger.info("Расписание не найдено в файле, начинаем парсинг...")
        timetable = parse_timetable()
    
    if not group_with_zach:
        logger.info("Зачётки не найдены в файле, начинаем парсинг...")
        group_with_zach = parse_zachetki(list(timetable.keys()))
    
    if not timetable or not group_with_zach:
        logger.error("Не удалось получить данные. Завершение работы.")
        return
    
    logger.info("🚀 Начинаем вставку данных в БД 🚀")
    populate_full_timetable_from_dicts(timetable, group_with_zach)
    logger.info("✅ Все задачи завершены успешно ✅")

if __name__ == "__main__":
    main()