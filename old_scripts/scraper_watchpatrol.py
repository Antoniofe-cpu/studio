# scraper_watchpatrol.py
import requests
import json
import re
from bs4 import BeautifulSoup

FLARESOLVERR_URL = "http://localhost:8191/v1"

def get_html_with_flaresolverr(target_url: str):
    print(f"    [FlareSolverr/WP] Richiesta per: {target_url[:60]}...")
    payload = {"cmd": "request.get", "url": target_url, "maxTimeout": 120000}
    try:
        response = requests.post(FLARESOLVERR_URL, headers={"Content-Type": "application/json"}, json=payload)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ok": return data["solution"]["response"]
    except Exception as e:
        print(f"    [FlareSolverr/WP] ❌ Errore: {e}")
    return None

def get_listings(query: str, limit: int = 20):
    """Ottiene una lista di annunci da WatchPatrol."""
    print(f"  [WatchPatrol] Cerco annunci per '{query}'...")
    url = f"https://watchpatrol.net/search/{query.replace(' ', '%20')}"
    
    html_content = get_html_with_flaresolverr(url)
    if not html_content: return []
            
    soup = BeautifulSoup(html_content, 'html.parser')
    
    listing_cards = soup.find_all('div', class_='card-body')
    results = []
    
    for card in listing_cards[:limit]:
        title_element = card.find('h5', class_='card-title')
        price_element = card.find('p', class_='card-text')
        link_element = title_element.find('a') if title_element else None
        
        if title_element and price_element and link_element and '$' in price_element.get_text():
            title = title_element.get_text(strip=True)
            price_text = price_element.get_text(strip=True)
            
            cleaned_price = re.sub(r'[^\d]', '', price_text)
            if cleaned_price:
                try:
                    results.append({
                        'source': 'WatchPatrol',
                        'title': title,
                        'price': int(cleaned_price),
                        'currency': 'USD',
                        'url': link_element['href'],
                        'imageUrl': None
                    })
                except ValueError:
                    continue
                        
    print(f"  [WatchPatrol] ✅ Trovati {len(results)} annunci validi.")
    return results
