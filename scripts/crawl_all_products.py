import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
import json
import time

sitemap_url = 'https://mydukaan.io/rathore65/sitemap.xml'
resp = requests.get(sitemap_url, headers={'User-Agent': 'Mozilla/5.0'})
root = ET.fromstring(resp.content)

product_urls = []
category_urls = []
blog_urls = []
other_urls = []

for child in root:
    for sub in child:
        if sub.tag.endswith('loc'):
            u = sub.text.strip()
            if '/products/' in u:
                product_urls.append(u)
            elif '/categories/' in u:
                category_urls.append(u)
            elif '/blog/' in u:
                blog_urls.append(u)
            else:
                other_urls.append(u)

print(f"Products: {len(product_urls)}, Categories: {len(category_urls)}, Blogs: {len(blog_urls)}, Others: {len(other_urls)}")

product_data = []

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for idx, url in enumerate(product_urls):
    try:
        r = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Title & Meta
        page_title = soup.title.string.strip() if soup.title and soup.title.string else ''
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        desc_content = meta_desc['content'].strip() if meta_desc and meta_desc.get('content') else ''
        
        # Canonical
        can = soup.find('link', rel='canonical')
        can_href = can['href'] if can else ''
        
        # Schema
        schemas = soup.find_all('script', type='application/ld+json')
        prod_schema = None
        for s in schemas:
            if s.string and '"@type": "Product"' in s.string:
                try:
                    prod_schema = json.loads(s.string)
                except Exception:
                    pass
        
        # Extract schema data if available
        price = ''
        availability = ''
        sku = ''
        mpn = ''
        if prod_schema:
            sku = prod_schema.get('sku', '')
            mpn = prod_schema.get('mpn', '')
            offers = prod_schema.get('offers', [])
            if offers and isinstance(offers, list):
                price = offers[0].get('price', '')
                availability = offers[0].get('availability', '')
        
        # Images
        imgs = soup.find_all('img')
        img_srcs = [img.get('src') for img in imgs if img.get('src')]
        missing_alt = [img.get('src') for img in imgs if not img.get('alt')]
        
        # H1s
        h1s = [h.get_text(strip=True) for h in soup.find_all('h1')]
        
        # Check Add to Bag / Buy Now buttons
        buttons = [b.get_text(strip=True) for b in soup.find_all(['button', 'a']) if any(x in b.get_text(strip=True).lower() for x in ['add to bag', 'buy now', 'sold out', 'out of stock'])]
        
        product_data.append({
            'url': url,
            'status': r.status_code,
            'page_title': page_title,
            'meta_desc_len': len(desc_content),
            'has_canonical': bool(can_href),
            'canonical_matches': can_href == url,
            'sku': sku,
            'price': price,
            'availability': availability,
            'h1_count': len(h1s),
            'h1_text': h1s,
            'total_images': len(imgs),
            'missing_alt_count': len(missing_alt),
            'cta_buttons': buttons[:4]
        })
        print(f"[{idx+1}/{len(product_urls)}] {r.status_code} | {url.split('/')[-1][:30]} | Price: ₹{price} | Avail: {availability.split('/')[-1]} | Imgs: {len(imgs)} (No alt: {len(missing_alt)}) | H1s: {len(h1s)}")
    except Exception as e:
        print(f"[{idx+1}/{len(product_urls)}] ERROR {url}: {e}")

# Save full results to json
with open('c:/ai project/ecom/scripts/crawled_products.json', 'w', encoding='utf-8') as f:
    json.dump(product_data, f, indent=2)

print("\nFinished crawling all products. Saved to scripts/crawled_products.json")
