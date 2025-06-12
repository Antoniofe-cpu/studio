import requests
import statistics
from urllib.parse import urlencode

class GoogleShoppingAnalyzer:
    def __init__(self, api_key):
        self.api_key = api_key
        self.api_endpoint = "https://app.scrapingbee.com/api/v1/"

    def find_grey_market_price(self, query):
        # --- L'INDENTAZIONE QUI ORA È CORRETTA ---
        if not self.api_key or "LA_TUA_CHIAVE" in self.api_key:
            return None

        print(f"      -> 🐝 [Google/ScrapingBee] Ricerca prezzo per: '{query[:40]}...'")
        
        # URL corretto per la ricerca, senza 'q=' extra
        google_url = f"https://www.google.com/search?q={query}&tbm=shop"

        params = {
            'api_key': self.api_key,
            'url': google_url,
            'render_js': 'false',
            'extract_rules': {
                "prices": {
                    "selector": "span.HGDIA.translate-content > span[aria-hidden='true']",
                    "type": "list",
                    "output": "text"
                }
            }
        }
        
        try:
            response = requests.get(self.api_endpoint, params=params, timeout=90)
            response.raise_for_status()
            data = response.json()
            
            if response.headers.get("Sbe-Error"):
                print(f"      -> ❌ [Google/ScrapingBee] Errore dal servizio: {response.headers.get('Sbe-Error')}")
                return None
                
            prices_text = data.get('prices', [])
            if not prices_text:
                print("      -> 🤷 [Google/ScrapingBee] Nessun prezzo trovato con i selettori.")
                return None
                
            prices = []
            for price_str in prices_text:
                try:
                    cleaned_price = price_str.replace('€', '').replace('.', '').replace(',', '.').strip()
                    prices.append(float(cleaned_price))
                except (ValueError, TypeError):
                    continue
            
            if not prices: return None

            grey_market_price = int(min(prices))
            print(f"      -> ✅ [Google/ScrapingBee] Prezzo minimo trovato: €{grey_market_price}")
            return grey_market_price
        except Exception as e:
            print(f"      -> ❌ [Google/ScrapingBee] Errore chiamata API: {e}")
            return None
