import serpapi

def fetch_google_shopping_deals(api_key, query="used watch"):
    print(f"  -> 📈 [SerpApi] Ricerca su Google Shopping per: '{query}'")
    if not api_key or "LA_TUA_CHIAVE" in api_key:
        print("  -> ⚠️ [SerpApi] API Key non fornita. Salto la ricerca.")
        return []
        
    params = {
        "engine": "google_shopping", "q": query, "api_key": api_key, "num": "20",
        "tbs": "p_ord:p,merchagg:g,pdtr0:963899|963901"
    }
    try:
        client = serpapi.Client()
        results = client.search(params)
        shopping_results = results.get('shopping_results', [])
        
        deals = []
        for item in shopping_results:
            price_str = item.get("price", "$0").replace("$", "").replace(",", "")
            deal_data = {
                "source": "GoogleShopping", "title": item.get("title"),
                "listingPrice": int(float(price_str)),
                "sourceUrl": item.get("link"), "imageUrl": item.get("thumbnail")
            }
            deals.append(deal_data)
        
        print(f"  -> ✅ [SerpApi] Trovati {len(deals)} annunci su Google Shopping.")
        return deals
    except Exception as e:
        print(f"  -> ❌ [SerpApi] Errore: {e}")
        return []
