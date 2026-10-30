import requests
from bs4 import BeautifulSoup
import json
import re

url = 'https://mydukaan.io/rathore65'
resp = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
soup = BeautifulSoup(resp.text, 'html.parser')

print('=== HTTP STATUS & HEADERS ===')
print('Status:', resp.status_code)
for k, v in resp.headers.items():
    if k.lower() in ['content-type', 'content-security-policy', 'strict-transport-security', 'x-frame-options', 'x-content-type-options', 'referrer-policy', 'permissions-policy', 'server', 'cf-ray', 'vary', 'cache-control']:
        print(f'{k}: {v}')

print('\n=== TITLE & META ===')
print('Title:', soup.title.string.strip() if soup.title and soup.title.string else 'None')
for m in soup.find_all('meta'):
    name = m.get('name') or m.get('property') or m.get('http-equiv')
    if name:
        print(f"{name}: {m.get('content')}")

print('\n=== CANONICAL ===')
can = soup.find('link', rel='canonical')
print('Canonical:', can['href'] if can else 'None')

print('\n=== JSON-LD SCHEMAS ===')
for s in soup.find_all('script', type='application/ld+json'):
    print(s.string.strip() if s.string else '')

print('\n=== EXTERNAL SCRIPTS & TRACKING ===')
for s in soup.find_all('script', src=True):
    print('Script src:', s['src'])

# Inline script search for tracking / tokens / secrets
inline_scripts = [s.string for s in soup.find_all('script') if s.string]
inline_combined = '\n'.join(filter(None, inline_scripts))
for pattern in ['GTM-', 'G-', 'UA-', 'fbq', 'clarity', 'hotjar', 'pixel', 'dukaan']:
    matches = set(re.findall(r'(' + pattern + r'[A-Za-z0-9_-]+)', inline_combined, re.IGNORECASE))
    if matches:
        print(f'Detected tracking/IDs for {pattern}:', matches)

print('\n=== ALL A HREF LINKS ===')
links = set()
for a in soup.find_all('a', href=True):
    links.add(a['href'])

for l in sorted(links):
    print(l)
