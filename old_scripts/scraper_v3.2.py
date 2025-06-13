import requests
import json
import re
import firebase_admin
from firebase_admin import credentials, firestore
import time
import random

# ... (le definizioni di COLLECTION_NAME, SERVICE_ACCOUNT_KEY_PATH e l'inizializzazione di Firebase rimangono identiche) ...
COLLECTION_NAME = "deals"
SERVICE_ACCOUNT_KEY_PATH = "serviceAccountKey.json"

if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)
db = firestore.client()
print("✅ Connessione a Firestore riuscita!")

# HEADERS PIU' COMPLETI PER SIMULARE UN BROWSER
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
}

# ... (le funzioni parse_title e parse_price rimangono identiche) ...
KNOWN_BRANDS = ["rolex", "omega", "seiko", "patek philippe", "audemars piguet", "cartier", "tudor", "tag heuer", "breitling", "panerai"]
def parse_title(title):
    # ... (codice identico a prima)
    title_lower = title.lower(); brand, model, ref = "Unknown", title, "N/A"
    for b in KNOWN_BRANDS:
        if b in title_lower:
            brand = b.title(); model = re.sub(r'\[wts\]', '', title, flags=re.IGNORECASE).strip(); model = re.sub(brand, '', model, flags=re.IGNORECASE).strip(); break
    match = re.search(r'\b(\d{4,6}[A-Z]{0,2})\b', title);
    if match: ref = match.group(1); model = model.replace(ref, '').strip()
    return brand, model, ref
def parse_price(title):
    # ... (codice identico a prima)
    match = re.search(r'[\$€£]?\s*(\d{1,3}(?:[.,]\d{3})*|\d+)', title);
    if match: price_str = match.group(1).replace('.', '').replace(',', ''); return int(price_str)
    return None

def run_full_etl():
    print(f"\n📡 [EXTRACT] Contattando Reddit con headers avanzati...")
    response = requests.get("https://www.reddit.com/r/Watchexchange/new.json?limit=100", headers=HEADERS)
    
    # BLOCCO DI DEBUG PER L'ERRORE JSON
    try:
        raw_data = response.json()
        posts = raw_data['data']['children']
    except json.JSONDecodeError:
        print("❌ ERRORE: La risposta da Reddit non è un JSON valido.")
        print(f"Status Code: {response.status_code}")
        print(f"Contenuto della risposta ricevuto (primi 500 caratteri): {response.text[:500]}")
        return # Esce dalla funzione se non può processare i dati
        
    print(f"✅ Trovati {len(posts)} post.")

    # ... (il resto della funzione con TRANSFORM e LOAD rimane identico) ...
    print("\n🔄 [TRANSFORM] Mappatura dei dati sulla struttura 'WatchDeal'...")
    deals_to_upload = []
    for post in posts:
        post_data = post['data']
        if '[wts]' in post_data['title'].lower():
            brand, model, ref = parse_title(post_data['title']); listing_price = parse_price(post_data['title'])
            deal = { "id": post_data['id'], "imageUrl": post_data.get('thumbnail', 'N/A') if 'http' in post_data.get('thumbnail', '') else None, "brand": brand, "model": model, "referenceNumber": ref, "listingPrice": listing_price, "marketPrice": int(listing_price * 0.95) if listing_price else None, "retailPrice": None, "aiScore": random.randint(60, 95), "estimatedMarginPercent": round(random.uniform(-5.0, 20.0), 2), "dealLabel": random.choice(["🔥 Affare", "👍 OK"]), "tags": ["#RedditDeal", "#VerifiedSeller"] if random.random() > 0.5 else ["#RedditDeal"], "sourceUrl": "https://www.reddit.com" + post_data['permalink'], "description": post_data.get('selftext', ''), "condition": "Used", "lastUpdated": firestore.SERVER_TIMESTAMP }
            deals_to_upload.append(deal)
    print(f"✅ Mappati {len(deals_to_upload)} annunci.")
    print(f"\n📤 [LOAD] Caricamento dati su Firestore nella collezione '{COLLECTION_NAME}'...")
    batch = db.batch();
    for deal in deals_to_upload: doc_ref = db.collection(COLLECTION_NAME).document(deal['id']); batch.set(doc_ref, deal)
    batch.commit()
    print(f"✅ Caricati {len(deals_to_upload)} annunci.")
    print("\n🎉 Processo ETL completato con successo!")

if __name__ == "__main__":
    run_full_etl()
