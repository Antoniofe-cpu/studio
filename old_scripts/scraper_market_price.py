# scraper_market_price.py (v2.3.1 - Correzione SyntaxError)
import re
from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync
from twocaptcha import TwoCaptcha

# --- CONFIGURAZIONE ---
TWOCAPTCHA_API_KEY = "b671646c168d79f3653797763f1f10c2"
# ----------------------------------------------------

def get_market_price(model_name: str, ref_number: str):
    search_query = f"{model_name} {ref_number}".replace(" ", "+")
    search_url = f"https://watchcharts.com/search?q={search_query}"
    market_price = None

    try:
        config = { 'apiKey': TWOCAPTCHA_API_KEY, 'defaultTimeout': 300, 'pollingInterval': 10 }
        solver = TwoCaptcha(**config)
        balance = solver.balance()
        print(f"  [2Captcha] Saldo disponibile: ${balance}")
        if balance < 0.001:
            print("  [2Captcha] ❌ ATTENZIONE: Saldo insufficiente!")
            return None
    except Exception as e:
        print(f"  [2Captcha] ❌ Errore durante l'inizializzazione: {e}")
        return None

    with sync_playwright() as p:
        print(f"  [MarketPrice] Avvio browser...")
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        stealth_sync(page)

        try:
            page.goto(search_url, timeout=60000, wait_until="domcontentloaded")

            if "verifying you are human" in page.title().lower() or "just a moment" in page.title().lower():
                print("  [MarketPrice] ⚠️ CAPTCHA/Challenge rilevato!")
                sitekey = "0x4AAAAAAACh-J6DqBocB5y9"
                print(f"  [MarketPrice] Uso sitekey nota e attendo fino a 5 minuti...")
                
                try:
                    result = solver.turnstile(sitekey=sitekey, url=page.url, action="managed")
                    print("    - ✅ CAPTCHA risolto! Inserimento soluzione...")
                    
                    # --- BLOCCO DI CODICE CORRETTO ---
                    js_code = f"""
                        (function(){{
                            const token = '{result["code"]}';
                            const input = document.querySelector('[name="cf-turnstile-response"]');
                            if (input) {{
                                input.value = token;
                            }}
                            const form = document.querySelector('#challenge-form');
                            if (form) {{
                                form.submit();
                            }}
                        }})()
                    """
                    page.evaluate(js_code)
                    # --- FINE BLOCCO CORRETTO ---

                    page.wait_for_navigation(timeout=90000)
                    print("    - Navigazione post-CAPTCHA completata.")
                except Exception as captcha_error:
                    print(f"  [MarketPrice] ❌ Errore durante la risoluzione: {captcha_error}")
                    browser.close()
                    return None

            print("  [MarketPrice] Pagina caricata. Estraggo i dati...")
            link_selector = f'a.search-result-item:has-text("{ref_number}")'
            page.locator(link_selector).first.click()
            page.wait_for_navigation(timeout=30000)
            price_box_selector = "div.price-box:has-text('Market Price')"
            price_box = page.locator(price_box_selector).first
            price_text_content = price_box.text_content()
            match = re.search(r'\$([\d,]+)', price_text_content)
            if match:
                price_str = match.group(1).replace(',', ''); market_price = int(price_str)
                print(f"  [MarketPrice] ✅ Prezzo trovato: ${market_price}")

        except Exception as e:
            print(f"  [MarketPrice] ❌ Errore durante il processo: {e}")
        finally:
            browser.close()
            
    return market_price

if __name__ == "__main__":
    print("--- Test dello scraper v2.3.1 (Corretto) ---")
    price = get_market_price("Rolex Submariner Date", "126610LN")
    if price:
        print(f"\n✅ Risultato: Prezzo trovato -> ${price}")
    else:
        print(f"\n❌ Risultato: Prezzo non recuperato.")
