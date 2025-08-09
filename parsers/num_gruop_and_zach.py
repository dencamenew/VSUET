from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from bs4 import BeautifulSoup
import requests




def check_rait(url):
    
    resp = requests.get(url)
    resp.raise_for_status()
    time.sleep(0.01)

    soup = BeautifulSoup(resp.text, 'html.parser')

    date = soup.find('span', {'id': 'ucVedBox_lblDateUpdate'}).text.strip()
    subject = soup.find('span', {'id': 'ucVedBox_lblDis'}).text.strip()
    group_name = soup.find('a', {'id': 'ucVedBox_lblGroup'}).text.strip()

    student_data = []
    student_rows = soup.find_all('tr', class_=['VedRow1', 'VedRow2'])
    check = soup.find_all('span', id="ucVedBox_lblTypeVed")[0].text

    result = {
        "gruop": group_name,
        "subject": subject,
        "std": []
    }

    if check == "Зачет" or check == "Экзамен":
        # не кривая ведомость
        if soup.find("input", id="ucVedBox_chkShowPer"):
            for row in student_rows:
                tds = row.find_all('td')
                
                std_raiting = {
                    "num_zach": tds[1].text.strip() if len(tds) > 1 else "-",
                    "raiting": [
                        tds[7].text.strip() if len(tds) > 7 else "-",
                        tds[12].text.strip() if len(tds) > 12 else "-",
                        tds[17].text.strip() if len(tds) > 17 else "-",
                        tds[22].text.strip() if len(tds) > 22 else "-",
                        tds[27].text.strip() if len(tds) > 27 else "-",
                        tds[29].text.strip() if len(tds) > 29 else "-"
                    ]
                }
                result["std"].append(std_raiting)
                
            print(result)
        else:
            # кривая ведомость
            print("-", url)
    else:
        for row in student_rows:
            tds = row.find_all('td')
            result = ""
            if len(tds[7].text) > 0:
                result = tds[7].text
            elif len(tds[4].text) > 0:
                result = tds[4].text
            else:
                result = "-"
            ratings = [
                tds[2].text.strip() if len(tds) > 1 else "-",
                result    
            ]
            student_data.append(ratings)
        
        print(url, student_data)
            



# настройка драйвера
chrome_options = Options()
chrome_options.add_argument("--disable-gpu")
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

        links = set()  
        for link in table.find_elements(By.TAG_NAME, "a"):
            links.add(link.get_attribute('href'))
        
        print(len(links))

        for url in links:
            check_rait(url)
            

        
driver.quit()