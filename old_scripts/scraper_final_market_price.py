# scraper_chrono24_price.py
import requests
import json
import re
from bs4 import BeautifulSoup

FLARESOLVERR_URL = "http://localhost:8191/v1"

def get_html_from_url(target_url: str):
    print(f"  [FlareSolverr] Richiesta per Chrono24: {target_url}")
    payload = {"cmd": "request.get", "url": target_url, "maxTimeout": 120000}
    try:
        response = requests.post(FLARESOLVERR_URL, headers={"Content-Type": "application/json"}, json=payload)
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "ok" and "solution" in data:
            print("  [FlareSolverr] ✅ Sfida Cloudflare/anti-bot risolta!")
            return data["solution"]["response"]
        else:
            print(f"  [FlareSolverr] ❌ Errore da FlareSolverr: {data.get('message')}")
            return None
    except Exception as e:
        print(f"  [FlareSolverr] ❌ Errore di connessione: {e}")
        return None

def get_market_price_from_chrono24(ref_number: str):
    # URL di ricerca di Chrono24, molto semplice
    search_url = f"https://www.chrono24.com/search/index.htm?query={ref_number}&dosearch=true"
    
    html_content = get_html_from_url(search_url)
    if not html_content: return None
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Chrono24 mette i prezzi in un div con una classe specifica
    price_elements = soup.find_all('div', class_='text-bold')
    
    prices = []
    for element in price_elements:
        price_text = element.get_text(strip=True)
        # Puliamo il prezzo da simboli (€, $, etc.) e spazi
        cleaned_price = re.sub(r'[^\d]', '', price_text)
        if cleaned_price:
            try:
                prices.append(int(cleaned_price))
            except ValueError:
                continue
    
    if prices:
        # Rimuoviamo eventuali valori anomali (es. prezzi di spedizione)
        # Un prezzo di un orologio di lusso è raramente sotto i 500
        valid_prices = [p for p in prices if p > 500]
        if valid_prices:
            valid_prices.sort()
            median_price = valid_prices[len(valid_prices) // 2]
            print(f"  [Parser] ✅ Prezzo mediano da Chrono24 trovato: €{median_price}")
            return median_price

    print(f"  [Parser] ❌ Impossibile estrarre prezzi validi da Chrono24 per la ref: {ref_number}")
    with open("debug_chrono24_page.html", "w", encoding="utf-8") as f: f.write(soup.prettify())
    print("     -> Pagina di Chrono24 salvata in 'debug_chrono24_page.html'.")
    return None

if __name__ == "__main__":
    print("--- Test dello scraper per Chrono24 con FlareSolverr ---")
    price = get_market_price_from_chrono24("126610LN")
    
    if price:
        print(f"\n✅ Risultato Finale: Il prezzo di mercato è ~€{price}")
    else:
        print(f"\n❌ Risultato Finale: Prezzo non recuperato.")
