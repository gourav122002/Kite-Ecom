import requests
import json
from bs4 import BeautifulSoup

urls = [
    'https://mydukaan.io/rathore65/products/mono-kite-fighter-manja',
    'https://mydukaan.io/rathore65/products/mayur-gold-cotton-manja',
    'https://mydukaan.io/rathore65/products/big-kites-pack-25-best-kite-for-fighting-manjha-big-kites-kite-shop-1'
]

for u in urls:
    r = requests.get(u, headers={'User-Agent': 'Mozilla/5.0'})
    soup = BeautifulSoup(r.text, 'html.parser')
    scripts = soup.find_all('script', type='application/ld+json')
    name = u.split('/')[-1]
    print(f"Checking {name}: Found {len(scripts)} ld+json scripts")
    for idx, s in enumerate(scripts):
        raw = s.string if s.string else ''
        try:
            d = json.loads(raw)
            print(f"  Script {idx}: VALID JSON - Type: {d.get('@type')}")
        except Exception as e:
            print(f"  Script {idx}: INVALID JSON SYNTAX! Error: {e}")
            print(f"  Snippet: {repr(raw[:150])}")
