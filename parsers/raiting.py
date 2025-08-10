from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import requests




def check_rait(url: str):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')


    date = soup.find('span', {'id': 'ucVedBox_lblDateUpdate'}).text.strip()
    subject = soup.find('span', {'id': 'ucVedBox_lblDis'}).text.strip()
    group_name = soup.find('a', {'id': 'ucVedBox_lblGroup'}).text.strip()


    table_rows = soup.find_all('tr', class_=['VedRow1', 'VedRow2'])
    ved_type = soup.find_all('span', id="ucVedBox_lblTypeVed")[0].text


    result = {
        "gruop": group_name,
        "subject": subject,
        "last_update": date,
        "std": []
    }


    if ved_type == "Зачет" or ved_type == "Экзамен":
        # тип ведомости по КТ
        if soup.find("input", id="ucVedBox_chkShowKT"): # проверка по наличию input для отображения по КТ
            for row in table_rows:
                tds = row.find_all('td')
                std_raiting = {
                    "num_zach": tds[1].text.strip(),
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

            return result
        else:
            # ведомость зачет или экзамен только с оценкой
            for row in table_rows:
                tds = row.find_all('td')
                mark = ""
                if len(tds[4].text) > 0:
                    mark = tds[4].text
                else:
                    mark = "-"

                std_raiting = {
                    "num_zach": tds[2].text.strip(),
                    "raiting": mark
                }
                result["std"].append(std_raiting)
            return result
    else:
        # ведомости с практиками, курсовыми работами и т.д.
        for row in table_rows:
            tds = row.find_all('td')
            mark = ""
            if len(tds[7].text) > 0:
                mark = tds[7].text
            elif len(tds[4].text) > 0:
                mark = tds[4].text
            else:
                mark = "-"

            std_raiting = {
                "num_zach": tds[2].text.strip(),
                "raiting": mark
            }
            result["std"].append(std_raiting)

        return result
            



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

        links = set()  
        for link in table.find_elements(By.TAG_NAME, "a"):
            links.add(link.get_attribute('href'))

        for url in links:
            print(check_rait(url))
            

        
driver.quit()