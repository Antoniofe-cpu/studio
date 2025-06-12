import os
import time
from parsers.reddit_parser import fetch_reddit_deals
from parsers.forum_parser import scrape_all_forums
from parsers.ebay_listings_parser import fetch_ebay_listings
from parsers.ebay_analyzer import EbayAnalyzer
from parsers.google_shopping_analyzer import GoogleShoppingAnalyzer
from parsers.ai_analyzer import GroqAnalyzer
from utils.data_models import standardize_deal, calculate_margin


def run_scraper():
    ebay_client_id = os.environ.get("EBAY_CLIENT_ID")
    scrapingbee_api_key = os.environ.get("SCRAPINGBEE_API_KEY")
    groq_api_key = os.environ.get("GROQ_API_KEY")

    ebay_analyzer = EbayAnalyzer(ebay_client_id)
    gshopping_analyzer = GoogleShoppingAnalyzer(scrapingbee_api_key)
    groq_analyzer = GroqAnalyzer(groq_api_key)

    print("\n🏁 Avvio scraping fonti...")
    raw_deals = []
    raw_deals.extend(fetch_reddit_deals())
    raw_deals.extend(fetch_ebay_listings(ebay_client_id))
    raw_deals.extend(scrape_all_forums())

    print(f"\n📃 Trovati {len(raw_deals)} annunci totali. Analisi in corso...")
    processed_deals = []
    for raw in raw_deals:
        deal = standardize_deal(raw)
        if not deal:
            continue

        brand = deal.get("brand")
        ref = deal.get("referenceNumber")
        query = None
        if brand and brand != "Unknown":
            parts = [brand]
            if ref and ref != "N/A":
                parts.append(ref)
            query = " ".join(parts)

        if query:
            deal["marketPrice"] = ebay_analyzer.calculate_market_price(query)
            time.sleep(1)
            deal["retailPrice"] = gshopping_analyzer.find_grey_market_price(query)
            time.sleep(1)
            deal["estimatedMarginPercent"] = calculate_margin(
                deal["listingPrice"], deal.get("marketPrice")
            )
            if deal.get("listingPrice") and deal.get("marketPrice"):
                score, rationale = groq_analyzer.generate_ai_score(deal)
                deal["aiScore"] = score
                deal["aiRationale"] = rationale
                time.sleep(1)
        processed_deals.append(deal)

    for d in processed_deals:
        print("\n---")
        print(f"Titolo: {d['originalTitle']}")
        print(f"Sorgente: {d['source']} - {d['sourceUrl']}")
        print(f"Prezzo annuncio: €{d['listingPrice']}")
        if d.get("marketPrice"):
            print(f"Prezzo di mercato stimato: €{d['marketPrice']}")
        if d.get("retailPrice"):
            print(f"Prezzo retail/grey market: €{d['retailPrice']}")
        if d.get("estimatedMarginPercent") is not None:
            print(f"Margine stimato: {d['estimatedMarginPercent']}%")
        if d.get("aiScore") is not None:
            print(f"AI Score: {d['aiScore']} ({d.get('aiRationale')})")
    print("\n✅ Elaborazione completata.")


if __name__ == "__main__":
    run_scraper()
