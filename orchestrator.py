# Contenuto per: orchestrator.py
import os
import json
import time
import firebase_admin
from firebase_admin import credentials, firestore
import base64

# Importa i parser e le utility
from parsers.reddit_parser import fetch_reddit_deals
from parsers.serpapi_parser import fetch_google_shopping_deals
from parsers.forum_parser import scrape_all_forums
from parsers.ebay_analyzer import EbayAnalyzer
from utils.data_models import standardize_deal, calculate_margin, calculate_ai_score

# --- CONFIGURAZIONE ---
COLLECTION_NAME = "deals_production"

# Carica le chiavi dagli environment variables (per GitHub Actions)
try:
    SERVICE_ACCOUNT_B64 = os.environ['FIREBASE_SERVICE_ACCOUNT_JSON']
    SERVICE_ACCOUNT_JSON = json.loads(base64.b64decode(SERVICE_ACCOUNT_B64))
    CRED = credentials.Certificate(SERVICE_ACCOUNT_JSON)
except KeyError:
    # Fallback per l'esecuzione locale
    SERVICE_ACCOUNT_JSON_PATH = "serviceAccountKey.json"
    CRED = credentials.Certificate(SERVICE_ACCOUNT_JSON_PATH)

SERPAPI_API_KEY = os.environ.get('SERPAPI_API_KEY')
EBAY_CLIENT_ID = os.environ.get('EBAY_CLIENT_ID')

def initialize_firebase():
    """Inizializza la connessione a Firebase."""
    if not firebase_admin._apps:
        firebase_admin.initialize_app(CRED)
        print("🔑 Firebase Admin SDK inizializzato.")
    return firestore.client()

def run_full_etl(db):
    """Esegue l'intero processo di Estrazione, Trasformazione e Caricamento."""
    print("\n🚀 Inizio processo ETL multi-fonte...")
    ebay_analyzer = EbayAnalyzer(EBAY_CLIENT_ID)
    
    # --- FASE 1: ESTRAZIONE (EXTRACT) ---
    all_deals_raw = []
    all_deals_raw.extend(fetch_reddit_deals())
    all_deals_raw.extend(fetch_google_shopping_deals(SERPAPI_API_KEY))
    all_deals_raw.extend(scrape_all_forums())
    
    print(f"\n✅ Recuperati {len(all_deals_raw)} annunci grezzi.")
    
    # --- FASE 2: TRASFORMAZIONE (TRANSFORM) & ARRICCHIMENTO ---
    deals_to_upload = []
    print("\n📊 Processamento e arricchimento annunci...")
    for raw_deal in all_deals_raw:
        deal = standardize_deal(raw_deal)
        if deal:
            # Arricchimento con dati di mercato
            query = f"{deal['brand']} {deal['model']} {deal['referenceNumber']}".replace("Unknown", "").replace("N/A", "").strip()
            if query:
                deal['marketPrice'] = ebay_analyzer.calculate_market_price(query)
                
                # Arricchimento con calcoli di business logic
                deal['estimatedMarginPercent'] = calculate_margin(deal['listingPrice'], deal['marketPrice'])
                deal['aiScore'] = calculate_ai_score(deal)
                
                # Pausa per non sovraccaricare l'API di eBay
                time.sleep(1.2)
            
            deals_to_upload.append(deal)

    print(f"    -> Processati {len(deals_to_upload)} annunci validi.")

    # --- FASE 3: CARICAMENTO (LOAD) ---
    if not deals_to_upload:
        print("\nNessun nuovo annuncio da caricare.")
        return
    
    print(f"\n📤 Caricamento di {len(deals_to_upload)} affari su Firestore...")
    batch = db.batch()
    for deal in deals_to_upload:
        if deal.get('id'):
            doc_ref = db.collection(COLLECTION_NAME).document(deal['id'])
            # Usiamo set con merge=True. Questo crea un nuovo documento se l'ID
            # non esiste, oppure aggiorna i campi se l'ID esiste già.
            # Il campo 'lastUpdated' viene sempre aggiornato.
            batch.set(doc_ref, deal, merge=True)
            
    try:
        batch.commit()
        print("✅ Caricamento completato con successo.")
    except Exception as e:
        print(f"❌ ERRORE durante il caricamento su Firestore: {e}")

    print("\n🎉 Processo ETL terminato con successo!")

if __name__ == "__main__":
    db_client = initialize_firebase()
    if db_client:
        run_full_etl(db_client)
