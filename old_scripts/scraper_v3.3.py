# scraper_v3.3.py (versione Stabile per le immagini)
import requests
import json
import re
import firebase_admin
from firebase_admin import credentials, firestore
import time
import random

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
    exit()

# Headers per simulare un browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
}

# Funzioni di parsing
KNOWN_BRANDS = ["rolex", "omega", "seiko", "patek philippe", "audemars piguet", "cartier", "tudor", "tag heuer", "breitling", "panerai"]
def parse_title(title):
    title_lower = title.lower(); brand, model, ref = "Unknown", title, "N/A"
    for b in KNOWN_BRANDS:
        if b in title_lower:
            brand = b.title(); model = re.sub(r'\[wts\]', '', title, flags=re.IGNORECASE).strip(); model = re.sub(brand, '', model, flags=re.IGNORECASE).strip(); break
    match = re.search(r'\b(\d{4,6}[A-Z]{0,2})\b', title);
    if match: ref = match.group(1); model = model.replace(ref, '').strip()
    return brand, model, ref

def parse_price(title):
    match = re.search(r'[\$€£]?\s*(\d{1,3}(?:[.,]\d{3})*|\d+)', title);
    if match: price_str = match.group(1).replace('.', '').replace(',', ''); return int(price_str)
    return None

# VERSIONE STABILE della funzione per ottenere le immagini
def get_high_res_images_from_post(post_url):
    try:
        full_url = f"{post_url.rstrip('/')}.json"
        response = requests.get(full_url, headers=HEADERS)
        response.raise_for_status()
        post_data = response.json()

        media_metadata = post_data[0]['data']['children'][0]['data'].get('media_metadata')

        if media_metadata:
            image_urls = []
            sorted_media_ids = sorted(media_metadata.keys())

            for media_id in sorted_media_ids:
                if media_metadata[media_id]['status'] == 'valid' and media_metadata[media_id]['e'] == 'Image':
                    source = media_metadata[media_id].get('s', {})
                    
                    hi_res_url = None
                    if 'p' in source and source['p']:
                        hi_res_url = source['p'][-1]['u']
                    elif 'u' in source:
                        hi_res_url = source.get('u')

                    if hi_res_url:
                        # RIPRISTINO: Rimuoviamo solo l'escaping HTML, non i parametri '?'
                        clean_url = hi_res_url.replace('amp;', '')
                        image_urls.append(clean_url)
            if image_urls:
                return image_urls

    except Exception as e:
        print(f"    - Errore nel recuperare la galleria: {e}")
    
    # Fallback se la galleria non funziona
    try:
        post_json = response.json()
        main_image = post_json[0]['data']['children'][0]['data'].get('url_overridden_by_dest')
        if main_image and main_image.endswith(('.jpg', '.png', '.jpeg')):
            # RIPRISTINO: Rimuoviamo solo l'escaping HTML
            return [main_image.replace('amp;','')]
    except:
        pass
    
    return []

# Processo ETL
def run_full_etl():
    print(f"\n📡 [EXTRACT] Contattando Reddit per la lista dei post...")
    response = requests.get("https://www.reddit.com/r/Watchexchange/new.json?limit=25", headers=HEADERS)
    
    try:
        posts = response.json()['data']['children']
    except json.JSONDecodeError:
        print(f"❌ ERRORE: La risposta da Reddit non è un JSON valido. Status: {response.status_code}. Contenuto: {response.text[:200]}")
        return
        
    print(f"✅ Trovati {len(posts)} post. Inizio analisi dettagliata...")

    deals_to_upload = []
    for i, post in enumerate(posts):
        post_data = post['data']
        if '[wts]' in post_data['title'].lower():
            print(f"  -> Analizzo post {i+1}/{len(posts)}: {post_data['title'][:50]}...")
            
            post_url = "https://www.reddit.com" + post_data['permalink']
            image_urls = get_high_res_images_from_post(post_url)
            
            if not image_urls:
                thumbnail = post_data.get('thumbnail')
                if thumbnail and 'http' in thumbnail:
                    image_urls.append(thumbnail)
                else:
                    print("     - Annuncio saltato: nessuna immagine trovata.")
                    continue
            
            brand, model, ref = parse_title(post_data['title'])
            listing_price = parse_price(post_data['title'])

            deal = {
                "id": post_data['id'],
                "imageUrls": image_urls,
                "imageUrl": image_urls[0],
                "brand": brand, "model": model, "referenceNumber": ref,
                "listingPrice": listing_price,
                "marketPrice": int(listing_price * 0.95) if listing_price else None,
                "retailPrice": None,
                "aiScore": random.randint(60, 95),
                "estimatedMarginPercent": round(random.uniform(-5.0, 20.0), 2),
                "dealLabel": random.choice(["🔥 Affare", "👍 OK"]),
                "tags": ["#RedditDeal"],
                "sourceUrl": post_url,
                "description": post_data.get('selftext', ''),
                "condition": "Used",
                "lastUpdated": firestore.SERVER_TIMESTAMP
            }
            deals_to_upload.append(deal)
            time.sleep(1.5)

    print(f"\n✅ Mappati {len(deals_to_upload)} annunci con immagini dettagliate.")
    
    if not deals_to_upload:
        print("Nessun nuovo affare da caricare. Termino.")
        return

    print(f"📤 [LOAD] Caricamento di {len(deals_to_upload)} affari su Firestore...")
    batch = db.batch()
    for deal in deals_to_upload:
        doc_ref = db.collection(COLLECTION_NAME).document(deal['id'])
        batch.set(doc_ref, deal, merge=True)
    batch.commit()
    print(f"✅ Caricamento completato.")
    print("\n🎉 Processo ETL completato con successo!")

if __name__ == "__main__":
    run_full_etl()
