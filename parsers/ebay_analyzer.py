# Contenuto FINALE e SICURO per: parsers/ebay_analyzer.py
import requests
import statistics

class EbayAnalyzer:
    def __init__(self, client_id, site_id="EBAY-IT"):
        self.client_id = client_id
        self.site_id = site_id
        self.api_endpoint = "https://svcs.ebay.com/services/search/FindingService/v1"

    def calculate_market_price(self, query):
        # --- CONTROLLO DI SICUREZZA AGGIUNTO ---
        # Se il Client ID non è stato caricato, non fare nulla.
        if not self.client_id or "LA_TUA_CHIAVE" in str(self.client_id):
            # Non stampiamo nulla per non intasare il log, semplicemente non procediamo.
            return None
        
        print(f"      -> 📈 [eBay] Ricerca prezzo di mercato per: '{query[:40]}...'")
        params = {
            "OPERATION-NAME": "findCompletedItems", "SERVICE-VERSION": "1.13.0",
            "SECURITY-APPNAME": self.client_id, "RESPONSE-DATA-FORMAT": "JSON",
            "GLOBAL-ID": self.site_id, "keywords": query, "paginationInput.entriesPerPage": "20",
            "itemFilter(0).name": "SoldItemsOnly", "itemFilter(0).value": "true",
            "itemFilter(1).name": "Condition", "itemFilter(1).value": "3000"
        }
        try:
            response = requests.get(self.api_endpoint, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
            if data.get('findCompletedItemsResponse', [{}])[0].get('ack', ['Failure'])[0] != 'Success':
                print(f"      -> ⚠️ [eBay] Risposta API non valida: {data.get('findCompletedItemsResponse', [{}])[0].get('errorMessage', [{}])[0].get('error', [{}])[0].get('message', ['Sconosciuto'])[0]}")
                return None
            items = data['findCompletedItemsResponse'][0].get('searchResult', [{}])[0].get('item', [])
            if not items: return None
            prices = [float(item['sellingStatus'][0]['currentPrice'][0]['__value__']) for item in items if item.get('sellingStatus', [{}])[0].get('sellingState', [''])[0] == 'Sold']
            if len(prices) < 2: return None # Bastano 2 risultati per una mediana
            market_price = int(statistics.median(prices))
            print(f"      -> ✅ [eBay] Prezzo di mercato stimato (mediana su {len(prices)} venduti): €{market_price}")
            return market_price
        except Exception as e:
            print(f"      -> ❌ [eBay] Errore chiamata API: {e}")
            return None
