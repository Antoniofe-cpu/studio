# scraper_ebay.py
import requests
import re
from bs4 import BeautifulSoup

FLARESOLVERR_URL = "http://localhost:8191/v1"

def get_html(url: str): # Funzione helper
    print(f"    [FlareSolverr/eBay] Richiesta per: {url[:70]}...")
    payload = {"cmd": "request.get", "url": url, "maxTimeout": 120000}
    try:
        response = requests.post(FLARESOLVERR_URL, headers={"Content-Type": "application/json"}, json=payload)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ok":
            return data["solution"]["response"]
    except Exception as e:
        print(f"    [FlareSolverr/eBay] ❌ Errore: {e}")
    return None

def get_sold_price_median(query: str, limit: int = 15):
    """Ottiene il prezzo mediano degli annunci VENDUTI su eBay."""
    print(f"  [eBay] Cerco VENDUTI per '{query}'...")
    url = f"https://www.ebay.com/sch/i.html?_from=R40&_nkw={query.replace(' ', '+')}&_sacat=31387&LH_Complete=1&LH_Sold=1"
    
    html = get_html(url)
    if not html: return None
            
    soup = BeautifulSoup(html, 'html.parser')
    listing_items = soup.find_all('li', class_='s-item')
    prices = []
    
    for item in listing_items:
        if 's-item__pl-placeholder' in item.get('class', []): continue
        price_element = item.find('span', class_='s-item__price')
        if price_element:
            price_text = price_element.get_text(strip=True)
            match = re.search(r'([\d,]+\.?\d*)', price_text.replace('$', ''))
            if match:
                try:
                    prices.append(int(float(match.group(1).replace(',', ''))))
                except ValueError: continue
    
    if prices:
        valid_prices = [p for p in prices if 100 < p < 500000]
        if len(valid_prices) >= 3:
            valid_prices.sort()
            median_price = valid_prices[len(valid_prices) // 2]
            print(f"  [eBay] ✅ Prezzo mediano VENDUTI da {len(valid_prices)} annunci: ${median_price}")
            return median_price
            
    print(f"  [eBay] ❌ Nessun prezzo di vendita valido trovato.")
    return None
