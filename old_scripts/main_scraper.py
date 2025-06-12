# main_scraper.py (v10.0 - Il Valutatore Esperto)
import firebase_admin, os, time, json
from firebase_admin import credentials, firestore
from groq import Groq
from forex_python.converter import CurrencyRates
from concurrent.futures import ThreadPoolExecutor
import statistics

# Importiamo i nostri scraper specializzati
from scraper_reddit import get_reddit_posts_with_details
from scraper_watchcharts import get_market_price as get_watchcharts_price
from scraper_ebay import get_sold_price_median as get_ebay_sold_price
from scraper_chrono24 import get_listings as get_chrono24_listings

# --- CONFIGURAZIONE E INIZIALIZZAZIONE ---
GROQ_API_KEY = "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"
COLLECTION_NAME = "deals_v10"
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate("serviceAccountKey.json"); firebase_admin.initialize_app(cred)
    db = firestore.client(); client = Groq(api_key=GROQ_API_KEY); currency_converter = CurrencyRates()
    print("✅ Servizi inizializzati!")
except Exception as e:
    print(f"❌ ERRORE DI INIZIALIZZAZIONE: {e}"); exit()

# --- FUNZIONI DI LOGICA ---
def get_keywords_from_ai(title: str, body: str):
    print(f"\n- [AI] Analizzo: '{title[:60]}...'")
    json_schema = { "type": "object", "properties": { "brand": {"type": ["string", "null"]}, "model": {"type": ["string", "null"]}, "reference_number": {"type": ["string", "null"]}, "listing_price": {"type": ["integer", "null"]}, "currency": {"type": ["string", "null"], "enum": ["USD", "EUR", "GBP", None]} }, "required": ["brand", "model", "reference_number", "listing_price", "currency"] }
    system_prompt = f"Extract watch data... JSON Schema: {json.dumps(json_schema)}"
    full_content = f"TITLE: {title}\n\nBODY:{body[:1500]}"
    try:
        chat_completion = client.chat.completions.create(messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": full_content}], model="llama3-8b-8192", temperature=0.0, response_format={"type": "json_object", "schema": json_schema})
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"  [AI] ❌ Errore: {e}"); return None

def convert_to_eur(price, currency="USD"):
    if not price: return None
    if not currency: currency = "USD"
    currency = currency.upper();
    if currency == "EUR": return price
    try:
        rate = currency_converter.get_rate(currency.upper(), "EUR"); return int(price * rate)
    except:
        if currency == "USD": return int(price * 0.93)
        return None

def calculate_final_metrics(listing_price_eur, market_price_eur):
    if not all([listing_price_eur, market_price_eur]) or listing_price_eur == 0: return None, None, None
    margin = round(((market_price_eur - listing_price_eur) / listing_price_eur) * 100, 2)
    score = max(0, min(100, int(50 + margin * 1.5)))
    label = "🤔 OK";
    if score > 85: label = "🔥 Affare Top"
    elif score > 70: label = "👍 Buon Affare"
    elif listing_price_eur > market_price_eur: label = "❌ Fuori Prezzo"
    return margin, score, label

# --- ORCHESTRATORE ---
def run():
    print("\n🚀 Avvio Orchestratore v10.0 'Il Valutatore Esperto'...")
    reddit_posts = get_reddit_posts_with_details(limit=25)
    
    deals_to_save = []
    for post in reddit_posts:
        if not post.get('imageUrls'): continue
        
        ai_data = get_keywords_from_ai(post['title'], post.get('selftext', ''))
        if not ai_data or not ai_data.get('listing_price') or not (ai_data.get('brand') or ai_data.get('reference_number')):
            print("  - ❌ Dati AI insufficienti (prezzo/brand/ref). Annuncio saltato."); continue
            
        listing_price_eur = convert_to_eur(ai_data['listing_price'], ai_data.get('currency'))
        if not listing_price_eur: continue

        query = f"{ai_data.get('brand','')} {ai_data.get('reference_number') or ai_data.get('model','')}".strip()
        
        # --- TRIANGOLAZIONE DEI DATI IN PARALLELO ---
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_wc = executor.submit(get_watchcharts_price, query)
            future_ebay = executor.submit(get_ebay_sold_price, query)
            future_c24 = executor.submit(get_chrono24_listings, query)
            
            wc_price = future_wc.result()
            ebay_price = future_ebay.result()
            c24_listings = future_c24.result()
        
        # Calcolo prezzo mediano di Chrono24
        c24_prices = [p['price'] for p in c24_listings]
        c24_median_price = statistics.median(c24_prices) if len(c24_prices) >=3 else None

        # --- CALCOLO PREZZO DI MERCATO AGGREGATO ---
        valid_prices = [p for p in [wc_price, ebay_price, c24_median_price] if p is not None]
        
        if len(valid_prices) < 2: # Richiediamo almeno 2 fonti per un dato affidabile
            print(f"  - ❌ Dati di mercato insufficienti (trovate solo {len(valid_prices)} fonti). Annuncio saltato.")
            continue
            
        aggregated_market_price = int(statistics.median(valid_prices))
        print(f"  -> Prezzo Annuncio: {listing_price_eur}€, Prezzo Mercato Aggregato: {aggregated_market_price}€")
        
        if listing_price_eur > aggregated_market_price:
             print(f"  - ❌ Scartato: Prezzo > Mercato."); continue
        
        margin, ai_score, deal_label = calculate_final_metrics(listing_price_eur, aggregated_market_price)
        
        print(f"  -> ✅ AFFARE VALIDATO! Margin: {margin}%, Score: {ai_score}")
        
        # ... Logica per aggiungere a 'deals_to_save' e poi al batch ...

    # ... Logica finale di caricamento ...

if __name__ == "__main__":
    run()
