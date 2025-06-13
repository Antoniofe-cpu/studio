import requests
import logging
import statistics

class EbayAnalyzer:
    _SANDBOX_ENDPOINT = "https://svcs.sandbox.ebay.com/services/search/FindingService/v1"
    _PRODUCTION_ENDPOINT = "https://svcs.ebay.com/services/search/FindingService/v1"

    def __init__(self, client_id, use_sandbox=True):
        self.client_id = client_id
        self.api_endpoint = self._SANDBOX_ENDPOINT if use_sandbox else self._PRODUCTION_ENDPOINT
        logging.info(f"[eBay] Inizializzato in modalità {'SANDBOX' if use_sandbox else 'PRODUZIONE'}.")

    def calculate_market_price(self, query):
        if not self.client_id: return None
        logging.info(f"      -> 📈 [eBay] Ricerca mercato per: '{query[:40]}...'")
        params = {
            "OPERATION-NAME": "findCompletedItems", "SERVICE-VERSION": "1.13.0",
            "SECURITY-APPNAME": self.client_id, "RESPONSE-DATA-FORMAT": "JSON",
            "keywords": query, "paginationInput.entriesPerPage": "20",
            "itemFilter(0).name": "SoldItemsOnly", "itemFilter(0).value": "true",
        }
        try:
            response = requests.get(self.api_endpoint, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
            if data.get('findCompletedItemsResponse', [{}])[0].get('ack', ['Failure'])[0] != 'Success': return None
            items = data['findCompletedItemsResponse'][0].get('searchResult', [{}])[0].get('item', [])
            if not items: return None
            prices = [float(item['sellingStatus'][0]['currentPrice'][0]['__value__']) for item in items]
            if len(prices) < 2: return None
            market_price = int(statistics.median(prices))
            logging.info(f"      -> ✅ [eBay] Prezzo mercato: €{market_price}")
            return market_price
        except Exception as e:
            logging.error(f"      -> ❌ [eBay] Errore API: {e}")
            return None
