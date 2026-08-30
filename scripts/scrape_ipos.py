import os
import requests
from bs4 import BeautifulSoup
import psycopg2

DATABASE_URL = os.environ.get("DATABASE_URL")

def update_database(ipo_data_list):
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    for ipo in ipo_data_list:
        cur.execute("""
            INSERT INTO ipos (company_name, open_date, close_date, offer_price_range, lot_size, gmp_range, gmp_percent, description, allotment_date, refund_date, listing_date, category, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """, (
            ipo['company_name'], ipo['open_date'], ipo['close_date'], ipo['offer_price_range'],
            ipo['lot_size'], ipo['gmp_range'], ipo['gmp_percent'], ipo['description'],
            ipo['allotment_date'], ipo['refund_date'], ipo['listing_date'], ipo['category'], ipo['status']
        ))
    
    conn.commit()
    cur.close()
    conn.close()
    print("Database updated successfully.")

if __name__ == "__main__":
    print("Scraper ran on schedule.")
