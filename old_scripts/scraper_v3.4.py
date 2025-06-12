# scraper_v3.4.py (Versione Finale e Verificata)
import requests
import json
import re
import firebase_admin
from firebase_admin import credentials, firestore
import time
import random
import sys

# --- CONFIGURAZIONE ---
COLLECTION_NAME = "deals"
SERVICE_ACCOUNT_KEY_PATH = "serviceAccountKey.json"

# --- INIZIALIZZAZIONE FIREBASE ---
try:
    if not firebase_admin._apps:
        print("🔑 Inizializzazione di Firebase Admin SDK...")
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Connessione a Firestore riuscita!")
except Exception as e:
    print(f"❌ ERRORE CRITICO: Impossibile connettersi a Firebase. Dettagli: {e}")
    sys.exit() # Esce se Firebase fallisce

# Headers per simulare un browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
}

# --- FUNZIONI DI PARSING ---
KNOWN_BRANDS = ["rolex", "omega", "seiko", "patek philippe", "audemars piguet", "cartier", "tudor", "tag heuer", "breitling", "panerai"]

def parse_title(title):
    title_lower = title.lower()
    brand, model, ref = "Unknown", title, "N/A"
    for b in KNOWN_BRANDS:
        if b in title_lower:
            brand = b.title()
            model = re.sub(r'\[wts\]', '', title, flags=re.IGNORECASE).strip()
            model = re.sub(brand, '', model, flags=re.IGNORECASE).strip()
            break
    match = re.search(r'\b(\d{4,6}[A-Z]{0,2})\b', title)
    if match:
        ref = match.group(1)
        model = model.replace(ref, '').strip()
    return brand, model, ref

def parse_price(text_to_search):
    if not text_to_search:
        return None
    match_k = re.search(r'(\d+([.,]\d+)?)\s*k', text_to_search, re.IGNORECASE)
    if match_k:
        price_str = match_k.group(1).replace(',', '.')
        return int(float(price_str) * 1000)
    match_full = re.search(r'[\$€£]?\s*(\d{1,3}(?:[.,]\d{3})*|\d+)', text_to_search)
    if match_full:
        price_str = re.sub(r'[.,]', '', match_full.group(1))
        return int(price_str)
    return None

