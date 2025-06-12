# Contenuto FINALE e DI PRODUZIONE per: orchestrator.py
import os, json, time, firebase_admin, base64, re
from firebase_admin import credentials, firestore
from parsers.reddit_parser import fetch_reddit_deals
from parsers.forum_parser import scrape_all_forums
from parsers.ebay_listings_parser import fetch_ebay_listings
from parsers.ebay_analyzer import EbayAnalyzer
from parsers.google_shopping_analyzer import GoogleShoppingAnalyzer
from parsers.ai_analyzer import GroqAnalyzer
from utils.data_models import standardize_deal, calculate_margin

# --- CONFIGURAZIONE ---
COLLECTION_NAME = "deals_production"
try:
    # Carica TUTTE le credenziali dalle variabili d'ambiente (metodo per produzione)
    SERVICE_ACCOUNT_B64 = os.environ['FIREBASE_SERVICE_ACCOUNT_JSON']
    SERVICE_ACCOUNT_JSON_STR = base64.b64decode(SERVICE_ACCOUNT_B64).decode('utf-8')
    SERVICE_ACCOUNT_DICT = json.loads(SERVICE_ACCOUNT_JSON_STR)
    CRED = credentials.Certificate(SERVICE_ACCOUNT_DICT)
    
    SCRAPINGBEE_API_KEY = os.environ.get('SCRAPINGBEE_API_KEY')
    EBAY_CLIENT_ID = os.environ.get('EBAY_CLIENT_ID')
    GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
except KeyError as e:
    print(f"❌ ERRORE CRITICO: La variabile d'ambiente di produzione {e} non è stata impostata.")
    exit()

def initialize_firebase():
    if not firebase_admin._apps:
        firebase_admin.initialize_app(CRED)
        print("🔑 Firebase Admin SDK inizializzato.")
    return firestore.client()

def run_full_etl(db):
    print("\n🚀 Inizio processo ETL...")
    ebay_analyzer = EbayAnalyzer(EBAY_CLIENT_ID)
    gshopping_analyzer = GoogleShoppingAnalyzer(SCRAPINGBEE_API_KEY)
    groq_analyzer = GroqAnalyzer(GROQ_API_KEY)
    
    # --- ESTRAZIONE ---
    all_deals_raw = []
    all_deals_raw.extend(fetch_reddit_deals())
    all_deals_raw.extend(fetch_ebay_listings(EBAY_CLIENT_ID))
    all_deals_raw.extend(scrape_all_forums())
    print(f"\n✅ Recuperati {len(all_deals_raw)} annunci grezzi.")
    
    # --- TRASFORMAZIONE E ARRICCHIMENTO ---
    deals_to_upload = []
    print("\n📊 Processamento e arricchimento annunci...")
    for raw_deal in all_deals_raw:
        deal = standardize_deal(raw_deal)
        if deal:
            brand = deal.get('brand')
            ref = deal.get('referenceNumber')
            
            clean_query = None
            if brand and brand != 'Unknown':
                query_parts = [brand]
                if ref and ref != 'N/A':
                    query_parts.append(ref)
                clean_query = " ".join(query_parts)

            if clean_query:
                print(f"    -> Analisi per '{deal['title'][:30]}...'. Query: '{clean_query}'")
                deal['marketPrice'] = ebay_analyzer.calculate_market_price(clean_query)
                time.sleep(1)
                deal['retailPrice'] = gshopping_analyzer.find_grey_market_price(clean_query)
                time.sleep(1)
                deal['estimatedMarginPercent'] = calculate_margin(deal['listingPrice'], deal['marketPrice'])
                if deal.get('listingPrice') and deal.get('marketPrice'):
                    ai_score, ai_rationale = groq_analyzer.generate_ai_score(deal)
                    deal['aiScore'] = ai_score
                    deal['aiRationale'] = ai_rationale
                    time.sleep(1)
            else:
                print(f"    -> ⚠️ Annuncio '{deal.get('originalTitle', 'Sconosciuto')[:30]}...' saltato.")
            deals_to_upload.append(deal)

    print(f"    -> Processati {len(deals_to_upload)} annunci validi.")
    
    # --- CARICAMENTO ---
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
