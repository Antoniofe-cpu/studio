import re
import hashlib
from firebase_admin import firestore

KNOWN_BRANDS = ["rolex", "omega", "seiko", "patek philippe", "audemars piguet", "cartier", "tudor", "tag heuer", "breitling", "panerai"]

def parse_title_and_brand(title):
    title_lower = title.lower(); brand, model, ref = "Unknown", title, "N/A"
    for b in KNOWN_BRANDS:
        if b in title_lower:
            brand = b.title(); model = re.sub(r'\[wts\]', '', title, flags=re.IGNORECASE).strip(); model = re.sub(brand, '', model, flags=re.IGNORECASE).strip(); break
    match = re.search(r'\b(\d{4,6}[A-Z]{0,2})\b', model);
    if match: ref = match.group(1); model = model.replace(ref, '').strip()
    model = model.strip(' -:/')
    return {"brand": brand, "model": model, "referenceNumber": ref}

def parse_price(text):
    if not text: return None
    match_k = re.search(r'(\d+([.,]\d+)?)\s*k', text, re.IGNORECASE);
    if match_k: price_str = match_k.group(1).replace(',', '.'); return int(float(price_str) * 1000)
    match_full = re.search(r'[\$€£]?\s*(\d{1,3}(?:[.,]\d{3})*|\d+)', text);
    if match_full: price_str = re.sub(r'[.,]', '', match_full.group(1)); return int(price_str)
    return None

def generate_deal_id(source, url):
    return f"{source}_{hashlib.sha1(url.encode()).hexdigest()[:10]}"

def calculate_margin(listing_price, market_price):
    if not listing_price or not market_price or listing_price == 0: return None
    return round(((market_price - listing_price) / listing_price) * 100, 2)

def calculate_ai_score(deal):
    if not deal.get("listingPrice") or not deal.get("marketPrice"): return None
    score = 50
    margin = deal.get("estimatedMarginPercent", 0)
    if margin > 20: score += 25
    elif margin > 10: score += 15
    elif margin > 0: score += 5
    elif margin < -10: score -= 20
    top_brands = ["Rolex", "Patek Philippe", "Audemars Piguet"]; mid_brands = ["Omega", "Cartier", "Tudor"]
    if deal.get("brand") in top_brands: score += 15
    elif deal.get("brand") in mid_brands: score += 7
    if deal.get("source") == "Reddit": score += 5
    if deal.get("source") == "OmegaForums": score += 3
    if deal.get("imageUrls") and len(deal["imageUrls"]) > 3: score += 5
    if deal.get("referenceNumber") != "N/A": score += 5
    return min(max(int(score), 0), 100)

def standardize_deal(raw_deal):
    title = raw_deal.get('title', ''); url = raw_deal.get('sourceUrl')
    if not title or not url: return None
    parsed_title_data = parse_title_and_brand(title)
    listing_price = raw_deal.get("listingPrice") or parse_price(title)
    if not listing_price: return None
    return {
        "id": generate_deal_id(raw_deal.get("source"), url), "source": raw_deal.get("source"),
        "title": title, "brand": parsed_title_data["brand"], "model": parsed_title_data["model"],
        "referenceNumber": parsed_title_data["referenceNumber"], "listingPrice": listing_price,
        "marketPrice": None, "estimatedMarginPercent": None, "aiScore": None,
        "sourceUrl": url, "imageUrl": raw_deal.get("imageUrl"), "imageUrls": raw_deal.get("imageUrls", []),
        "description": raw_deal.get("description", ""), "condition": "Used", "lastUpdated": firestore.SERVER_TIMESTAMP
    }
