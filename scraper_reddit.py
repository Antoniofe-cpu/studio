import requests
import json
import re

# URL del subreddit in formato JSON. Prendiamo i post "new".
# Il "?limit=100" chiede fino a 100 post.
SUBREDDIT_URL = "https://www.reddit.com/r/Watchexchange/new.json?limit=100"

# Header per sembrare un browser normale
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
}

def parse_price_from_title(title):
    """
    Tenta di estrarre un prezzo dal titolo usando espressioni regolari.
    Cerca formati come $1234, 1234$, 1.234€, etc.
    """
    # Cerca pattern come $5000, $5,000, 5000$, 5000 € etc.
    match = re.search(r'[\$€£]?\s*(\d{1,3}(?:[.,]\d{3})*|\d+)\s*[\$€£]?', title)
    if match:
        # Pulisce il numero da punti o virgole e lo converte in un intero
        price_str = match.group(1).replace('.', '').replace(',', '')
        return int(price_str)
    return None

def scrape_watchexchange():
    print(f"📡 Contattando Reddit all'URL: {SUBREDDIT_URL}")
    
    try:
        response = requests.get(SUBREDDIT_URL, headers=HEADERS)
        response.raise_for_status() # Controlla se ci sono errori HTTP

        # Il contenuto della risposta è già in formato JSON
        data = response.json()
        
        # I post si trovano dentro 'data' -> 'children'
        posts = data['data']['children']
        
        print(f"✅ Trovati {len(posts)} post. Inizio analisi...")
        
        deals = []
        for post in posts:
            post_data = post['data']
            
            # Filtriamo solo i post che contengono [WTS] (Want To Sell)
            if '[wts]' in post_data['title'].lower():
                
                price = parse_price_from_title(post_data['title'])
                
                deal = {
                    "source": "Reddit",
                    "id": post_data['id'],
                    "title": post_data['title'],
                    "price_usd_guess": price, # È una stima, potrebbe non essere in USD
                    "url": "https://www.reddit.com" + post_data['permalink'],
                    "image_url": post_data.get('thumbnail', 'N/A'),
                    "author": post_data['author'],
                    "created_utc": post_data['created_utc']
                }
                deals.append(deal)

        print(f"🔍 Filtrati {len(deals)} annunci '[WTS]'.")
        
        # Salviamo i risultati in un file JSON
        output_filename = "reddit_deals.json"
        with open(output_filename, 'w', encoding='utf-8') as f:
            json.dump(deals, f, ensure_ascii=False, indent=4)
        
        print(f"\n🎉 Successo! I dati sono stati salvati nel file '{output_filename}'.")
        
        # Stampiamo i primi 3 risultati per un controllo veloce
        print("\n--- Esempio dei dati estratti ---")
        print(json.dumps(deals[:3], indent=2, ensure_ascii=False))


    except requests.exceptions.RequestException as e:
        print(f"\n❌ Errore di Rete o HTTP: {e}")
    except Exception as e:
        print(f"\n❌ Si è verificato un errore inaspettato: {e}")

if __name__ == "__main__":
    scrape_watchexchange()
