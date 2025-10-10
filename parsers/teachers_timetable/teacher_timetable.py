from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from bs4 import BeautifulSoup
import json
import logging
import re

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] - [%(levelname)s] --> %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def parse_subject_info(subject_text):
    """Парсит информацию о предмете из текста"""
    try:
        subjects = []
        
        # Разделяем по точкам с запятой
        subject_parts = [part.strip() for part in subject_text.split(';') if part.strip()]
        
        for part in subject_parts:
            # Разделяем тип и остальную часть
            if ':' in part:
                type_part, rest = part.split(':', 1)
                type_part = type_part.strip()
            else:
                type_part = ""
                rest = part
            
            # Извлекаем аудиторию из скобок
            auditorium = ""
            auditorium_match = re.search(r'\((.*?)\)', rest)
            if auditorium_match:
                auditorium = auditorium_match.group(1)
                rest = rest.replace(f"({auditorium})", "").strip()
            
            # Извлекаем группу
            group = ""
            if ',' in rest:
                parts = rest.split(',')
                group = parts[-1].strip()
                name_part = ','.join(parts[:-1]).strip()
            else:
                name_part = rest.strip()
    
            # Убираем лишние запятые
            name_part = re.sub(r',\s*$', '', name_part)
            
            # Очищаем название
            name_part = name_part.strip()
            
            subjects.append({
                "тип": type_part,
                "название": name_part,
                "аудитория": auditorium,
                "группа": group
            })
        
        return subjects
        
    except Exception as e:
        logger.warning(f"Ошибка при парсинге текста '{subject_text}': {e}")
        return [{
            "тип": "",
            "название": subject_text,
            "аудитория": "",
            "группа": ""
        }]

def main():
    """Основная функция для парсинга расписания"""
    # Настройка Chrome в headless режиме
    chrome_options = Options()
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.page_load_strategy = 'eager'
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        logger.info("Загрузка страницы расписания...")
        driver.get("https://timetable.vsuet.ru/")

        # Ожидаем загрузки элементов
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.ID, "selectvalueprepod"))
        )

        # Получаем список преподавателей
        teacher_select = Select(WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "selectvalueprepod"))
        ))

        teachers = [opt.text for opt in teacher_select.options if opt.text and opt.text.strip()]
        logger.info(f"Найдено преподавателей: {len(teachers)}")

        all_timetables = {}
        
        # Ограничим количество преподавателей для демонстрации
        demo_teachers = teachers[:3]  # Первые 3 преподавателя для примера
        
        for teacher in demo_teachers:
            logger.info(f"Обработка преподавателя: {teacher}")
            
            # Выбираем преподавателя
            teacher_select = Select(WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "selectvalueprepod"))
            ))
            teacher_select.select_by_visible_text(teacher)
            
            teacher_timetable = {"Числитель": {}, "Знаменатель": {}}
            
            # Парсим для числителя и знаменателя
            for check in ["Числитель", "Знаменатель"]:
                check_select = Select(WebDriverWait(driver, 30).until(
                    EC.element_to_be_clickable((By.ID, "selectvalueweek"))
                ))
                check_select.select_by_visible_text(check)

                time.sleep(0.5)  # Небольшая задержка для загрузки
                page_html = driver.page_source

                soup = BeautifulSoup(page_html, 'html.parser')
                tables = soup.find_all("table", class_="table table-hover table-bordered table-sm")
                full_info = {}

                for table in tables:
                    try:
                        weekday_elem = table.find("div", class_="vertical")
                        if not weekday_elem:
                            continue
                            
                        weekday = weekday_elem.text.strip()
                        
                        time_headers = table.find_all("th", class_="align-middle")
                        if len(time_headers) < 2:
                            continue
                            
                        stime = time_headers[1].text.strip()
                        
                        subject_elem = table.find("td", class_="align-middle")
                        if not subject_elem:
                            continue
                            
                        subject_text = subject_elem.text.strip()

                        subject_info = parse_subject_info(subject_text)

                        if weekday not in full_info:
                            full_info[weekday] = {}
                        
                        if stime in full_info[weekday]:
                            if isinstance(full_info[weekday][stime], list):
                                full_info[weekday][stime].extend(subject_info)
                            else:
                                full_info[weekday][stime] = [full_info[weekday][stime]] + subject_info
                        else:          
                            full_info[weekday][stime] = subject_info if len(subject_info) > 1 else subject_info[0]

                    except Exception as e:
                        logger.warning(f"Ошибка при парсинге таблицы: {e}")
                        continue

                teacher_timetable[check] = full_info
            
            all_timetables[teacher] = teacher_timetable
            
            # Выводим JSON для текущего преподавателя
            logger.info(f"=== Расписание для {teacher} ===")
            print(json.dumps({teacher: teacher_timetable}, ensure_ascii=False, indent=2))
            print("\n" + "="*50 + "\n")

        # Выводим полный JSON всех расписаний
        logger.info("=== ПОЛНОЕ РАСПИСАНИЕ ВСЕХ ПРЕПОДАВАТЕЛЕЙ ===")
        print(json.dumps(all_timetables, ensure_ascii=False, indent=2))

    except Exception as e:
        logger.error(f"Ошибка при работе с браузером: {e}")
    
    finally:
        driver.quit()
        logger.info("Браузер закрыт")

if __name__ == "__main__":
    main()