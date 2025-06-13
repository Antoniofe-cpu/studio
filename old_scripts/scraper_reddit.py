# scraper_reddit.py (versione con limite e pausa)
import requests
import time

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
}

def get_reddit_posts_with_details(limit=20): # Il default ora è 20
    """
    Ottiene gli ultimi post e per ognuno cerca di estrarre la galleria di immagini.
    Include una pausa per rispettare i limiti di rate di Reddit.
    """
    print(f"  [Reddit] Contattando Reddit per gli ultimi {limit} post...")
    url = f"https://www.reddit.com/r/Watchexchange/new.json?limit={limit}"
    try:
        # Prima chiamata per ottenere la lista dei post
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        posts = response.json()['data']['children']
        
        posts_with_details = []
        total_posts = len(posts)
        print(f"  [Reddit] Trovati {total_posts} post. Inizio analisi gallerie...")

        for i, post in enumerate(posts):
            post_data = post['data']
            post_url = "https://www.reddit.com" + post_data['permalink']
            
            # Non stampiamo nulla qui per mantenere il log pulito, la pausa è l'azione importante
            post_data['imageUrls'] = _get_images_from_post_page(post_url)
            posts_with_details.append(post_data)
            
            # --- PAUSA TRA UNA RICHIESTA DI DETTAGLIO E L'ALTRA ---
            # Questo è FONDAMENTALE per evitare l'errore 429
            time.sleep(0.5) # Attendi mezzo secondo
        
        print(f"  [Reddit] ✅ Analisi gallerie di {total_posts} post completata.")
        return posts_with_details
    except Exception as e:
        print(f"  [Reddit] ❌ Errore nel recuperare i post: {e}")
        return []

def _get_images_from_post_page(post_url):
    """
    Funzione helper per visitare la pagina di un singolo post e estrarre gli URL delle immagini.
    """
    try:
        full_url = f"{post_url.rstrip('/')}.json"
        response = requests.get(full_url, headers=HEADERS)
        response.raise_for_status()
        post_json = response.json()
        
        media_metadata = post_json[0]['data']['children'][0]['data'].get('media_metadata')
        if media_metadata:
            image_urls = []
            for media_id in sorted(media_metadata.keys()):
                media_item = media_metadata[media_id]
                if media_item['status'] == 'valid' and media_item['e'] == 'Image':
                    source = media_item.get('s', {})
                    hi_res_url = (source['p'][-1]['u'] if 'p' in source and source['p'] else source.get('u'))
                    if hi_res_url:
                        image_urls.append(hi_res_url.replace('amp;', ''))
            if image_urls:
                return image_urls
    except Exception:
        pass
    
    # Fallback finale
    try:
        # Riusiamo la variabile post_json se esiste già
        if 'post_json' not in locals():
            full_url = f"{post_url.rstrip('/')}.json"
            response = requests.get(full_url, headers=HEADERS)
            response.raise_for_status()
            post_json = response.json()
            
        main_image = post_json[0]['data']['children'][0]['data'].get('url_overridden_by_dest')
        if main_image and main_image.endswith(('.jpg', '.png', '.jpeg')):
            return [main_image.replace('amp;','')]
    except:
        pass

    return []
