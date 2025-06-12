# image_analyzer.py (v1.2 - Download immagini con FlareSolverr)
import os
import requests
import json
from google.cloud import vision

# --- CONFIGURAZIONE ---
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'gcp_vision_credentials.json'
FLARESOLVERR_URL = "http://localhost:8191/v1"

try:
    vision_client = vision.ImageAnnotatorClient()
    print("✅ Client Google Vision AI inizializzato!")
except Exception as e:
    print(f"❌ ERRORE: Impossibile inizializzare Google Vision. Dettagli: {e}")
    vision_client = None

def download_image_with_flaresolverr(image_url: str):
    """
    Usa FlareSolverr per scaricare i dati binari di un'immagine.
    """
    print("    - Download via FlareSolverr...")
    # Per le immagini, non ci serve l'HTML, ma solo i byte.
    # FlareSolverr non ha un modo diretto per darci i byte, quindi scarichiamo
    # l'HTML di una pagina che contiene l'immagine (o l'immagine stessa) e
    # poi usiamo requests per scaricare l'URL dell'immagine che FlareSolverr ha usato.
    # Un approccio più semplice è chiedere a FlareSolverr la pagina e usare i suoi cookie.
    
    payload = {"cmd": "request.get", "url": image_url, "maxTimeout": 60000}
    
    try:
        # Chiediamo a FlareSolverr di risolvere la sfida e darci i cookie
        response = requests.post(FLARESOLVERR_URL, headers={"Content-Type": "application/json"}, json=payload)
        response.raise_for_status()
        data = response.json()

        if data.get("status") == "ok" and "solution" in data:
            # Prendiamo i cookie e l'user-agent usati da FlareSolverr
            flaresolverr_cookies = {c['name']: c['value'] for c in data['solution']['cookies']}
            flaresolverr_user_agent = data['solution']['userAgent']
            
            # Ora facciamo una seconda richiesta con i cookie e l'user-agent corretti
            print("    - Accesso diretto con cookie di FlareSolverr...")
            image_response = requests.get(image_url, headers={'User-Agent': flaresolverr_user_agent}, cookies=flaresolverr_cookies)
            image_response.raise_for_status()
            return image_response.content
        else:
            print(f"  [FlareSolverr] ❌ Errore: {data.get('message')}")
            return None
    except Exception as e:
        print(f"  [FlareSolverr] ❌ Errore durante il processo di download: {e}")
        return None

def analyze_watch_image(image_url: str):
    if not vision_client: return None
    print(f"  [VisionAI] Analizzo l'immagine da: {image_url[:60]}...")
    
    image_content = download_image_with_flaresolverr(image_url)
    
    if not image_content:
        print("  [VisionAI] ❌ Download fallito. Impossibile analizzare.")
        return None
    
    print("    - Download completato. Invio a Google Vision...")
    
    try:
        image = vision.Image(content=image_content)
        response_text = vision_client.text_detection(image=image)
        response_logos = vision_client.logo_detection(image=image)
        
        texts = response_text.text_annotations
        full_text = texts[0].description.replace('\n', ' ').strip() if texts else ""
        print(f"    - Testo rilevato: '{full_text[:100]}...'")

        logos = response_logos.logo_annotations
        brand = logos[0].description if logos else None
        if brand: print(f"    - Logo rilevato: '{brand}'")

        if response_text.error.message: raise Exception(response_text.error.message)
        
        return { "detected_brand": brand, "detected_text": full_text }
    except Exception as e:
        print(f"  [VisionAI] ❌ Errore durante l'analisi: {e}")
        return None

if __name__ == '__main__':
    test_image_url = "https://preview.redd.it/wts-rolex-submariner-no-date-124060-v0-x1t9q7y4a5yc1.jpg?width=3024&format=pjpg&auto=webp&s=d5e08472506b3db3c57065f462a634479101c402"
    print("\n--- Test dell'analizzatore di immagini (v1.2 con FlareSolverr) ---")
    analysis_result = analyze_watch_image(test_image_url)
    if analysis_result:
        print("\n✅ Analisi completata!")
        print(f"   - Brand dal Logo: {analysis_result['detected_brand']}")
        print(f"   - Testo dal Quadrante: {analysis_result['detected_text']}")
    else:
        print("\n❌ Analisi fallita.")
