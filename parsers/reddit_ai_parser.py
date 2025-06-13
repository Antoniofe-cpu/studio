import os, logging, requests, json, time, re
from groq import Groq

HEADERS = {'User-Agent': 'Mozilla/5.0'}

def get_author_comment(post_url, author_name):
    try:
        r = requests.get(f"{post_url.rstrip('/')}.json", headers=HEADERS, timeout=10)
        r.raise_for_status()
        for c in r.json()[1]['data']['children']:
            if c.get('kind') == 't1' and c['data'].get('author') == author_name:
                return c['data'].get('body', '')
    except Exception: return ""

def get_image_urls(data):
    urls = []
    if data.get("is_gallery") and "media_metadata" in data:
        for media_id in data["media_metadata"]:
            try: urls.append(data["media_metadata"][media_id]["s"]["u"].replace("&", "&"))
            except KeyError: continue
    elif data.get('thumbnail', '').startswith('http'): urls.append(data['thumbnail'])
    return urls

def ask_ai(client, text, question):
    try:
        c = client.chat.completions.create(messages=[{"role": "system", "content": "Answer questions concisely. If not found, respond with 'null'."}, {"role": "user", "content": f"Text:---\n{text}\n---\nBased on the text, what is the {question}? Answer only with the value."}], model="llama3-8b-8192", temperature=0.0)
        r = c.choices[0].message.content.strip()
        return r if r.lower() != 'null' else None
    except Exception: return None

def fetch_reddit_deals_with_ai(groq_api_key):
    if not groq_api_key: return []
    client = Groq(api_key=groq_api_key)
    logging.info("  -> 🧠 [Reddit AI] Inizio estrazione...")
    try:
        r = requests.get("https://www.reddit.com/r/Watchexchange/new.json?limit=15", headers=HEADERS, timeout=20)
        posts = r.json()['data']['children']
    except Exception: return []
    deals = []
    for post in posts:
        d = post['data']
        if '[wts]' not in d.get('title', '').lower(): continue
        logging.info(f"    -> Analizzando: '{d.get('title', '')[:60]}...'")
        text = f"TITLE: {d.get('title', '')}\n\nCOMMENT: {get_author_comment('https://www.reddit.com' + d.get('permalink', ''), d.get('author')) if not d.get('selftext', '') and d.get('is_gallery') else d.get('selftext', '')}"
        price_str = ask_ai(client, text, "price as a single number, no symbols")
        time.sleep(2)
        brand = ask_ai(client, text, "brand")
        time.sleep(2)
        model = ask_ai(client, text, "model name")
        deal = {"source": "Reddit", "title": d.get('title'), "price": int(price_str) if price_str and price_str.isdigit() else None, "brand": brand, "model": model, "sourceUrl": 'https://www.reddit.com' + d.get('permalink', ''), "imageUrls": get_image_urls(d)}
        deals.append(deal)
        time.sleep(3)
    return deals
