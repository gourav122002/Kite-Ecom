import sys
sys.stdout.reconfigure(encoding='utf-8')
import requests
from bs4 import BeautifulSoup
import json

r = requests.get('https://mydukaan.io/rathore65')
soup = BeautifulSoup(r.text, 'html.parser')
tag = soup.find('script', id='__DUKAAN_DATA__')
if tag:
    data = json.loads(tag.string)
    print("Found __DUKAAN_DATA__ keys:", list(data.keys()))
    store = data.get('DUKAAN_STORE', {})
    print("Store Info:")
    for k in ['id', 'name', 'phone', 'email', 'currency', 'is_verified', 'country', 'city', 'pincode', 'state', 'payment_settings']:
        print(f"  {k}: {store.get(k)}")
    
    # Check payments
    print("\nPayment Settings:", store.get('payment_settings'))
    print("Online Payments Enabled:", store.get('is_online_payment_enabled'))
    print("COD Enabled:", store.get('is_cod_enabled'))
    print("Free Shipping Threshold:", store.get('free_shipping_threshold'))
    print("Delivery Charge:", store.get('delivery_charge'))
    
    # Check plugins/integrations
    plugins = data.get('DUKAAN_PLUGINS', [])
    print("\nPlugins:", plugins)
else:
    print("No __DUKAAN_DATA__ tag found")
