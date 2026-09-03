import os
import requests
from bs4 import BeautifulSoup
import psycopg2

DATABASE_URL = os.environ.get("DATABASE_URL")

def scrape_and_update():
    if not DATABASE_URL:
        print("DATABASE_URL is not set!")
        return

    # Sample live feed payload / dynamic structure
    # Can be targeted to live RSS feeds or financial table aggregators
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # Create table with unique constraint on company_name to prevent duplicate entries
    cur.execute("""
        CREATE TABLE IF NOT EXISTS ipos (
            id SERIAL PRIMARY KEY,
            company_name VARCHAR(255) UNIQUE NOT NULL,
            logo_url TEXT,
            open_date VARCHAR(50),
            close_date VARCHAR(50),
            offer_price_range VARCHAR(50),
            lot_size INT,
            rating_stars INT DEFAULT 7,
            sentiment VARCHAR(50) DEFAULT 'Apply',
            gmp_range VARCHAR(50),
            gmp_percent VARCHAR(20),
            description TEXT,
            allotment_date VARCHAR(50),
            refund_date VARCHAR(50),
            listing_date VARCHAR(50),
            category VARCHAR(20) DEFAULT 'Mainline',
            status VARCHAR(20) DEFAULT 'Current',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Upsert query: updates GMP and dates if the company already exists
    upsert_sql = """
        INSERT INTO ipos (
            company_name, logo_url, open_date, close_date, offer_price_range,
            lot_size, rating_stars, sentiment, gmp_range, gmp_percent,
            description, allotment_date, refund_date, listing_date, category, status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (company_name) DO UPDATE SET
            gmp_range = EXCLUDED.gmp_range,
            gmp_percent = EXCLUDED.gmp_percent,
            status = EXCLUDED.status,
            rating_stars = EXCLUDED.rating_stars,
            sentiment = EXCLUDED.sentiment;
    """

    sample_scraped_items = [
        (
            'Augmont Enterprises IPO', '', '21 Aug 2026', '25 Aug 2026', '750-788',
            19, 7, 'Apply', 'Rs 284-286 Per Share', '+36.29%',
            'Augmont Enterprises Limited is engaged in the business of precious metals, primarily focusing on gold and silver.',
            '27 August 2026', '28 August 2026', '31 August 2026', 'Mainline', 'Current'
        ),
        (
            'Skyways Air IPO', '', '24 Aug 2026', '27 Aug 2026', '131-138',
            100, 5, 'Neutral', 'Rs 38-39 Per Share', '+28.26%',
            'Skyways Air Services Limited (SASL) is a leading air freight forwarding and logistics company in India.',
            '28 August 2026', '31 August 2026', '01 September 2026', 'Mainline', 'Current'
        ),
        (
            'Symbiotec Pharmalab IPO', '', '24 Aug 2026', '27 Aug 2026', '938-988',
            15, 8, 'Apply', 'Rs 238-240 Per Share', '+24.29%',
            'Symbiotec Pharmalab Ltd. is a pharmaceutical and biotechnology company.',
            '28 August 2026', '31 August 2026', '01 September 2026', 'Mainline', 'Current'
        )
    ]

    for item in sample_scraped_items:
        cur.execute(upsert_sql, item)

    conn.commit()
    cur.close()
    conn.close()
    print("Database synchronized successfully.")

if __name__ == "__main__":
    scrape_and_update()