# Contenuto per: utils/data_models.py
import re
import hashlib
from firebase_admin import firestore

# Elenco delle marche conosciute per migliorare il parsing
KNOWN_BRANDS = ["rolex", "omega", "seiko", "patek philippe", "audemars piguet", "cartier", "tudor", "tag heuer", "breitling", "panerai"]

def parse_title_and_brand(title):
    """
    Pulisce il titolo da tag comuni ([WTS], etc.) ed estrae Brand, Modello e Referenza.
    Restituisce un dizionario con i dati parsati e un titolo pulito.
    """
    # Rimuove tutti i tag comuni tra parentesi quadre e tonde all'inizio del titolo
    clean_title = re.sub(r'^(\[.*?\]|\(.*?\))\s*', '', title).strip()
    
    title_lower = clean_title.lower()
    brand, model, ref = "Unknown", clean_title, "N/A"
    
    for b in KNOWN_BRANDS:
        if b in title_lower:
            brand = b.title()
            # Pulisce il modello partendo dal titolo già pulito
            model = re.sub(brand, '', clean_title, flags=re.IGNORECASE).strip()
            break
            
    # Cerca un numero di referenza nel modello rimanente
    match = re.search(r'\b(\d{4,6}[A-Z]{0,2})\b', model)
    if match:
        ref = match.group(1)
        model = model.replace(ref, '').strip()
    
    # Pulizia finale del modello da caratteri spuri comuni
    model = model.strip(' -:/,')
    
    return {"brand": brand, "model": model, "referenceNumber": ref, "cleanTitle": clean_title}

def parse_price(text):
    """
    Estrae un prezzo da una stringa di testo, gestendo formati come 'k', simboli
    di valuta e numeri isolati. Ha una logica gerarchica per ridurre falsi positivi.
    """
    if not text: return None
    text_lower = text.lower()
    
    # Pattern 1: Cerca numeri seguiti da 'k' (es. 4.5k, 3k)
    match_k = re.search(r'(\d+([.,]\d+)?)\s*k', text_lower)
    if match_k:
        price_str = match_k.group(1).replace(',', '.')
        return int(float(price_str) * 1000)

    # Pattern 2: Cerca formati con simboli di valuta ($, €, £) prima o dopo
    match_currency = re.search(r'[\$€£]\s*(\d{1,3}(?:[.,]\d{3})*|\d+)|(\d{1,3}(?:[.,]\d{3})*|\d+)\s*[\$€£]', text_lower)
    if match_currency:
        price_str = (match_currency.group(1) or match_currency.group(2)).replace('.', '').replace(',', '')
        return int(price_str)

    # Pattern 3 (Fallback): Cerca un numero "isolato" di almeno 3 cifre
    match_isolated = re.search(r'\b(\d{3,})\b', text_lower)
    if match_isolated:
        return int(match_isolated.group(1))

    return None

def generate_deal_id(source, url):
    """Crea un ID unico e consistente per ogni annuncio basato sull'URL."""
    return f"{source}_{hashlib.sha1(url.encode()).hexdigest()[:12]}"

def calculate_margin(listing_price, market_price):
    """Calcola il margine percentuale stimato."""
    if not listing_price or not market_price or listing_price == 0:
        return None
    return round(((market_price - listing_price) / listing_price) * 100, 2)

def calculate_ai_score(deal):
    """
    Calcola un punteggio di "qualità dell'affare" basato su un sistema a regole.
    Un proxy efficace per un modello di AI più complesso.
    """
    if not deal.get("listingPrice") or not deal.get("marketPrice"):
        return None
        
    score = 50  # Punteggio base
    
    # Punteggio basato sul margine
    margin = deal.get("estimatedMarginPercent", 0)
    if margin > 20: score += 25
    elif margin > 10: score += 15
    elif margin > 0: score += 5
    elif margin < -10: score -= 20

    # Punteggio basato sulla marca (reputazione/liquidità)
    top_brands = ["Rolex", "Patek Philippe", "Audemars Piguet"]
    mid_brands = ["Omega", "Cartier", "Tudor"]
    if deal.get("brand") in top_brands: score += 15
    elif deal.get("brand") in mid_brands: score += 7

    # Punteggio basato sulla fonte
    if deal.get("source") == "Reddit": score += 5
    if deal.get("source") == "OmegaForums": score += 3

    # Punteggio basato sulla qualità dei dati
    if deal.get("imageUrls") and len(deal["imageUrls"]) > 3: score += 5
    if deal.get("referenceNumber") != "N/A": score += 5

    return min(max(int(score), 0), 100) # Assicura che il punteggio sia tra 0 e 100

def standardize_deal(raw_deal):
    """
    Prende i dati grezzi da una fonte e li trasforma nel formato standard
    per Firestore, preparandoli per l'arricchimento.
    """
    title = raw_deal.get('title', '')
    url = raw_deal.get('sourceUrl')
    
    if not title or not url:
        return None # Ignora annunci senza titolo o URL

    parsed_title_data = parse_title_and_brand(title)
    listing_price = raw_deal.get("listingPrice") or parse_price(title)
    
    # Un annuncio senza prezzo non è utile, lo scartiamo
    if not listing_price:
        return None

    deal = {
        "id": generate_deal_id(raw_deal.get("source"), url),
        "source": raw_deal.get("source"),
        "title": parsed_title_data["cleanTitle"], # Usa il titolo pulito per la visualizzazione
        "originalTitle": raw_deal.get('title', ''), # Mantiene il titolo originale per riferimento
        "brand": parsed_title_data["brand"],
        "model": parsed_title_data["model"],
        "referenceNumber": parsed_title_data["referenceNumber"],
        "listingPrice": listing_price,
        "marketPrice": None,
        "estimatedMarginPercent": None,
        "aiScore": None,
        "sourceUrl": url,
        "imageUrl": raw_deal.get("imageUrl"),
        "imageUrls": raw_deal.get("imageUrls", []),
        "description": raw_deal.get("description", ""),
        "condition": "Used",
        "postDate": raw_deal.get("postDate"), # Campo per la data del post (se disponibile)
        "lastUpdated": firestore.SERVER_TIMESTAMP # Questo si aggiorna ad ogni esecuzione
    }
    return deal
