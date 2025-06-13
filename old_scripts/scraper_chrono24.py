# scraper_chrono24.py (v4.0 - Logica di Attesa Robusta)
import re
import time
from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync
from bs4 import BeautifulSoup

def get_listings(query: str, limit: int = 20):
    print(f"  [Chrono24-v4.0] Cerco '{query}'...")
    url = "https://www.chrono24.com/"
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True) # Mettilo a True per l'uso normale
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            locale='it-IT'
        )
        page = context.new_page()
        stealth_sync(page)

        try:
            print("    - Navigazione alla homepage...")
            page.goto(url, timeout=60000, wait_until="load")

            # --- GESTIONE POP-UP DEFINITIVA ---
            ok_button_selector = "button.js-cookie-accept-all"
            try:
                print("    - Attendo il pop-up dei cookie...")
                # Attendiamo che il pulsante sia visibile
                page.locator(ok_button_selector).wait_for(state="visible", timeout=15000)
                print("    - Pop-up trovato. Clicco...")
                page.locator(ok_button_selector).click()
                
                # Attendiamo che il pop-up sparisca
                page.locator(ok_button_selector).wait_for(state="hidden", timeout=5000)
                print("    - ✅ Pop-up gestito con successo.")
            except Exception as e:
                print(f"    - Info: Nessun pop-up trovato o errore nella gestione: {e}")
            # --- FINE GESTIONE POP-UP ---

            print("    - Inserisco la query...")
            search_input = page.locator('input[name="query"]')
            search_input.fill(query)
            time.sleep(0.5)

            print("    - Premo 'Invio' per la ricerca...")
            search_input.press('Enter')

            print("    - Attendo i risultati...")
            page.wait_for_selector('a.article-item', timeout=45000)
            
            print("    - Risultati caricati. Analizzo HTML...")
            html_content = page.content()
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # --- ESTRAZIONE DATI ---
            article_containers = soup.find_all('a', class_='article-item')
            if not article_containers:
                 print("   - ❌ Nessun contenitore 'article-item' trovato.")
            
            for container in article_containers[:limit]:
                title_element = container.find('div', class_='article-title')
                price_element = container.find('div', class_='text-bold')
                if title_element and price_element:
                    title = title_element.get_text(strip=True)
                    price_text = price_element.get_text(strip=True)
                    cleaned_price = re.sub(r'[^\d]', '', price_text)
                    if cleaned_price:
                        try:
                            results.append({'source': 'Chrono24', 'title': title, 'price': int(cleaned_price)})
                        except ValueError: continue
            
            print(f"  [Chrono24-v4.0] ✅ Trovati {len(results)} annunci validi.")

        except Exception as e:
            print(f"  [Chrono24-v4.0] ❌ Errore durante il processo: {e}")
            page.screenshot(path="debug_chrono24_final.png")
            print("  -> Screenshot salvato in 'debug_chrono24_final.png'")
        finally:
            browser.close()
            
    return results

if __name__ == "__main__":
    print("--- Test Scraper v4.0 per Chrono24 (Produzione) ---")
    listings = get_listings("Rolex Submariner 126610LN")
    if listings:
        print(f"\n✅ Risultato: Trovati {len(listings)} annunci.")
        if listings: print("Esempio:", listings[0])
    else:
        print("\n❌ Risultato: Nessun annuncio trovato.")
