import requests
import json
import re
import firebase_admin
from firebase_admin import credentials, firestore
import time

# --- CONFIGURAZIONE ---
# Il nome della collezione deve corrispondere a quello atteso dal frontend
# Se non hai un nome specifico, "deals" o "watches" sono comuni. Usiamo "deals".
COLLECTION_NAME = "deals" 
SERVICE_ACCOUNT_KEY_PATH = "serviceAccountKey.json"

# --- INIZIALIZZAZIONE FIREBASE ---
if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)
db = firestore.client()
print("✅ Connessione a Firestore riuscita!")

# --- LOGICA DI ESTRAZIONE DATI ---
KNOWN_BRANDS = ["rolex", "omega", "seiko", "patek philippe", "audemars piguet", "cartier", "tudor", "tag heuer", "breitling", "panerai"]

def parse_title(title):
    """Tenta di estrarre brand, modello e ref dal titolo."""
    title_lower = title.lower()
    brand, model, ref = "Unknown", title, "N/A" # Valori di default
    
    # 1. Trova il brand
    for b in KNOWN_BRANDS:
        if b in title_lower:
            brand = b.title() # Mette in maiuscolo la prima lettera
            # Rimuove il brand e [WTS] dal titolo per isolare il modello
            model = re.sub(r'\[wts\]', '', title, flags=re.IGNORECASE).strip()
            model = re.sub(brand, '', model, flags=re.IGNORECASE).strip()
            break # Trovato il primo brand, esce
    
    # 2. Cerca una referenza (molto semplificato)
    match = re.search(r'\b(\d{4,6}[A-Z]{0,2})\b', title) # Cerca numeri di 4-6 cifre
    if match:
        ref = match.group(1)
        model = model.replace(ref, '').strip() # Rimuove la ref dal modello

    return brand, model, ref

def parse_price(title):
    match = re.search(r'[\$€£]?\s*(\d{1,3}(?:[.,]\d{3})*|\d+)', title)
    if match:
        price_str = match.group(1).replace('.', '').replace(',', '')
        return int(price_str)
    return None

# --- PROCESSO ETL ---
def run_full_etl():
    print(f"\n📡 [EXTRACT] Contattando Reddit...")
    response = requests.get("https://www.reddit.com/r/Watchexchange/new.json?limit=100", headers={'User-Agent': 'Mozilla/5.0'})
    posts = response.json()['data']['children']
    print(f"✅ Trovati {len(posts)} post.")

    print("\n🔄 [TRANSFORM] Mappatura dei dati sulla struttura 'WatchDeal'...")
    deals_to_upload = []
    for post in posts:
        post_data = post['data']
        if '[wts]' in post_data['title'].lower():
            
            brand, model, ref = parse_title(post_data['title'])
            listing_price = parse_price(post_data['title'])

            # Mappatura 1:1 con la struttura WatchDeal
            deal = {
                # Campi Obbligatori dall'Interfaccia
                "id": post_data['id'],
                "imageUrl": post_data.get('thumbnail', 'N/A') if 'http' in post_data.get('thumbnail', '') else None,
                "brand": brand,
                "model": model,
                "referenceNumber": ref,
                "listingPrice": listing_price,
                "marketPrice": int(listing_price * 0.95) if listing_price else None, # Simuliamo un market price leggermente più basso
                "retailPrice": None, # Non abbiamo questo dato da Reddit
                "aiScore": random.randint(60, 95), # Simuliamo un punteggio AI
                "estimatedMarginPercent": round(random.uniform(-5.0, 20.0), 2), # Simuliamo un margine
                "dealLabel": random.choice(["🔥 Affare", "👍 OK"]), # Simuliamo un'etichetta
                "tags": ["#RedditDeal", "#VerifiedSeller"] if random.random() > 0.5 else ["#RedditDeal"], # Simuliamo dei tag
                "sourceUrl": "https://www.reddit.com" + post_data['permalink'],
                
                # Campi Aggiuntivi/di Sistema
                "description": post_data.get('selftext', ''),
                "condition": "Used", # Assumiamo usato da Reddit
                "lastUpdated": firestore.SERVER_TIMESTAMP
            }
            deals_to_upload.append(deal)
    
    print(f"✅ Mappati {len(deals_to_upload)} annunci.")

    print(f"\n📤 [LOAD] Caricamento dati su Firestore nella collezione '{COLLECTION_NAME}'...")
    batch = db.batch()
    for deal in deals_to_upload:
        doc_ref = db.collection(COLLECTION_NAME).document(deal['id'])
        batch.set(doc_ref, deal)
    
    batch.commit()
    print(f"✅ Caricati {len(deals_to_upload)} annunci.")
    print("\n🎉 Processo ETL completato! Controlla la tua interfaccia.")

if __name__ == "__main__":
    import random
    run_full_etl()
