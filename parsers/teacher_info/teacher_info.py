from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import logging
import psycopg2
import secrets
import string

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] - [%(levelname)s] --> %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Функция для генерации уникального пароля
def generate_password(length=12):
    """Генерирует случайный пароль заданной длины"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

# Функция для вставки данных преподавателя
def insert_teacher_data(cursor, name, password):
    """Вставляет данные преподавателя в базу данных"""
    insert_query = """
    INSERT INTO teachers_info (name, password) 
    VALUES (%s, %s)
    ON CONFLICT (name) DO UPDATE SET password = EXCLUDED.password
    """
    cursor.execute(insert_query, (name, password))

# Основной код
try:
    chrome_options = Options()
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.page_load_strategy = 'eager'
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.get("https://timetable.vsuet.ru/")

    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.ID, "selectvalueprepod"))
    )

    teacher_select = Select(WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "selectvalueprepod"))
    ))
    
    # Получаем список преподавателей
    teachers = [opt.text for opt in teacher_select.options if opt.text and opt.text.strip()]
    
    logger.info(f"Найдено преподавателей: {len(teachers)}")
    
    driver.quit()

    # Подключение к базе данных и обработка данных
    conn = psycopg2.connect(
        host="postgres",
        port=5432,
        database="db",
        user="admin",
        password="admin"
    )
    
    with conn.cursor() as cursor:
        # Генерируем пароли и сохраняем данные
        for teacher_name in teachers:
            # Генерируем уникальный пароль
            password = generate_password()
            
            # Вставляем данные в базу
            insert_teacher_data(cursor, teacher_name, password)
            logger.info(f"Добавлен преподаватель: {teacher_name} - Пароль: {password}")
        
        # Сохраняем изменения
        conn.commit()

except psycopg2.Error as e:
    logger.error(f"Ошибка PostgreSQL: {e}")
    if 'conn' in locals():
        conn.rollback()
        logger.error(f"Статус соединения: {'OPEN' if not conn.closed else 'CLOSED'}")
except Exception as e:
    logger.error(f"Общая ошибка: {e}")
    if 'conn' in locals():
        conn.rollback()
finally:
    # Закрываем соединение с базой данных
    if 'conn' in locals() and not conn.closed:
        conn.close()
        logger.info("Соединение с базой данных закрыто")