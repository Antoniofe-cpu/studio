# Contenuto DEFINITIVO e FINALE per: parsers/google_shopping_analyzer.py

import logging
import re
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync
from urllib.parse import quote_plus

class GoogleShoppingAnalyzer:
    """Usa Playwright per fare scraping diretto di Google Shopping in modo affidabile."""

    def __init__(self, api_key=None): # Non serve più una chiave API
        logging.info("🤖 [Playwright] Google Shopping Analyzer inizializzato.")

    def find_retail_price(self, query):
        logging.info(f"      -> 🕵️ [Playwright] Ricerca diretta per: '{query[:40]}...'")
        
        google_url = f"https://www.google.com/search?tbm=shop&q={quote_plus(query)}&gl=it&hl=it"
        
        with sync_playwright() as p:
            browser = None
            try:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(
                    user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                    locale='it-IT',
                    viewport={'width': 1920, 'height': 1080}
                )
                page = context.new_page()
                stealth_sync(page)

                page.goto(google_url, timeout=60000)
                
                # Aspettiamo che appaiano i risultati dei prodotti
                page.wait_for_selector('.sh-dgr__content', timeout=20000)
                
                html = page.content()
                browser.close()

                soup = BeautifulSoup(html, 'lxml')
                
                # Usiamo un selettore robusto che cerca il prezzo all'interno delle card prodotto
                price_tags = soup.select('.sh-dgr__content .a8Pemb')
                
                if not price_tags:
                    with open("debug_playwright_page.html", "w", encoding="utf-8") as f: f.write(html)
                    logging.warning("      -> 🤷 Nessun prezzo trovato con Playwright. Controlla 'debug_playwright_page.html'.")
                    return None
                    
                prices = []
                for tag in price_tags:
                    price_str = tag.get_text()
                    try:
                        cleaned_str = re.sub(r'[^\d]', '', price_str)
                        # Rimuoviamo gli ultimi due zeri dei centesimi
                        if len(cleaned_str) > 2:
                            prices.append(int(cleaned_str[:-2]))
                    except (ValueError, TypeError): continue
                
                if not prices: return None
                
                retail_price = int(min(prices))
                logging.info(f"      -> ✅ [Playwright] Prezzo retail più basso: €{retail_price}")
                return retail_price
                
            except Exception as e:
                if browser: browser.close()
                logging.error(f"      -> ❌ [Playwright] Errore: {e}", exc_info=False)
                return None
