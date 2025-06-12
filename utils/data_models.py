# Contenuto FINALE per: utils/data_models.py
import re, hashlib
from firebase_admin import firestore

KNOWN_BRANDS = ["rolex", "omega", "seiko", "patek philippe", "audemars piguet", "cartier", "tudor", "tag heuer", "breitling", "panerai", "doxa", "nomos", "longines", "mido", "hamilton", "bulova", "tissot", "rado"]

def parse_title_and_brand(title):
    """
    Logica di parsing FINALE. Estrae SOLO marca e referenza.
    La query di ricerca sarà costruita solo con questi due elementi.
    """
    clean_title = re.sub(r'\[.*?\]|\(.*?\)', '', title).strip()
    title_lower = clean_title.lower()
    
    brand = "Unknown"
    for b in KNOWN_BRANDS:
        if b in title_lower:
            brand = b.title()
            break
            
    ref = "N/A"
    # Cerca un pattern simile a un numero di referenza (es. 1234, 123-456, AB123)
    ref_match = re.search(r'\b([A-Z0-9-]{3,}[0-9]+[A-Z0-9-]*|[A-Z0-9]+[.-][A-Z0-9]+)\b', clean_title, re.IGNORECASE)
    if ref_match:
        ref = ref_match.group(1).upper()

    # Il "modello" è solo il testo rimanente per la visualizzazione. NON verrà usato per le query.
    model_display = re.sub(brand, '', clean_title, flags=re.IGNORECASE).strip(' -:/,')
    if ref != "N/A":
        model_display = model_display.replace(ref, '').strip(' -:/,')
    
    return {"brand": brand, "model": model_display, "referenceNumber": ref, "cleanTitle": f"{brand} {model_display}"}

# ... (le altre funzioni parse_price, generate_deal_id, etc. rimangono uguali) ...
def parse_price(text):
    if not text: return None
    match_full = re.search(r'[\$€£]?\s*(\d{1,3}(?:[.,]\d{3})*|\d+)', text)
    if match_full: price_str = re.sub(r'[.,]', '', match_full.group(1)); return int(price_str)
    return None

def generate_deal_id(source, url): return f"{source}_{hashlib.sha1(url.encode()).hexdigest()[:12]}"
def calculate_margin(listing_price, market_price):
    if not listing_price or not market_price or listing_price == 0: return None
    return round(((market_price - listing_price) / listing_price) * 100, 2)

def standardize_deal(raw_deal):
    title = raw_deal.get('title', ''); url = raw_deal.get('sourceUrl')
    if not title or not url: return None
    parsed_title_data = parse_title_and_brand(title)
    listing_price = raw_deal.get("listingPrice") or parse_price(title)
    if not listing_price: return None
    return {
        "id": generate_deal_id(raw_deal.get("source"), url), "source": raw_deal.get("source"),
        "title": parsed_title_data["cleanTitle"], "originalTitle": raw_deal.get('title', ''),
        "brand": parsed_title_data["brand"], "model": parsed_title_data["model"],
        "referenceNumber": parsed_title_data["referenceNumber"], "listingPrice": listing_price,
        "marketPrice": None, "estimatedMarginPercent": None, "aiScore": None,
        "sourceUrl": url, "imageUrl": raw_deal.get("imageUrl"), "imageUrls": raw_deal.get("imageUrls", []),
        "description": raw_deal.get("description", ""), "condition": "Used", "lastUpdated": firestore.SERVER_TIMESTAMP
    }
