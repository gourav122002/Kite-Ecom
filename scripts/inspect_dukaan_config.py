import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests
from bs4 import BeautifulSoup
import re

r = requests.get('https://mydukaan.io/rathore65')
soup = BeautifulSoup(r.text, 'html.parser')

print("--- Script variables ---")
for s in soup.find_all('script'):
    if s.string and 'window.DUKAAN' in s.string:
        for line in s.string.split(';'):
            line = line.strip()
            if 'window.DUKAAN' in line:
                print(line[:120])
