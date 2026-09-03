import os
import re
import requests
from bs4 import BeautifulSoup
import psycopg2

DATABASE_URL = os.environ.get("DATABASE_URL")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

def clean_text(text):
    if not text:
        return ""
    return re.sub(r"\s+", " ", text).strip()

def extract_numbers(text):
    match = re.search(r"(\d+)", text.replace(",", ""))
    return int(match.group(1)) if match else 1

def fetch_live_ipos():
    url = "https://www.investorgain.com/report/live-ipo-gmp/331/"
    print(f"Connecting to live feed: {url}")
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
    except Exception as e:
        print(f"Failed to fetch live page: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    table = soup.find("table")
    if not table:
        print("Table not found on target page.")
        return []

    rows = table.find_all("tr")
    scraped_data = []

    # Parse table rows skipping header
    for row in rows[1:]:
        cols = row.find_all(["td", "th"])
        if len(cols) < 7:
            continue

        raw_name = clean_text(cols[0].text)
        if not raw_name or "GMP" in raw_name and len(raw_name) < 4:
            continue

        # Clean name and determine category
        category = "SME" if "SME" in raw_name.upper() else "Mainline"
        clean_name = re.sub(r"(?i)\s+sme\b|\s+ipo\b", "", raw_name).strip() + " IPO"

        price_text = clean_text(cols[1].text)
        gmp_val_text = clean_text(cols[2].text)
        est_listing = clean_text(cols[3].text)
        lot_text = clean_text(cols[5].text) if len(cols) > 5 else "1"
        dates_text = clean_text(cols[6].text) if len(cols) > 6 else ""

        # Parse lot size
        lot_size = extract_numbers(lot_text)

        # Parse open/close dates if available
        open_date = "TBA"
        close_date = "TBA"
        if "-" in dates_text:
            parts = dates_text.split("-")
            open_date = parts[0].strip()
            close_date = parts[1].strip()

        # Format GMP
        gmp_range = f"₹{gmp_val_text}" if gmp_val_text and gmp_val_text != "--" else "₹0"
        percent_match = re.search(r"\((.*?)\)", est_listing)
        gmp_percent = percent_match.group(1) if percent_match else "+0.00%"

        # Estimate sentiment based on GMP %
        rating = 5
        sentiment = "Neutral"
        try:
            num_pct = float(re.sub(r"[^\d.-]", "", gmp_percent))
            if num_pct >= 25:
                rating = 8
                sentiment = "Apply"
            elif num_pct >= 10:
                rating = 6
                sentiment = "May Apply"
            elif num_pct < 0:
                rating = 3
                sentiment = "Avoid"
        except Exception:
            pass

        scraped_data.append({
            "company_name": clean_name,
            "category": category,
            "open_date": open_date,
            "close_date": close_date,
            "offer_price_range": price_text if price_text else "TBA",
            "lot_size": lot_size,
            "gmp_range": gmp_range,
            "gmp_percent": gmp_percent,
            "rating_stars": rating,
            "sentiment": sentiment,
            "description": f"{clean_name} is actively tracked for subscription and grey market premium updates.",
            "allotment_date": "Follow official registrar",
            "refund_date": "Next business day",
            "listing_date": "NSE/BSE Listed",
            "status": "Current" if close_date != "TBA" else "Upcoming"
        })

    print(f"Scraped {len(scraped_data)} live IPOs.")
    return scraped_data

def sync_to_neon(ipos):
    if not ipos:
        print("No IPO data to insert.")
        return

    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is missing.")

    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    upsert_sql = """
        INSERT INTO ipos (
            company_name, open_date, close_date, offer_price_range,
            lot_size, rating_stars, sentiment, gmp_range, gmp_percent,
            description, allotment_date, refund_date, listing_date, category, status
        ) VALUES (
            %(company_name)s, %(open_date)s, %(close_date)s, %(offer_price_range)s,
            %(lot_size)s, %(rating_stars)s, %(sentiment)s, %(gmp_range)s, %(gmp_percent)s,
            %(description)s, %(allotment_date)s, %(refund_date)s, %(listing_date)s, %(category)s, %(status)s
        )
        ON CONFLICT (company_name) DO UPDATE SET
            gmp_range = EXCLUDED.gmp_range,
            gmp_percent = EXCLUDED.gmp_percent,
            offer_price_range = EXCLUDED.offer_price_range,
            rating_stars = EXCLUDED.rating_stars,
            sentiment = EXCLUDED.sentiment,
            status = EXCLUDED.status,
            close_date = EXCLUDED.close_date;
    """

    for ipo in ipos:
        cur.execute(upsert_sql, ipo)

    conn.commit()
    cur.close()
    conn.close()
    print("Neon PostgreSQL successfully updated with live data.")

if __name__ == "__main__":
    live_records = fetch_live_ipos()
    sync_to_neon(live_records)