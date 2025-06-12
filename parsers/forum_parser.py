from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync
from bs4 import BeautifulSoup
import time
import re
from urllib.parse import urljoin

def _parse_price_from_text(text):
    if not text: return None
    match = re.search(r'(\d[\d,.]*)', text)
    if match: price_str = match.group(1).replace(',', '').replace('.', ''); return int(price_str)
    return None

def scrape_forum_with_playwright(url, source_name, selectors):
    print(f"  -> 🐳 [Docker+Playwright] Scrapping del Forum: {source_name}")
    deals = []
    with sync_playwright() as p:
        browser = None
        try:
            browser_args = ['--no-sandbox', '--disable-setuid-sandbox']
            browser = p.chromium.launch(headless=True, args=browser_args)
            context = browser.new_context(user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36')
            page = context.new_page()
            stealth_sync(page)
            
            print(f"     -> Navigazione elenco: {url}")
            page.goto(url, timeout=90000)
            
            if selectors.get('cookie_button_selector'):
                try: page.locator(selectors['cookie_button_selector']).click(timeout=7000); print("     -> Banner dei cookie cliccato."); time.sleep(2)
                except: pass
            
            print(f"     -> Attesa annunci nell'elenco...")
            page.wait_for_selector(selectors['thread_container'], timeout=30000)
            
            threads_html = page.content()
            soup = BeautifulSoup(threads_html, 'lxml')
            threads = soup.select(selectors['thread_container'])
            
            threads_to_visit = []
            for thread in threads:
                title_element = thread.select_one(selectors['title_element'])
                if title_element:
                    title = title_element.get_text(strip=True)
                    link = title_element.get('href')
                    if link and ('wts' in title.lower() or 'for sale' in title.lower()):
                        if not link.startswith('http'): link = urljoin(url, link)
                        price = None
                        if selectors.get('price_element'):
                            price_element = thread.select_one(selectors['price_element'])
                            if price_element: price = _parse_price_from_text(price_element.get_text(strip=True))
                        threads_to_visit.append({'title': title, 'url': link, 'price': price})

            print(f"     -> Trovati {len(threads_to_visit)} annunci di vendita da visitare...")
            for thread_info in threads_to_visit: # Rimosso il limite per lo scrape completo
                try:
                    print(f"        -> Visito: {thread_info['title'][:30]}...")
                    page.goto(thread_info['url'], timeout=60000)
                    page.wait_for_selector(selectors['post_content_selector'], timeout=30000)
                    price = thread_info['price']
                    if not price and selectors.get('price_element_detail'):
                         try:
                             price_text = page.locator(selectors['price_element_detail']).first.text_content(timeout=5000)
                             price = _parse_price_from_text(price_text)
                         except: price = None
                    post_content_html = page.inner_html(selectors['post_content_selector'])
                    post_soup = BeautifulSoup(post_content_html, 'lxml')
                    image_urls = [urljoin(thread_info['url'], img.get('src')) for img in post_soup.select(selectors['image_selector']) if img.get('src') and not img.get('src').startswith('data:image')]
                    deal_data = {"title": thread_info['title'], "sourceUrl": thread_info['url'], "source": source_name, "listingPrice": price, "imageUrl": image_urls[0] if image_urls else None, "imageUrls": image_urls}
                    deals.append(deal_data)
                    time.sleep(1.5)
                except Exception as e:
                    print(f"        -> ❌ Errore visitando il thread '{thread_info['title'][:20]}...': {e}")
                    continue
            browser.close()
            print(f"  -> ✅ [{source_name}] Completato. Estratti {len(deals)} annunci con dettagli.")
        except Exception as e:
            if 'page' in locals() and not page.is_closed(): page.screenshot(path=f"debug_screenshot_{source_name}.png"); print(f"  -> 📸 Screenshot di debug salvato.")
            print(f"  -> ❌ [{source_name}] Errore critico: {e}")
            if browser and browser.is_connected(): browser.close()
    return deals

def scrape_all_forums():
    """
    Funzione stub. Lo scraping dei forum è stato disabilitato
    a causa di protezioni anti-bot avanzate.
    Restituisce una lista vuota.
    """
    print("  -> ⚠️  [Forum] Lo scraping dei forum è disabilitato.")
    return []
