# scraper_watchcharts.py
import requests
import re
from bs4 import BeautifulSoup

FLARESOLVERR_URL = "http://localhost:8191/v1"

def get_html(url: str):
    """Funzione helper per chiamare FlareSolverr."""
    print(f"    [FlareSolverr/WC] Richiesta per: {url[:70]}...")
    payload = {"cmd": "request.get", "url": url, "maxTimeout": 120000}
    try:
        response = requests.post(FLARESOLVERR_URL, headers={"Content-Type": "application/json"}, json=payload)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ok":
            return data["solution"]["response"]
    except Exception as e:
        print(f"    [FlareSolverr/WC] ❌ Errore: {e}")
    return None

def get_market_price(query: str):
    """Ottiene il prezzo di mercato di riferimento da WatchCharts."""
    print(f"  [WatchCharts] Cerco valore di mercato per '{query}'...")
    search_url = f"https://watchcharts.com/watches?keyword={query.replace(' ', '+')}"
    
    html = get_html(search_url)
    if not html: return None
    
    soup = BeautifulSoup(html, 'html.parser')
    link_element = soup.find('a', class_='text-main', href=re.compile(r'/watch_model/'))
    if not link_element:
        print("  [WatchCharts] ❌ Link al modello non trovato.")
        return None
        
    model_url = "https://watchcharts.com" + link_element['href']
    model_html = get_html(model_url)
    if not model_html: return None
    
    model_soup = BeautifulSoup(model_html, 'html.parser')
    price_label = model_soup.find('div', class_='price-box', string=re.compile(r'Market Price'))
    if price_label:
        price_div = price_label.find_next_sibling('div', class_='price')
        if price_div:
            price_text = price_div.get_text(strip=True)
            match = re.search(r'([\d,]+)', price_text.replace('$', ''))
            if match:
                price = int(match.group(1).replace(',', ''))
                print(f"  [WatchCharts] ✅ Valore di mercato trovato: ${price}")
                return price
                
    print("  [WatchCharts] ❌ Prezzo di mercato non estratto dalla pagina.")
    return None
