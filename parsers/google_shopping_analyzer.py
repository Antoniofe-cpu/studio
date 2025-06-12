# Contenuto per: parsers/google_shopping_analyzer.py
import serpapi
import statistics

class GoogleShoppingAnalyzer:
    def __init__(self, api_key):
        self.api_key = api_key

    def find_grey_market_price(self, query):
        if not self.api_key or "LA_TUA_CHIAVE" in self.api_key:
            return None

        print(f"      -> G [Google Shopping] Ricerca prezzo retail/grigio per: '{query[:40]}...'")
        params = {
            "engine": "google_shopping",
            "q": query,
            "api_key": self.api_key,
            "num": "10",  # Bastano pochi risultati per avere un'idea
            "tbs": "p_ord:p" # Ordina per prezzo, dal più basso
        }
        try:
            client = serpapi.Client()
            results = client.search(params)
            shopping_results = results.get('shopping_results', [])
            
            if not shopping_results: return None

            prices = []
            for item in shopping_results:
                # Il campo 'extracted_price' è spesso più pulito
                price_value = item.get("extracted_price")
                if price_value:
                    prices.append(float(price_value))
            
            if not prices: return None

            # Prendiamo il prezzo più basso e affidabile come riferimento
            grey_market_price = int(min(prices))
            print(f"      -> ✅ [Google Shopping] Prezzo minimo trovato: €{grey_market_price}")
            return grey_market_price
        except Exception as e:
            print(f"      -> ❌ [Google Shopping] Errore API: {e}")
            return None
