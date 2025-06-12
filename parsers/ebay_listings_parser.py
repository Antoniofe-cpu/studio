# Contenuto per il NUOVO file: parsers/ebay_listings_parser.py

import requests
import time

def fetch_ebay_listings(client_id, site_id="EBAY-IT", keywords="orologio usato"):
    """
    Recupera gli annunci attivi da eBay per una data parola chiave.
    """
    print(f"  -> 🛒 [eBay Listings] Ricerca annunci attivi per: '{keywords}'")
    if not client_id or "FerraraA-watch-PRD-e4735744e-2dc03c62" in client_id:
        print("  -> ⚠️ [eBay Listings] Client ID non fornito. Salto la ricerca.")
        return []

    api_endpoint = "https://svcs.ebay.com/services/search/FindingService/v1"
    params = {
        "OPERATION-NAME": "findItemsAdvanced",
        "SERVICE-VERSION": "1.13.0",
        "SECURITY-APPNAME": client_id,
        "RESPONSE-DATA-FORMAT": "JSON",
        "GLOBAL-ID": site_id,
        "keywords": keywords,
        "paginationInput.entriesPerPage": "50",
        "categoryId": "31387",  # Categoria "Watches, Parts & Accessories"
        "sortOrder": "StartTimeNewest", # Mostra prima i più recenti
        "itemFilter(0).name": "ListingType",
        "itemFilter(0).value(0)": "FixedPrice", # Solo "Compralo Subito"
        "itemFilter(0).value(1)": "Auction", # e Aste
    }

    try:
        response = requests.get(api_endpoint, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()

        if data.get('findItemsAdvancedResponse', [{}])[0].get('ack', ['Failure'])[0] != 'Success':
            print("  -> ❌ [eBay Listings] Risposta API non valida.")
            return []
        
        items = data['findItemsAdvancedResponse'][0].get('searchResult', [{}])[0].get('item', [])
        if not items:
            print("  -> 🤷 [eBay Listings] Nessun annuncio trovato.")
            return []

        deals = []
        for item in items:
            price_info = item.get('sellingStatus', [{}])[0].get('currentPrice', [{}])[0]
            price = int(float(price_info.get('__value__', 0)))
            
            # Prende l'immagine più grande disponibile se esiste
            image_url = item.get('galleryURL', [None])[0]
            if item.get('galleryInfoContainer'):
                image_url = item['galleryInfoContainer'][0].get('galleryURL', [{}])[0].get('__value__', image_url)

            deal_data = {
                "source": "eBay",
                "title": item.get('title', [''])[0],
                "listingPrice": price,
                "sourceUrl": item.get('viewItemURL', [''])[0],
                "imageUrl": image_url,
                "imageUrls": [image_url] if image_url else []
            }
            deals.append(deal_data)
        
        print(f"  -> ✅ [eBay Listings] Trovati {len(deals)} annunci attivi su eBay.")
        return deals
    except Exception as e:
        print(f"  -> ❌ [eBay Listings] Errore API: {e}")
        return []
