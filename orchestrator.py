# Contenuto FINALE per: orchestrator.py
import os
import json
import time
import firebase_admin
from firebase_admin import credentials, firestore
import base64

# Importa i parser e le utility
from parsers.reddit_parser import fetch_reddit_deals
from parsers.forum_parser import scrape_all_forums
from parsers.ebay_analyzer import EbayAnalyzer
from parsers.google_shopping_analyzer import GoogleShoppingAnalyzer # <-- NUOVO
from utils.data_models import standardize_deal, calculate_margin, calculate_ai_score

# --- CONFIGURAZIONE ---
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

def initialize_firebase():
    if not firebase_admin._apps:
        firebase_admin.initialize_app(CRED)
        print("🔑 Firebase Admin SDK inizializzato.")
    return firestore.client()

def run_full_etl(db):
    print("\n🚀 Inizio processo ETL multi-fonte...")
    # Inizializza tutti gli analizzatori
    ebay_analyzer = EbayAnalyzer(EBAY_CLIENT_ID)
    gshopping_analyzer = GoogleShoppingAnalyzer(SERPAPI_API_KEY)
    
    # --- FASE 1: ESTRAZIONE (EXTRACT) ---
    all_deals_raw = []
    all_deals_raw.extend(fetch_reddit_deals())
    all_deals_raw.extend(scrape_all_forums())
    
    print(f"\n✅ Recuperati {len(all_deals_raw)} annunci grezzi.")
    
    # --- FASE 2: TRASFORMAZIONE (TRANSFORM) & ARRICCHIMENTO ---
    deals_to_upload = []
    print("\n📊 Processamento e arricchimento annunci...")
    for raw_deal in all_deals_raw:
        deal = standardize_deal(raw_deal)
        if deal:
            query = f"{deal['brand']} {deal['model']} {deal['referenceNumber']}".replace("Unknown", "").replace("N/A", "").strip()
            if query:
                # Arricchimento #1: Valore di Mercato da eBay
                deal['marketPrice'] = ebay_analyzer.calculate_market_price(query)
                time.sleep(1) # Pausa tra le chiamate API
                
                # Arricchimento #2: Prezzo Retail/Grigio da Google Shopping
                deal['retailPrice'] = gshopping_analyzer.find_grey_market_price(query)
                time.sleep(1) # Pausa tra le chiamate API

                # Arricchimento #3: Calcoli di Business Logic
                deal['estimatedMarginPercent'] = calculate_margin(deal['listingPrice'], deal['marketPrice'])
                deal['aiScore'] = calculate_ai_score(deal)
            
            deals_to_upload.append(deal)

    print(f"    -> Processati {len(deals_to_upload)} annunci validi.")

    # --- FASE 3: CARICAMENTO (LOAD) ---
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
