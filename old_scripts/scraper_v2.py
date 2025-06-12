import json
import random
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

BRAND = "rolex"
URL = f"https://watchcharts.com/listings/market?brand={BRAND}"

def run_scraper():
    with sync_playwright() as p:
        print("🚀 Avvio del browser in modalità 'Ghost'...")
        browser = p.chromium.launch(headless=False) # Lasciamo False per osservare
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            # Simuliamo una finestra più realistica
            viewport={'width': 1920, 'height': 1080}
        )
        page = context.new_page()

        print(f"🌍 Navigazione verso: {URL}")
        
        try:
            # Usiamo 'load' per un caricamento più completo
            page.goto(URL, wait_until="load", timeout=60000) # Timeout aumentato a 60s
            
            print("✅ Pagina caricata. Inizio simulazione comportamento umano...")
            
            ## --- HUMAN BEHAVIOR SIMULATION --- ##
            # 1. Pausa iniziale casuale
            page.wait_for_timeout(random.randint(2000, 5000))
            
            # 2. Movimento del mouse in punti casuali
            print("... muovendo il mouse...")
            page.mouse.move(random.randint(100, 500), random.randint(100, 500))
            page.wait_for_timeout(random.randint(500, 1500))
            page.mouse.move(random.randint(600, 1000), random.randint(600, 800))
            
            # 3. Scroll lento della pagina
            print("... scrollando la pagina...")
            for i in range(random.randint(3, 6)):
                page.mouse.wheel(0, random.randint(200, 400))
                page.wait_for_timeout(random.randint(800, 2000))
            
            print("✅ Simulazione completata. Ora cerco gli annunci.")
            ## --- FINE SIMULAZIONE --- ##

            page.wait_for_selector('div.market-listing-card-body', timeout=15000)
            
            print("🔍 Trovati gli annunci! Inizio l'estrazione...")
            html_content = page.content()

        except PlaywrightTimeoutError:
            print("\n❌ ERRORE: Timeout. Il CAPTCHA è ancora presente.")
            print("La simulazione umana non è stata sufficiente. La prossima via è un servizio di risoluzione CAPTCHA.")
            print("Lascio il browser aperto per 10 secondi per l'ispezione...")
            page.wait_for_timeout(10000)
            browser.close()
            return
        except Exception as e:
            print(f"\n❌ Si è verificato un errore inaspettato: {e}")
            browser.close()
            return

        print("🚪 Chiusura del browser.")
        browser.close()

        # ... il resto del codice per l'analisi rimane invariato ...
        from bs4 import BeautifulSoup
        
        soup = BeautifulSoup(html_content, 'html.parser')
        listings = soup.find_all('div', class_='market-listing-card-body')
        if not listings:
            print("Nessun annuncio trovato nell'HTML finale.")
            return

        deals = []
        print(f"📊 Analisi di {len(listings)} annunci...")

        for listing in listings:
            # (Codice di estrazione identico a prima)
            title_element = listing.find('h3', class_='card-title')
            title = title_element.get_text(strip=True) if title_element else 'N/A'
            link_element = title_element.find('a') if title_element else None
            link = "https://watchcharts.com" + link_element['href'] if link_element else 'N/A'
            price_element = listing.find('div', class_='price')
            price = price_element.get_text(strip=True) if price_element else 'N/A'
            ref_element = listing.find('div', class_='ref-number')
            reference = ref_element.get_text(strip=True) if ref_element else 'N/A'
            parent_card = listing.parent
            image_element = parent_card.find('img', class_='market-listing-card-img')
            image_url = image_element['src'] if image_element else 'N/A'
            deal = {
                "brand": BRAND, "title": title, "reference": reference,
                "price": price, "link": link, "image_url": image_url
            }
            deals.append(deal)

        with open(f'{BRAND}_deals.json', 'w', encoding='utf-8') as f:
            json.dump(deals, f, ensure_ascii=False, indent=4)
        
        print(f"\n🎉 Successo! Estratti {len(deals)} affari per {BRAND.upper()}.")
        print(f"I dati sono stati salvati nel file '{BRAND}_deals.json'.")

if __name__ == "__main__":
    run_scraper()
