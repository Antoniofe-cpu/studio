# scraper_watchrecon.py (v3.0 - Restituisce Lista Annunci)
import requests
import json
import re
from bs4 import BeautifulSoup

FLARESOLVERR_URL = "http://localhost:8191/v1"

def get_html_with_flaresolverr(target_url: str):
    print(f"    [FlareSolverr/WR] Richiesta per: {target_url[:60]}...")
    payload = {"cmd": "request.get", "url": target_url, "maxTimeout": 120000}
    try:
        response = requests.post(FLARESOLVERR_URL, headers={"Content-Type": "application/json"}, json=payload)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ok": return data["solution"]["response"]
    except Exception as e:
        print(f"    [FlareSolverr/WR] ❌ Errore: {e}")
    return None

def get_listings(search_query: str, limit: int = 15):
    """
    Ottiene una lista di annunci da Watchrecon.
    Ogni annuncio è un dizionario: {'title': str, 'price': int}
    """
    print(f"  [WatchRecon] Cerco annunci per '{search_query}'...")
    url = f"https://www.watchrecon.com/?query={search_query.replace(' ', '+')}"
    
    html_content = get_html_with_flaresolverr(url)
    if not html_content: return []
            
    soup = BeautifulSoup(html_content, 'html.parser')
    listing_rows = soup.find_all('div', class_='row mb-3')
    
    results = []
    for row in listing_rows[:limit]:
        title_element = row.find('h5', class_='mb-1')
        price_element = row.find('h5', class_='mb-0')

        if title_element and price_element:
            title = title_element.get_text(strip=True)
            price_text = price_element.get_text(strip=True)
            cleaned_price = re.sub(r'[^\d]', '', price_text)
            if cleaned_price:
                try:
                    price = int(cleaned_price)
                    results.append({'source': 'WatchRecon', 'title': title, 'price': price})
                except ValueError:
                    continue

    print(f"  [WatchRecon] ✅ Trovati {len(results)} annunci validi.")
    return results