def get_price_from_comments(post_url, post_author):
    try:
        comments_url = f"{post_url.rstrip('/')}/comments.json?sort=top"
        print(f"     - Prezzo non trovato. Cerco nei commenti...")
        response = requests.get(comments_url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        comments_data = response.json()
        for comment in comments_data[1]['data']['children']:
            comment_data = comment.get('data', {})
            if comment_data.get('author') == post_author:
                price = parse_price(comment_data.get('body', ''))
                if price:
                    print(f"       -> Prezzo trovato nel commento di OP: {price}")
                    return price
        return None
    except Exception as e:
        print(f"     - Errore durante la ricerca nei commenti: {e}")
        return None

def get_high_res_images_from_post(post_url):
    try:
        full_url = f"{post_url.rstrip('/')}.json"
        response = requests.get(full_url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        post_data = response.json()
        media_metadata = post_data[0]['data']['children'][0]['data'].get('media_metadata')
        if media_metadata:
            image_urls = []
            sorted_media_ids = sorted(media_metadata.keys())
            for media_id in sorted_media_ids:
                if media_metadata[media_id]['status'] == 'valid' and media_metadata[media_id]['e'] == 'Image':
                    source = media_metadata[media_id].get('s', {})
                    hi_res_url = source['p'][-1]['u'] if 'p' in source and source['p'] else source.get('u')
                    if hi_res_url:
                        image_urls.append(hi_res_url.replace('amp;', ''))
            if image_urls: return image_urls
    except Exception as e:
        print(f"    - Errore nel recuperare la galleria: {e}")
    try:
        post_json = response.json()
        main_image = post_json[0]['data']['children'][0]['data'].get('url_overridden_by_dest')
        if main_image and main_image.endswith(('.jpg', '.png', '.jpeg')):
            return [main_image.replace('amp;','')]
    except: pass
    return []

# --- CLASSE PER ANALISI EBAY ---
class EbayAnalyzer:
    def __init__(self, client_id, site_id="EBAY-IT"):
        self.client_id = client_id
        self.site_id = site_id
        self.api_endpoint = "https://svcs.ebay.com/services/search/FindingService/v1"

    def _make_api_call(self, params):
        try:
            response = requests.get(self.api_endpoint, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"  - ❌ Errore API eBay: {e}")
            return None

    def calculate_market_price(self, query, num_results=15):
        print(f"  - 📈 Chiedo a eBay il prezzo di mercato per: '{query[:40]}...'")
        params = {
            "OPERATION-NAME": "findCompletedItems", "SERVICE-VERSION": "1.13.0",
            "SECURITY-APPNAME": self.client_id, "RESPONSE-DATA-FORMAT": "JSON",
            "GLOBAL-ID": self.site_id, "keywords": query,
            "paginationInput.entriesPerPage": str(num_results), "sortOrder": "PricePlusShippingLowest",
            "itemFilter(0).name": "SoldItemsOnly", "itemFilter(0).value": "true",
            "itemFilter(1).name": "LocatedIn", "itemFilter(1).value": "IT"
        }
        data = self._make_api_call(params)
        if not data or data.get('findCompletedItemsResponse', [{}])[0].get('ack', ['Failure'])[0] != 'Success':
            print("  - ⚠️ Risposta da eBay non valida o fallita."); return None
        items = data['findCompletedItemsResponse'][0].get('searchResult', [{}])[0].get('item', [])
        if not items: print("  - 🤷 Nessun articolo venduto trovato su eBay."); return None
        prices = []
        for item in items:
            if item.get('sellingStatus', [{}])[0].get('sellingState', [''])[0] == 'Sold':
                 price_info = item.get('sellingStatus', [{}])[0].get('currentPrice', [{}])[0]
                 if price_info.get('@currencyId') == 'EUR': prices.append(float(price_info.get('__value__')))
        if not prices: print("  - 🤷 Nessun prezzo valido (EUR) trovato."); return None
        avg_price = sum(prices) / len(prices)
        print(f"  - ✅ Trovati {len(prices)} prezzi. Prezzo medio di mercato stimato: {int(avg_price)}€")
        return int(avg_price)

# --- PROCESSO ETL COMPLETO ---
def run_full_etl():
    EBAY_CLIENT_ID = "IL_TUO_CLIENT_ID_VA_QUI"
    
    ebay_analyzer = None
    if EBAY_CLIENT_ID and EBAY_CLIENT_ID != "IL_TUO_CLIENT_ID_VA_QUI":
        print("✅ Analisi di mercato eBay ATTIVATA.")
        ebay_analyzer = EbayAnalyzer(client_id=EBAY_CLIENT_ID, site_id="EBAY-IT")
    else:
        print("⚠️  ATTENZIONE: Client ID di eBay non fornito. Analisi di mercato DISATTIVATA.")

    print(f"\n📡 [EXTRACT] Contattando Reddit per la lista dei post...")
    response = requests.get("https://www.reddit.com/r/Watchexchange/new.json?limit=25", headers=HEADERS)
    try: posts = response.json()['data']['children']
    except json.JSONDecodeError: print(f"❌ ERRORE: La risposta da Reddit non è un JSON valido."); return
        
    print(f"✅ Trovati {len(posts)} post. Inizio analisi dettagliata...")
    deals_to_upload = []
    for i, post in enumerate(posts):
        post_data = post['data']
        if '[wts]' not in post_data['title'].lower(): continue

        print(f"\n  -> Analizzo post {i+1}/{len(posts)}: {post_data['title'][:60]}...")
        brand, model, ref = parse_title(post_data['title'])
        full_text_for_price = post_data['title'] + " " + post_data.get('selftext', '')
        listing_price = parse_price(full_text_for_price)
        post_url = "https://www.reddit.com" + post_data['permalink']
        if not listing_price: listing_price = get_price_from_comments(post_url, post_data['author'])

        if not listing_price: print("     - Annuncio saltato: nessun prezzo trovato."); continue
        
        image_urls = get_high_res_images_from_post(post_url)
        if not image_urls:
            thumbnail = post_data.get('thumbnail')
            if thumbnail and 'http' in thumbnail: image_urls.append(thumbnail)
            else: print("     - Annuncio saltato: nessuna immagine trovata."); continue

        market_price = None
        if ebay_analyzer and brand != "Unknown" and model:
            search_query = f"{brand} {model} {ref if ref != 'N/A' else ''}".strip()
            market_price = ebay_analyzer.calculate_market_price(search_query)
            time.sleep(1)

        margin = round(((market_price - listing_price) / listing_price) * 100, 2) if market_price and listing_price else None
        
        deal = {
            "id": post_data['id'], "imageUrls": image_urls, "imageUrl": image_urls[0],
            "brand": brand, "model": model, "referenceNumber": ref, "listingPrice": listing_price, 
            "marketPrice": market_price, "retailPrice": None, "estimatedMarginPercent": margin,
            "dealLabel": "🔥 Affare" if margin and margin > 10 else ("👍 OK" if margin is not None else "N/D"),
            "tags": ["#RedditDeal"], "sourceUrl": post_url, "description": post_data.get('selftext', ''), 
            "condition": "Used", "lastUpdated": firestore.SERVER_TIMESTAMP
        }
        deals_to_upload.append(deal)
        time.sleep(1.5)

    if not deals_to_upload: print("\nNessun nuovo affare valido da caricare. Termino."); return

    print(f"\n📤 [LOAD] Caricamento di {len(deals_to_upload)} affari su Firestore...")
    batch = db.batch()
    for deal in deals_to_upload:
        doc_ref = db.collection(COLLECTION_NAME).document(deal['id'])
        batch.set(doc_ref, deal, merge=True)
    batch.commit()
    print(f"✅ Caricamento completato.")
    print("\n🎉 Processo ETL completato con successo!")

# --- BLOCCO DI ESECUZIONE PRINCIPALE ---
if __name__ == "__main__":
    run_full_etl()
