# Contenuto FINALE e AGGIORNATO per: orchestrator.py
import os
import json
import time
import firebase_admin
from firebase_admin import credentials, firestore
import base64

from parsers.reddit_parser import fetch_reddit_deals
from parsers.forum_parser import scrape_all_forums
from parsers.ebay_analyzer import EbayAnalyzer
from parsers.google_shopping_analyzer import GoogleShoppingAnalyzer
from parsers.ai_analyzer import GroqAnalyzer # <-- NUOVO
from utils.data_models import standardize_deal, calculate_margin

# --- CONFIGURAZIONE E INIZIALIZZAZIONE (invariata) ---
# ... (tutta la parte di configurazione delle chiavi e init di firebase rimane uguale) ...
COLLECTION_NAME = "deals_production"
try:
    SERVICE_ACCOUNT_B64 = os.environ['FIREBASE_SERVICE_ACCOUNT_JSON']
    SERVICE_ACCOUNT_JSON = json.loads(base64.b64decode(SERVICE_ACCOUNT_B64))
    CRED = credentials.Certificate(SERVICE_ACCOUNT_JSON)
except KeyError:
    SERVICE_ACCOUNT_JSON_PATH = "serviceAccountKey.json"
    CRED = credentials.Certificate(SERVICE_ACCOUNT_JSON_PATH)

SERPAPI_API_KEY = os.environ.get('SERPAPI_API_KEY')
EBAY_CLIENT_ID = os.environ.get('EBAY_CLIENT_ID')
GROQ_API_KEY = os.environ.get('GROQ_API_KEY') # <-- NUOVA CHIAVE

def initialize_firebase():
    if not firebase_admin._apps:
        firebase_admin.initialize_app(CRED); print("🔑 Firebase Admin SDK inizializzato.")
    return firestore.client()

def run_full_etl(db):
    print("\n🚀 Inizio processo ETL multi-fonte...")
    ebay_analyzer = EbayAnalyzer(EBAY_CLIENT_ID)
    gshopping_analyzer = GoogleShoppingAnalyzer(SERPAPI_API_KEY)
    groq_analyzer = GroqAnalyzer(GROQ_API_KEY) # <-- INIZIALIZZA L'AI
    
    # --- FASE 1: ESTRAZIONE ---
    all_deals_raw = []; all_deals_raw.extend(fetch_reddit_deals()); all_deals_raw.extend(scrape_all_forums())
    print(f"\n✅ Recuperati {len(all_deals_raw)} annunci grezzi.")
    
    # --- FASE 2: TRASFORMAZIONE & ARRICCHIMENTO ---
    deals_to_upload = []
    print("\n📊 Processamento e arricchimento annunci...")
    for raw_deal in all_deals_raw:
        deal = standardize_deal(raw_deal)
        if deal:
            query = f"{deal['brand']} {deal['model']} {deal['referenceNumber']}".replace("Unknown", "").replace("N/A", "").strip()
            if query:
                deal['marketPrice'] = ebay_analyzer.calculate_market_price(query)
                time.sleep(1)
                deal['retailPrice'] = gshopping_analyzer.find_grey_market_price(query)
                time.sleep(1)
                deal['estimatedMarginPercent'] = calculate_margin(deal['listingPrice'], deal['marketPrice'])
                
                # --- CHIAMATA ALLA NUOVA AI ---
                ai_score, ai_rationale = groq_analyzer.generate_ai_score(deal)
                deal['aiScore'] = ai_score
                deal['aiRationale'] = ai_rationale # Aggiungiamo la motivazione!
                time.sleep(1.5) # Pausa per l'API di Groq

            deals_to_upload.append(deal)

    print(f"    -> Processati {len(deals_to_upload)} annunci validi.")

    # --- FASE 3: CARICAMENTO ---
    if not deals_to_upload: print("\nNessun nuovo annuncio da caricare."); return
    print(f"\n📤 Caricamento di {len(deals_to_upload)} affari su Firestore...")
    batch = db.batch()
    for deal in deals_to_upload:
        if deal.get('id'):
            doc_ref = db.collection(COLLECTION_NAME).document(deal['id'])
            batch.set(doc_ref, deal, merge=True)
    batch.commit()
    print("✅ Caricamento completato.")
    print("\n🎉 Processo ETL terminato con successo!")

if __name__ == "__main__":
    db_client = initialize_firebase()
    if db_client:
        run_full_etl(db_client)
