import sys
sys.stdout.reconfigure(encoding='utf-8')

import requests
from bs4 import BeautifulSoup
import json
import re

url = 'https://mydukaan.io/rathore65/products/mono-kite-fighter-manja'
r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
soup = BeautifulSoup(r.text, 'html.parser')

print("Product page response status:", r.status_code)

# Check for JSON-LD Product schema
ld_jsons = soup.find_all('script', type='application/ld+json')
print(f"Found {len(ld_jsons)} JSON-LD scripts")
for idx, s in enumerate(ld_jsons):
    print(f"\n--- JSON-LD #{idx} ---")
    try:
        data = json.loads(s.string)
        print(json.dumps(data, indent=2))
    except Exception as e:
        print(s.string[:200] if s.string else '')

# Check for window variables
scripts = soup.find_all('script')
print("\n--- Scanning scripts for DUKAAN data ---")
for s in scripts:
    if s.string and 'DUKAAN' in s.string:
        for line in s.string.split('\n'):
            line = line.strip()
            if any(k in line for k in ['window.DUKAAN_STORE =', 'window.DUKAAN_CATALOG =', 'window.PRODUCT =', 'window.DUKAAN_PRODUCT']):
                print(line[:160])
