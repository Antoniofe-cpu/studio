# **App Name**: WatchFinder AI

## Core Features:

- Automated Scraping: Automatically scrape watch listings from WatchCharts, Chrono24, Subdial, eBay, and Reddit.
- Price Comparison: Compare prices across retail, market, and individual listings.
- Margin Calculation: Calculate estimated net margin percentage, accounting for taxes and commissions.
- Product Listing Display: Display product listings with images, data, and links to the source.
- Automated Labeling: Automatically label listings as 'Affare' (Deal), 'OK,' or 'Fuori Prezzo' (Overpriced).
- Daily Updates: Daily updates via cron job or cloud function.
- Multi-Platform Comparison: Show the same watch model across multiple platforms (Chrono24, WatchCharts, eBay, etc.).
- Dynamic Historical Chart: Display dynamic historical price charts (retail vs. market) over 6-12 months, including margin trends.
- Margin & ROI History: Show historical variations and returns over time for each reference watch.
- AI Deal Scoring: Provide an AI-driven score (0-100) based on margin, demand, rarity, condition, and risk. This LLM acts as a tool and may not include certain information if the Affare Score does not pass a set threshold.
- Investment Simulator: Calculate potential returns and future scenarios for investments.
- Global Deal Map: Display a global map showing the geolocation of the best deals worldwide.
- AI Recommendations: Suggest watch models based on user history, preferences, and trends.
- Flip Assistant: Suggest when to sell, calculate net profit, and create simulated order lists.
- Automatic Tagging: Automatically tag listings with attributes like #Discontinued, #LimitedEdition, #SottoPrezzo (Below Price), #Completo (Complete), #Rischio (Risk).
- Reference Monitoring System: Send automatic alerts when a reference watch reaches a target price.
- AI Photo Scanner: Identify watch models and their current value from uploaded photos.
- Gamification: Implement user badges for achievements like Top ROI, Watch of the Month, Super Flipper, etc.
- Weekly Newsletter: Send weekly newsletters with top deals, charts, and links via email, Telegram, or WhatsApp.
- PDF/CSV Export: Allow users to export deal reports or watchlists in PDF/CSV format for analysis and sharing.
- Admin Dashboard: Admin dashboard for accepting/removing deals, ranking top listings, and monitoring published deals.
- Model News Feed: Alert users about new releases, discontinued models, or trends from official sites and newsfeeds.
- User Login: Allow users to log in via Google, Email, or Social accounts.
- Watchlist: Enable users to follow specific watches and receive notifications.
- User History: Show user history, preferences, and ROI reports.
- Personalized Suggestions: Provide personalized suggestions based on user preferences and history.

## Style Guidelines:

- Use a deep, saturated blue (#3F51B5) to convey trust and sophistication, aligning with the high-value nature of luxury watches.
- Opt for a dark background (#212121) to enhance the contrast and visibility of watch images and data, creating a premium feel.
- Implement a vibrant orange (#FF9800) for interactive elements and calls to action, providing clear visual cues and energy.
- Use 'Inter', a sans-serif font, will be used, lending the app a modern, objective, neutral look appropriate for presenting factual data.
- Use 'Source Code Pro' for displaying any technical information or code snippets.
- Employ a responsive, mobile-first layout that adapts seamlessly to various screen sizes and devices, ensuring optimal usability across platforms.
- Incorporate subtle animations, like gentle fades or transitions, when displaying watch details or updating data, creating a smooth user experience.