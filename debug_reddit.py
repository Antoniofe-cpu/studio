# Contenuto per il nuovo file: debug_reddit.py

import requests
import json
import logging

# --- Configurazione ---
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
REDDIT_URL = "https://www.reddit.com/r/Watchexchange/new.json?limit=1"
HEADERS = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'}

def inspect_first_post():
    """
    Scarica il primo post da /r/Watchexchange e stampa i suoi dati grezzi.
    """
    logging.info(f"Contattando Reddit per il primo post...")
    try:
        response = requests.get(REDDIT_URL, headers=HEADERS)
        response.raise_for_status()
        # Prendiamo solo il primo post
        post_data = response.json()['data']['children'][0]['data']
    except Exception as e:
        logging.error(f"Impossibile recuperare il post da Reddit: {e}")
        return

    print("\n" + "="*50)
    print("--- ANALISI DEL PRIMO POST RECUPERATO ---")
    print("="*50)
    
    # Stampa i campi che stiamo usando ora
    print("\n[1] TITOLO (dal campo 'title'):")
    print(post_data.get('title'))

    print("\n[2] CORPO DEL POST (dal campo 'selftext'):")
    selftext = post_data.get('selftext')
    if not selftext:
        print(">>> ATTENZIONE: IL CAMPO 'selftext' È VUOTO! <<<")
        print("Questo è probabilmente il motivo per cui l'AI non trova prezzo e immagini.")
    else:
        print(selftext)

    print("\n[3] CONTENUTO COMPLETO DEL POST (JSON GREZZO):")
    # Stampa l'intero dizionario per trovare i dati mancanti
    print(json.dumps(post_data, indent=2))
    
    print("\n" + "="*50)
    print("--- FINE ANALISI ---")
    logging.info("Controlla l'output qui sopra. Se 'selftext' è vuoto, il prezzo e le immagini sono in altri campi del JSON completo.")

if __name__ == "__main__":
    inspect_first_post()
