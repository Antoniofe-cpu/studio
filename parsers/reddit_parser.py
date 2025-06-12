import requests
import re
import time

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
}

def _parse_price_reddit(text_to_search):
    if not text_to_search: return None
    match_k = re.search(r'(\d+([.,]\d+)?)\s*k', text_to_search, re.IGNORECASE)
    if match_k: price_str = match_k.group(1).replace(',', '.'); return int(float(price_str) * 1000)
    match_full = re.search(r'[\$€£]?\s*(\d{1,3}(?:[.,]\d{3})*|\d+)', text_to_search)
    if match_full: price_str = re.sub(r'[.,]', '', match_full.group(1)); return int(price_str)
    return None

def _get_price_from_comments(post_url, post_author):
    try:
        comments_url = f"{post_url.rstrip('/')}/comments.json?sort=top"
        response = requests.get(comments_url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        for comment in response.json()[1]['data']['children']:
            if comment.get('data', {}).get('author') == post_author:
                price = _parse_price_reddit(comment.get('data', {}).get('body', ''))
                if price: return price
    except: return None
    return None

def _get_high_res_images(post_url):
    try:
        response = requests.get(f"{post_url.rstrip('/')}.json", headers=HEADERS, timeout=10)
        response.raise_for_status()
        post_data = response.json()
        media_metadata = post_data[0]['data']['children'][0]['data'].get('media_metadata')
        if media_metadata:
            urls = [media_metadata[m]['s']['u'].replace('amp;', '') for m in media_metadata if media_metadata[m]['e'] == 'Image']
            if urls: return urls
    except: pass
    return []

def fetch_reddit_deals():
    print("  -> 📡 [Reddit] Contattando Reddit per la lista dei post...")
    try:
        response = requests.get("https://www.reddit.com/r/Watchexchange/new.json?limit=25", headers=HEADERS)
        response.raise_for_status()
        posts = response.json()['data']['children']
    except Exception as e:
        print(f"  -> ❌ [Reddit] Errore nel recuperare i post: {e}"); return []

    deals = []
    for post in posts:
        data = post['data']
        if '[wts]' in data['title'].lower():
            post_url = "https://www.reddit.com" + data['permalink']
            
            price = _parse_price_reddit(data['title'] + " " + data.get('selftext', ''))
            if not price: price = _get_price_from_comments(post_url, data['author'])
            
            images = _get_high_res_images(post_url)
            if not images and data.get('thumbnail', '').startswith('http'):
                images.append(data.get('thumbnail'))

            deal_data = {
                "source": "Reddit",
                "title": data['title'],
                "listingPrice": price,
                "sourceUrl": post_url,
                "imageUrl": images[0] if images else None,
                "imageUrls": images,
                "description": data.get('selftext', '')
            }
            deals.append(deal_data)
            time.sleep(1)
    
    print(f"  -> ✅ [Reddit] Trovati {len(deals)} annunci su Reddit.")
    return deals
