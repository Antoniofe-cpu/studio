# Contenuto DEFINITIVO e FINALE per: orchestrator.py

import os, logging, firebase_admin, hashlib, time, json, base64
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

from parsers.reddit_ai_parser import fetch_reddit_deals_with_ai
from parsers.ebay_analyzer import EbayAnalyzer
from parsers.google_shopping_analyzer import GoogleShoppingAnalyzer # Importa la versione Playwright

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
load_dotenv()
COLLECTION_NAME = os.getenv("FIRESTORE_COLLECTION", "deals_final")

def load_credentials():
    try:
        b64_str = os.environ['FIREBASE_SERVICE_ACCOUNT_B64']
        # Non ci serve più una chiave per lo scraping di Google
        keys = {
            "groq": os.environ.get('GROQ_API_KEY'),
            "ebay": os.environ.get('EBAY_CLIENT_ID'),
        }
        return json.loads(base64.b64decode(b64_str).decode('utf-8')), keys
    except Exception as e:
        logging.critical(f"ERRORE CREDENZIALI: {e}")
        return None, {}

def initialize_firebase(cred_dict):
    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.Certificate(cred_dict))
    return firestore.client()

def calculate_margin(listing, market):
    return round(((market - listing) / listing) * 100, 1) if listing and market else None

def run_full_etl(db, keys):
    logging.info("🚀 Inizio ETL...")
    ebay = EbayAnalyzer(keys.get('ebay'))
    google = GoogleShoppingAnalyzer() # Non ha più bisogno di una chiave API
    
    deals = fetch_reddit_deals_with_ai(keys.get('groq'))
    logging.info(f"📊 Arricchimento di {len(deals)} affari...")
    batch = db.batch()
    
    for deal in deals:
        if not deal.get('price'): continue
        
        query = f"{deal.get('brand', '')} {deal.get('model', '')}"
        
        market_price = ebay.calculate_market_price(query)
        time.sleep(1)
        
        retail_price = google.find_retail_price(query) # Usa il nuovo analizzatore Playwright
        
        deal.update({"marketPrice": market_price, "retailPrice": retail_price, "estimatedMargin": calculate_margin(deal.get('price'), market_price)})
        
        deal_id = f"Reddit_{hashlib.sha1(deal['sourceUrl'].encode()).hexdigest()[:16]}"
        deal.update({"id": deal_id, "lastUpdated": firestore.SERVER_TIMESTAMP})
        
        batch.set(db.collection(COLLECTION_NAME).document(deal_id), deal, merge=True)
        logging.info(f"  -> Processato: {deal.get('title', '')[:30]}... | Mercato: {market_price} | Retail: {retail_price}")
        time.sleep(1)
        
    if deals:
        try:
            batch.commit()
            logging.info(f"✅ Caricati {len(deals)} affari.")
        except Exception as e:
            logging.error(f"  -> ❌ Errore durante il commit su Firebase: {e}")

    logging.info("🎉 ETL Terminato.")

if __name__ == "__main__":
    fb_creds, api_keys = load_credentials()
    if fb_creds and all(api_keys.get(k) for k in ["groq", "ebay"]):
        run_full_etl(initialize_firebase(fb_creds), api_keys)
    else:
        logging.critical("Processo interrotto: chiavi (Groq, eBay) mancanti.")
