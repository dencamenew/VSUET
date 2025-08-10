from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from bs4 import BeautifulSoup
import requests




def check_zach(url: str):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')

    group_name = soup.find('a', {'id': 'ucVedBox_lblGroup'}).text.strip()
    table_rows = soup.find_all('tr', class_=['VedRow1', 'VedRow2'])

    result = {
        "gruop": group_name,
        "zach": []
    }
    
    for row in table_rows:
        tds = row.find_all('td')
        result["zach"].append(tds[1].text.strip())
    
    return url, result
            



# настройка драйвера
chrome_options = Options()
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.page_load_strategy = 'eager'
driver = webdriver.Chrome(options=chrome_options)


url = "https://rating.vsuet.ru/web/Ved/Default.aspx"
driver.get(url)


WebDriverWait(driver, 20).until(
    EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbFacultets"))
)

faculty_select = Select(WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbFacultets"))
))
faculties = [opt.text for opt in faculty_select.options if opt.text and opt.text.strip()]

for faculty in faculties:
    faculty_select = Select(WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "ctl00_ContentPage_cmbFacultets"))
    ))
    faculty_select.select_by_visible_text(faculty)
    
    WebDriverWait(driver, 10).until(
        lambda d: Select(d.find_element(By.ID, "ctl00_ContentPage_cmbGroups")).options[0].text != "Выберите группу"
    )
    
    group_select = Select(WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbGroups"))
    ))
    groups = [opt.text for opt in group_select.options if opt.text and opt.text.strip()]
    

    for group in groups:
        group_select = Select(WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "ctl00_ContentPage_cmbGroups"))
        ))
        group_select.select_by_visible_text(group)

        table = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "ctl00_ContentPage_ucListVedBox_Grid"))
        )

        links = [] 
        for link in table.find_elements(By.TAG_NAME, "a"):
            links.append(link.get_attribute('href'))

        if len(links) > 0:
            print(check_zach(links[0]))
            

        
driver.quit()