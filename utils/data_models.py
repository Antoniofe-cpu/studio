import re
import hashlib
from firebase_admin import firestore

KNOWN_BRANDS = ["rolex", "omega", "seiko", "patek philippe", "audemars piguet", "cartier", "tudor", "tag heuer", "breitling", "panerai", "doxa", "nomos", "longines", "mido", "hamilton", "bulova", "tissot", "rado"]
STOP_WORDS = ['wts', 'full kit', 'full set', 'box and papers', 'b&p', 'mint', 'excellent', 'unworn', 'bnib', 'lnib', 'reduced', 'repost', 'price drop']

def parse_title(title):
    clean_title = re.sub(r'\[.*?\]|\(.*?\)', '', title).strip()
    title_lower = clean_title.lower()
    
    brand = "Unknown"
    for b in KNOWN_BRANDS:
        if b in title_lower:
            brand = b.title()
            break
            
    ref = "N/A"
    ref_match = re.search(r'\b([a-zA-Z0-9]{2,}[.-][a-zA-Z0-9.-]+|[0-9]{4,})\b', clean_title, re.IGNORECASE)
    if ref_match:
        ref_candidate = ref_match.group(1).upper()
        if not (ref_candidate.isdigit() and (1900 < int(ref_candidate) < 2100 or int(ref_candidate) > 9000)):
            ref = ref_candidate

    model_str = re.sub(re.escape(brand), '', clean_title, flags=re.IGNORECASE)
    if ref != "N/A":
        model_str = re.sub(re.escape(ref), '', model_str, flags=re.IGNORECASE)

    for word in STOP_WORDS:
        model_str = re.sub(r'\b' + re.escape(word) + r'\b', '', model_str, flags=re.IGNORECASE)
        
    model_sanitized = re.sub(r'[^a-zA-Z0-9\s]', '', model_str)
    model_for_display = ' '.join(model_sanitized.split())

    query_parts = [brand, model_for_display, ref]
    final_query = " ".join(p for p in query_parts if p and p not in ["Unknown", "N/A"])

    return {
        "brand": brand,
        "model_for_display": model_for_display,
        "referenceNumber": ref,
        "api_query": final_query
    }

def standardize_deal(raw_deal):
    title = raw_deal.get('title')
    url = raw_deal.get('sourceUrl')
    if not title or not url: return None
        
    parsed_data = parse_title(title)
    listing_price = raw_deal.get("listingPrice")
    if not listing_price: return None

    deal_id = f"{raw_deal.get('source')}_{hashlib.sha1(url.encode()).hexdigest()[:16]}"
    
    return {
        "id": deal_id, "source": raw_deal.get("source"),
        "title": f"{parsed_data['brand']} {parsed_data['model_for_display']}".strip(),
        "originalTitle": title, "brand": parsed_data["brand"], "model": parsed_data["model_for_display"],
        "referenceNumber": parsed_data["referenceNumber"], "api_query": parsed_data["api_query"],
        "listingPrice": listing_price, "marketPrice": None, "retailPrice": None, "estimatedMarginPercent": None,
        "aiScore": None, "aiRationale": None, "sourceUrl": url, "imageUrl": raw_deal.get("imageUrl"),
        "imageUrls": raw_deal.get("imageUrls", []), "description": raw_deal.get("description", ""),
        "condition": "Used", "lastUpdated": firestore.SERVER_TIMESTAMP, "postDate": raw_deal.get("postDate")
    }

def calculate_margin(listing_price, market_price):
    if not listing_price or not market_price or market_price == 0: return None
    return round(((market_price - listing_price) / listing_price) * 100, 1)
