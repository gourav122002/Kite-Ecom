import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests
import time
from bs4 import BeautifulSoup

test_urls = {
    'Homepage': 'https://mydukaan.io/rathore65',
    'Product Detail Page': 'https://mydukaan.io/rathore65/products/mono-kite-fighter-manja',
    'Category Page': 'https://mydukaan.io/rathore65/categories/manjha',
    'Search Page': 'https://mydukaan.io/rathore65/search?q=fighter',
    'Policy Page': 'https://mydukaan.io/rathore65/p/shipping-policy',
}

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

print(f"{'Page Type':<22} | {'Status':<6} | {'TTFB (ms)':<10} | {'Total Time (ms)':<15} | {'HTML Size (KB)':<14} | {'Scripts':<8} | {'Styles':<8} | {'Images':<8}")
print("-" * 105)

for name, url in test_urls.items():
    start_time = time.time()
    r = requests.get(url, headers=headers, timeout=15)
    total_time = (time.time() - start_time) * 1000
    ttfb = r.elapsed.total_seconds() * 1000
    
    soup = BeautifulSoup(r.text, 'html.parser')
    scripts = len(soup.find_all('script'))
    styles = len(soup.find_all('link', rel='stylesheet'))
    images = len(soup.find_all('img'))
    size_kb = len(r.content) / 1024
    
    print(f"{name:<22} | {r.status_code:<6} | {ttfb:<10.1f} | {total_time:<15.1f} | {size_kb:<14.1f} | {scripts:<8} | {styles:<8} | {images:<8}")
