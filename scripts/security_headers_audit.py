import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests

url = 'https://mydukaan.io/rathore65'
r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

print("=== RESPONSE STATUS & HTTP VERSION ===")
print("Status:", r.status_code)

print("\n=== RESPONSE HEADERS ===")
for k, v in r.headers.items():
    print(f"{k}: {v}")

print("\n=== COOKIES SET ===")
for c in r.cookies:
    print(f"Name: {c.name}, Domain: {c.domain}, Path: {c.path}, Secure: {c.secure}, HttpOnly: {c.has_nonstandard_attr('httponly')}")

print("\n=== SECURITY HEADERS AUDIT ===")
expected_headers = {
    'Strict-Transport-Security': 'HSTS prevents downgrade attacks',
    'X-Content-Type-Options': 'Prevents MIME-sniffing',
    'X-Frame-Options': 'Prevents clickjacking',
    'Content-Security-Policy': 'Mitigates XSS and unauthorized framing',
    'Referrer-Policy': 'Protects URL referral privacy',
    'Permissions-Policy': 'Restricts browser hardware features (camera, mic, geolocation)'
}

for h, purpose in expected_headers.items():
    val = r.headers.get(h)
    if val:
        print(f"✅ {h}: PRESENT ({val})")
    else:
        print(f"❌ {h}: MISSING ({purpose})")

print("\n=== BACKEND DISCLOSURE ===")
server = r.headers.get('Server')
print(f"Server header: {server} {'(EXPOSES NGINX VERSION!)' if server and 'nginx' in server.lower() else ''}")
