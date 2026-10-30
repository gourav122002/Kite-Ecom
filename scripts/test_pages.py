import requests
from bs4 import BeautifulSoup

base_url = 'https://mydukaan.io'
urls_to_test = [
    '/rathore65/p/about-us',
    '/rathore65/p/contact-us',
    '/rathore65/p/faqs',
    '/rathore65/p/privacy-policy',
    '/rathore65/p/refund-policy',
    '/rathore65/p/return-policy',
    '/rathore65/p/shipping-policy',
    '/rathore65/p/terms-conditions',
    '/rathore65/store-locator',
    '/rathore65/wishlist',
    '/rathore65/bag',
    '/p/privacy-policy',
    '/p/terms-conditions',
    '/rathore65/categories',
    '/rathore65/categories/charkhi-spool',
    '/rathore65/categories/manjha',
    '/rathore65/categories/monokite-manjha',
    '/rathore65/categories/patang',
    '/rathore65/products/mono-kite-fighter-manja',
    '/rathore65/products/tuntun-manja'
]

results = []
for path in urls_to_test:
    url = base_url + path
    try:
        r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}, timeout=10)
        soup = BeautifulSoup(r.text, 'html.parser')
        title = soup.title.string.strip() if soup.title and soup.title.string else 'No Title'
        h1 = [h.get_text(strip=True) for h in soup.find_all('h1')]
        text_len = len(soup.get_text())
        print(f"[{r.status_code}] {path} -> Title: {title[:40]} | H1: {h1[:2]} | Length: {text_len}")
        results.append({
            'path': path,
            'status': r.status_code,
            'title': title,
            'h1': h1,
            'text_len': text_len
        })
    except Exception as e:
        print(f"[ERR] {path} -> {e}")

