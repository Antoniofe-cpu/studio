# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running the watch scraper

The repository includes a command line utility `scrape_watch_deals.py` that
aggregates listings from Reddit, eBay and watch forums, then estimates market
value and an optional AI score.

Set the required API keys and execute the script:

```bash
export EBAY_CLIENT_ID=<your-ebay-app-id>
export SCRAPINGBEE_API_KEY=<your-scrapingbee-key>  # optional
export GROQ_API_KEY=<your-groq-key>                # optional

python scrape_watch_deals.py
```

The script will print each deal with price comparisons and, when the keys are
available, an AI-generated score.
