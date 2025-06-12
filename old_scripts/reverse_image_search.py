# reverse_image_search.py (v2.1 - Download con FlareSolverr)
import os
import requests
import json
from serpapi import GoogleSearch

# --- CONFIGURAZIONE ---
SERPAPI_API_KEY = "93fbe21acb69ab56d8557f5d35c3aa428b1d71dfed7ecb7c084528aa87135a3f"
IMGBB_API_KEY = "3124ba2d18ff427a910ae03dc0d115b7"
FLARESOLVERR_URL = "http://localhost:8191/v1"

def download_image_with_flaresolverr(image_url: str):
    """Usa FlareSolverr per ottenere i dati dell'immagine, bypassando i blocchi."""
    print(f"  [Downloader] Tento il download via FlareSolverr: {image_url[:60]}...")
    
    payload = {"cmd": "request.get", "url": image_url, "maxTimeout": 120000}
    
    try:
        # 1. Chiediamo a FlareSolverr di visitare l'URL dell'immagine
        response = requests.post(FLARESOLVERR_URL, headers={"Content-Type": "application/json"}, json=payload)
        response.raise_for_status()
        data = response.json()

        if data.get("status") == "ok" and "solution" in data:
            print("  [Downloader] ✅ Sfida per l'immagine risolta!")
            # 2. Otteniamo i cookie e l'user-agent che hanno funzionato
            cookies = {c['name']: c['value'] for c in data['solution']['cookies']}
            user_agent = data['solution']['userAgent']
            
            # 3. Ora facciamo una richiesta DIRETTA con i cookie per ottenere i dati binari
            print("    - Eseguo il download diretto con i cookie di sessione...")
            image_response = requests.get(image_url, headers={'User-Agent': user_agent}, cookies=cookies, timeout=30)
            image_response.raise_for_status()
            print("    - ✅ Download completato.")
            return image_response.content
        else:
            print(f"  [Downloader] ❌ Errore da FlareSolverr: {data.get('message')}")
            return None
    except Exception as e:
        print(f"  [Downloader] ❌ Errore durante il processo di download con FlareSolverr: {e}")
        return None

def upload_to_imgbb(image_content: bytes):
    # ... (questa funzione non cambia) ...
    print("  [Uploader] Caricamento su ImgBB...")
    upload_url = "https://api.imgbb.com/1/upload"
    payload = {"key": IMGBB_API_KEY}
    files = {'image': image_content}
    try:
        response = requests.post(upload_url, params=payload, files=files, timeout=30)
        response.raise_for_status()
        result = response.json()
        if result.get("data") and result["data"].get("url"):
            public_url = result["data"]["url"]
            print(f"  [Uploader] ✅ Upload completato. URL Pubblico: {public_url}")
            return public_url
        else:
            print(f"  [Uploader] ❌ Errore nella risposta di ImgBB: {result}")
            return None
    except Exception as e:
        print(f"  [Uploader] ❌ Errore durante l'upload: {e}")
        return None

def get_watch_info_from_public_url(public_image_url: str):
    # ... (questa funzione non cambia) ...
    print(f"  [SerpApi] Avvio ricerca inversa per l'URL pubblico...")
    params = {"engine": "google_lens", "url": public_image_url, "api_key": SERPAPI_API_KEY}
    try:
        search = GoogleSearch(params)
        results = search.get_dict()
        visual_matches = results.get("visual_matches", [])
        text_searches = results.get("text_searches", [])
        best_guess = text_searches[0]['text'] if text_searches and text_searches[0].get('text') else None
        top_match_title = visual_matches[0]['title'] if visual_matches else None
        print("  [SerpApi] ✅ Analisi completata.")
        return {"best_guess": best_guess, "top_match_title": top_match_title}
    except Exception as e:
        print(f"  [SerpApi] ❌ Errore durante la ricerca: {e}")
        return None

# --- ORCHESTRATORE ---
def analyze_image_from_reddit(reddit_image_url: str):
    # 1. DOWNLOAD (con FlareSolverr)
    image_content = download_image_with_flaresolverr(reddit_image_url)
    if not image_content: return None
    
    # 2. UPLOAD
    public_url = upload_to_imgbb(image_content)
    if not public_url: return None
        
    # 3. ANALYSIS
    watch_info = get_watch_info_from_public_url(public_url)
    return watch_info

if __name__ == '__main__':
    test_image_url = "https://preview.redd.it/wts-rolex-submariner-no-date-124060-v0-x1t9q7y4a5yc1.jpg?width=3024&format=pjpg&auto=webp&s=d5e08472506b3db3c57065f462a634479101c402"
    
    print("\n--- Test v2.1 (Download con FlareSolverr) ---")
    final_result = analyze_image_from_reddit(test_image_url)
    
    if final_result:
        print("\n✅ Informazioni finali estratte con successo:")
        print(f"   - Migliore Ipotesi di Google: {final_result.get('best_guess')}")
        print(f"   - Titolo della Corrispondenza Migliore: {final_result.get('top_match_title')}")
    else:
        print("\n❌ Processo di analisi fallito.")
