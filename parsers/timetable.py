from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from bs4 import BeautifulSoup
import requests
import json


chrome_options = Options()
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.page_load_strategy = 'eager'
driver = webdriver.Chrome(options=chrome_options)
driver.get("https://timetable.vsuet.ru/")




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
print(groups)
timetable = {"Числитель": {},
             "Знаменатель": {}}
print(1)
for check in ["Числитель", "Знаменатель"]:
    check_select = Select(WebDriverWait(driver, 30).until(
            EC.element_to_be_clickable((By.ID, "selectvalueweek"))
        ))
    check_select.select_by_visible_text(check)
    print(2)
    for group in groups:
        print(group)
        group_select = Select(WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "selectvaluegroup"))
        ))
        group_select.select_by_visible_text(group)

        time.sleep(0.1)
        page_html = driver.page_source

        soup = BeautifulSoup(page_html, 'html.parser')
        table = soup.find_all("table", class_="table table-hover table-bordered table-sm")
        full_info = {}

        for info in table:
            weekday = info.find("div", class_="vertical").text.strip()
            stime = info.find_all("th", class_="align-middle")[1].text[:-2].strip('\n')
            subj = ','.join(info.find("td", class_="align-middle").text.strip().rsplit(',')[:-1])

            if weekday not in full_info:
                full_info[weekday] = {}
            
            full_info[weekday][stime] = subj

        if check == "Числитель":
            if group not in timetable["Числитель"]:
                timetable["Числитель"][str(group)] = {}
            timetable["Числитель"][str(group)] = full_info
        else:
            if group not in timetable["Знаменатель"]:
                timetable["Знаменатель"][str(group)] = {}
            timetable["Знаменатель"][str(group)] = full_info

with open("timetable.json", "w", encoding="utf-8") as file:
    json.dump(timetable, file, ensure_ascii=False, indent=4)
driver.quit()
