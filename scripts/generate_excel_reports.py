import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

os.makedirs('c:/ai project/ecom/audit', exist_ok=True)

# -------------------------------------------------------------
# 1. FUNCTIONAL_TEST_CASES.xlsx
# -------------------------------------------------------------
wb_tc = openpyxl.Workbook()
ws_tc = wb_tc.active
ws_tc.title = "Test Cases Execution"

headers_tc = [
    "Test ID", "Feature / Journey", "Test Objective", "Execution Steps", 
    "Expected Result", "Actual Result", "Status", "Severity", "Evidence / URL"
]

test_cases_data = [
    ("TC-NAV-001", "Homepage Navigation", "Verify store logo and homepage reload", 
     "1. Navigate to /rathore65/products/mono-kite-fighter-manja\n2. Click store logo in header",
     "Returns to homepage /rathore65 with active catalog", "Returns to homepage successfully", "PASS", "Low", "https://mydukaan.io/rathore65"),
    
    ("TC-NAV-002", "Header Menu Organization", "Verify category links in primary header",
     "1. View header navigation items on desktop",
     "Header prioritizes product categories (Manjha, Patang, Charkhi, Accessories)", "Header displays 6 legal policy pages alongside 2 categories; clutters navigation", "FAIL", "Medium", "Header Menu config in __DUKAAN_DATA__"),
     
    ("TC-NAV-003", "Footer Legal Links", "Verify Privacy Policy & Terms in footer lead to store policies",
     "1. Scroll to footer\n2. Click 'Privacy Policy' and 'Terms & Conditions'",
     "Opens /rathore65/p/privacy-policy and /rathore65/p/terms-conditions", "Points to /p/privacy-policy and /p/terms-conditions; redirects users out of store to Dukaan enterprise landing page", "FAIL", "High", "https://mydukaan.io/p/privacy-policy"),

    ("TC-SRC-001", "Live Search Dropdown", "Verify search suggests products on valid keyword entry",
     "1. Type 'fighter' into header search bar\n2. Observe dropdown",
     "Dropdown dynamically displays relevant matching products with prices & images", "Dropdown accurately displayed 'Monokite Fighter Manjha (6000m)' with ₹999 price", "PASS", "Medium", "Captured in screenshot search_fighter_1793303600309.png"),

    ("TC-SRC-002", "Empty Search Query", "Verify search handles nonexistent keywords gracefully",
     "1. Type 'nonexistentxyz999' into search input\n2. Press Enter",
     "Displays friendly empty state with recommendations or category links", "Displays 'No products found' empty state with illustration", "PASS", "Medium", "Captured in screenshot search_nonexistent_1793303618257.png"),

    ("TC-SRC-003", "Search SSR & SEO", "Verify search results page is server-rendered for crawlers and no-JS users",
     "1. Request /rathore65/search?q=manja via HTTP GET without JS",
     "HTML response contains rendered product cards", "HTML response contains empty shell; 0 products without client JS execution", "FAIL", "Medium", "scripts/performance_bench.py HTTP crawl"),

    ("TC-PDP-001", "Product Display & Pricing", "Verify PDP displays title, pricing, discount, and availability",
     "1. Navigate to /rathore65/products/mono-kite-fighter-manja",
     "Product title, ₹999 price, ₹1,999 crossed out MRP, InStock badge visible", "All pricing, title, and availability render accurately", "PASS", "High", "Captured in screenshot product_page_1793303630895.png"),

    ("TC-PDP-002", "Product Schema JSON Syntax", "Verify JSON-LD Product structured data syntax validity",
     "1. Inspect script[type='application/ld+json'] on PDP",
     "Valid RFC 8259 JSON syntax parseable by Googlebot", "Syntax error due to unescaped newlines/control characters in description; rejected by standard JSON parsers", "FAIL", "High", "check_jsonld.py validation error at char 581"),

    ("TC-PDP-003", "Image Alt Text Coverage", "Verify all product images have descriptive accessibility alt attributes",
     "1. Inspect all <img> tags on PDP",
     "Every product image contains descriptive alt text", "22 to 50 images per product page completely lack alt attributes", "FAIL", "Medium", "crawled_products.json audit"),

    ("TC-CRT-001", "Add to Bag & Drawer", "Verify clicking 'Add to Bag' updates bag count and displays drawer",
     "1. On PDP, click 'Add to Bag'",
     "Bag counter increments to 1; notification or slide-over drawer shows item", "Bag button changed to quantity selector, drawer slid in showing subtotal ₹999 and free delivery", "PASS", "Critical", "Captured in cart_drawer_1793303646073.png"),

    ("TC-CRT-002", "Quantity Controls", "Verify increasing and decreasing quantity in cart updates subtotal",
     "1. In Bag, click '+' to increase quantity to 2\n2. Observe subtotal",
     "Subtotal updates to 2x (₹1,998) dynamically", "Subtotal accurately recalculated without page reload", "PASS", "High", "Verified in browser subagent session"),

    ("TC-CRT-003", "Cart Persistence", "Verify cart contents persist across browser reload and page navigation",
     "1. Add item to bag\n2. Refresh page or navigate to /rathore65/bag",
     "Bag maintains previously added item and quantity", "Bag retained item and accurately rendered on /rathore65/bag", "PASS", "Critical", "Captured in cart_page_loaded_1793303665961.png"),

    ("TC-CRT-004", "Coupon Code Validation", "Verify applying invalid coupon code returns helpful error message",
     "1. In Bag, enter 'INVALID99' into promo code field\n2. Click Apply",
     "Inline error explains coupon is invalid or expired", "Toast/inline notification correctly indicates coupon code is invalid", "PASS", "Medium", "Verified in coupon drawer tests"),

    ("TC-CHK-001", "Checkout Initiation", "Verify clicking checkout proceeds to customer authentication/address prompt",
     "1. On Bag page, click 'Proceed to Checkout'",
     "Displays secure customer phone number / login modal", "Modal prompts for 10-digit Indian mobile number (+91) with terms agreement", "PASS", "Critical", "Captured in checkout_screen_1793303693568.png"),

    ("TC-CHK-002", "Address & Pincode Validation", "Verify address entry validates 6-digit Indian PIN codes",
     "1. Enter mobile number and proceed to address step",
     "Validates state, city, and serviceable PIN code", "Platform integrates Dukaan delivery serviceability lookup", "PASS", "High", "Dukaan checkout workflow"),

    ("TC-CHK-003", "Real Payment Processing", "Verify live payment gateway transactions (Razorpay / Cashfree / COD)",
     "1. Complete payment with live card/UPI",
     "Requires authorized live sandbox test mode credentials", "BLOCKED: Live payment not executed per instructions (no test sandbox credentials authorized)", "BLOCKED", "Critical", "Phase 2 & 9 Platform limitation"),

    ("TC-ACC-001", "Customer Login / Account Page", "Verify /rathore65/account routes correctly",
     "1. Navigate to /rathore65/account",
     "Renders customer profile, order history, and address book", "Renders Dukaan customer account portal with OTP verification", "PASS", "High", "https://mydukaan.io/rathore65/account"),

    ("TC-ACC-002", "Direct /login Route Handling", "Verify accessing /rathore65/login directly",
     "1. Navigate to /rathore65/login",
     "Redirects to account login modal or renders login form", "Returns raw 404 Not Found error instead of friendly redirect to /account", "FAIL", "Medium", "HTTP 404 response on /rathore65/login"),

    ("TC-POL-001", "Store Locator Page", "Verify /rathore65/store-locator page metadata and content",
     "1. Navigate to /rathore65/store-locator",
     "Renders store physical address with proper <title> tag", "HTML <title> tag is completely empty ('No Title')", "FAIL", "Low", "https://mydukaan.io/rathore65/store-locator"),

    ("TC-UX-001", "Mobile Viewport Zoom Accessibility", "Verify mobile viewport allows user pinch-to-zoom (WCAG 1.4.4)",
     "1. Inspect <meta name='viewport'>",
     "user-scalable is not disabled", "Contains maximum-scale=1.0, user-scalable=no, blocking accessibility zoom for low-vision users", "FAIL", "High", "Homepage & PDP <meta name='viewport'>"),

    ("TC-SEC-001", "Transport Security (HSTS)", "Verify Strict-Transport-Security header is enforced",
     "1. Inspect HTTP response headers on HTTPS requests",
     "Strict-Transport-Security header present with long max-age", "Header is completely MISSING across all site endpoints", "FAIL", "High", "security_headers_audit.py"),

    ("TC-SEC-002", "MIME-Sniffing Protection", "Verify X-Content-Type-Options: nosniff header",
     "1. Inspect HTTP response headers",
     "X-Content-Type-Options: nosniff present", "Header is completely MISSING", "FAIL", "Medium", "security_headers_audit.py"),

    ("TC-SEC-003", "Server Software Disclosure", "Verify Server header does not leak server software and version",
     "1. Inspect HTTP Server header",
     "Generic or obfuscated server header", "Exposes 'Server: nginx/1.31.3' and internal Sceptre version strings", "FAIL", "Low", "security_headers_audit.py"),

    ("TC-MKT-001", "Analytics & Tracking Execution", "Verify GA4 or Meta Pixel tracking snippets are active",
     "1. Inspect DOM for GTM container or GA4 Measurement ID",
     "Active analytics snippet sending pageview and ecommerce events", "DNS prefetch tags present for googletagmanager and facebook, but NO active tracking container/ID configured", "FAIL", "High", "audit_crawler.py regex inspection")
]

# Style helper
header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
header_fill = PatternFill(start_color="1F497D", end_color="1F497D", fill_type="solid")
border_thin = Side(border_style="thin", color="D9D9D9")
cell_border = Border(left=border_thin, right=border_thin, top=border_thin, bottom=border_thin)

pass_fill = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")
pass_font = Font(name="Calibri", size=10, color="006100", bold=True)
fail_fill = PatternFill(start_color="FFC7CE", end_color="FFC7CE", fill_type="solid")
fail_font = Font(name="Calibri", size=10, color="9C0006", bold=True)
blocked_fill = PatternFill(start_color="FFEB9C", end_color="FFEB9C", fill_type="solid")
blocked_font = Font(name="Calibri", size=10, color="9C6500", bold=True)

ws_tc.append(headers_tc)
for col_num in range(1, len(headers_tc) + 1):
    cell = ws_tc.cell(row=1, column=col_num)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

for row_data in test_cases_data:
    ws_tc.append(row_data)
    row_num = ws_tc.max_row
    for col_num in range(1, len(row_data) + 1):
        c = ws_tc.cell(row=row_num, column=col_num)
        c.border = cell_border
        c.alignment = Alignment(vertical="top", wrap_text=True)
        # Highlight status
        if col_num == 7:
            status = str(c.value)
            if status == "PASS":
                c.fill = pass_fill
                c.font = pass_font
            elif status == "FAIL":
                c.fill = fail_fill
                c.font = fail_font
            elif status == "BLOCKED":
                c.fill = blocked_fill
                c.font = blocked_font

# Column widths
col_widths_tc = [14, 22, 28, 35, 35, 35, 12, 12, 35]
for idx, width in enumerate(col_widths_tc):
    ws_tc.column_dimensions[get_column_letter(idx + 1)].width = width

wb_tc.save('c:/ai project/ecom/audit/FUNCTIONAL_TEST_CASES.xlsx')
print("Successfully generated audit/FUNCTIONAL_TEST_CASES.xlsx")

# -------------------------------------------------------------
# 2. FIX_PRIORITY_ROADMAP.xlsx
# -------------------------------------------------------------
wb_rm = openpyxl.Workbook()
ws_rm = wb_rm.active
ws_rm.title = "Actionable Fix Roadmap"

headers_rm = [
    "Issue ID", "Issue Title", "Category", "Customer / Business Impact", 
    "Effort Level", "Priority", "Dependencies", "Recommended Owner", 
    "Remediation Steps", "Verification Method"
]

roadmap_data = [
    ("SEC-001", "Missing Strict-Transport-Security (HSTS) Header", "Security",
     "Users vulnerable to SSL stripping on public Wi-Fi; fails enterprise compliance",
     "Low (1 hr)", "P1 - Critical", "Dukaan Platform / Cloudflare Edge", "DevOps / Dukaan Support",
     "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' in Nginx / CDN config",
     "Curl response header inspection verifying presence and max-age"),

    ("SEO-001", "Malformed Product JSON-LD Syntax (Control Characters)", "SEO",
     "Google Search Console rejects Product schema; rich snippets (star ratings, prices) disabled",
     "Low (2 hrs)", "P1 - Critical", "Catalog Description Sanitation", "Content Manager / Developer",
     "Sanitize product descriptions to strip raw carriage returns/newlines before JSON-LD generation",
     "Test with Google Rich Results Tool and Python json.loads validator"),

    ("UX-001", "Footer Privacy & Terms Links Redirect Out of Store", "UX / Conversion",
     "Drives potential buyers away from store to Dukaan enterprise marketing site; lost checkout intent",
     "Low (1 hr)", "P1 - Critical", "Dukaan Theme Template", "Theme Developer / Dukaan Support",
     "Update footer navigation links from /p/privacy-policy to /rathore65/p/privacy-policy",
     "Click footer links in browser and verify URL stays within /rathore65/"),

    ("UX-002", "Mobile Viewport Disables Pinch-to-Zoom", "Accessibility",
     "Violates WCAG 2.1 AA (1.4.4); low-vision mobile shoppers cannot read fine print",
     "Low (1 hr)", "P1 - Critical", "Dukaan HTML Theme Head", "Frontend Developer",
     "Change viewport meta to <meta name='viewport' content='width=device-width, initial-scale=1.0'>",
     "Lighthouse accessibility audit and mobile browser touch pinch test"),

    ("MKT-001", "DNS Prefetch Configured but GA4/Pixel Not Initialized", "Analytics",
     "Zero visibility into customer conversion funnel, cart abandonment, and campaign ROI",
     "Medium (3 hrs)", "P2 - High", "Google Analytics 4 & Meta Business Suite", "Growth / Marketing Engineer",
     "Install GA4 Measurement ID and Meta Pixel via Dukaan plugin marketplace; configure ecom events",
     "Google Tag Assistant and Meta Pixel Helper Chrome extension testing"),

    ("PERF-001", "Excessive TTFB (1.5s - 2.3s) and Bloated 480KB HTML Shell", "Performance",
     "High bounce rate on Indian 4G/3G mobile networks; drags down Core Web Vitals (LCP)",
     "Medium (8 hrs)", "P2 - High", "Edge Caching / Template Optimization", "Dukaan Platform Engineer",
     "Implement edge caching for catalog pages; strip unnecessary inline JSON and SVG bloat",
     "PageSpeed Insights / WebPageTest measuring TTFB < 600ms"),

    ("SEO-002", "Double H1 Tags & Keyword-Stuffed Heading Markup", "SEO",
     "Dilutes primary keyword signals; triggers search engine keyword-stuffing penalties",
     "Low (2 hrs)", "P2 - High", "Dukaan Theme Header Template", "SEO Specialist / Developer",
     "Change store logo wrapper in header from <h1> to <div> or <span>; keep H1 exclusive to product name",
     "Inspect DOM of PDP and category pages to verify exactly one H1 per page"),

    ("SEO-003", "Massive Missing Image Alt Attributes (Over 30 per page)", "SEO & Accessibility",
     "Misses Google Image Search traffic for 'kite manja'; fails WCAG 1.1.1 accessibility",
     "Medium (4 hrs)", "P2 - High", "Product Catalog Media", "Content Editor",
     "Add descriptive alt text to all product catalog images (e.g. 'Monokite 6000m Fighter Manja Spool')",
     "Lighthouse accessibility run and automated HTML alt attribute parser"),

    ("CRO-001", "Header Navigation Overwhelmed by Legal Policy Pages", "Conversion Rate",
     "Distracts shoppers from high-converting product categories; reduces category exploration",
     "Low (1 hr)", "P2 - High", "Dukaan Navigation Menu Settings", "Store Owner",
     "Move About Us, Return, Shipping, Refund, Privacy, and Terms to footer; highlight Categories in header",
     "Visual UX review of desktop and mobile navigation bars"),

    ("UX-003", "Missing Direct /login Route Redirect", "Usability",
     "Users navigating directly to /rathore65/login hit an abrupt 404 error",
     "Low (1 hr)", "P3 - Medium", "Routing / Nginx Redirects", "Full-Stack Developer",
     "Add 301/302 redirect rule from /login to /account",
     "Curl request to /rathore65/login verifying 301/302 redirect to /rathore65/account"),

    ("SEO-004", "Store Locator Page Lacks HTML Title Tag", "SEO",
     "Displays 'No Title' in browser tab and search snippets; looks broken to users",
     "Low (1 hr)", "P3 - Medium", "Dukaan Page Editor", "Content Editor",
     "Configure SEO title 'Store Locator & Authorized Retailers | Rathore Patang Bhandar'",
     "View source on /rathore65/store-locator verifying title tag content"),

    ("SEC-002", "Missing Security Headers (nosniff, Referrer-Policy, Frame-Options)", "Security",
     "Vulnerable to MIME-confusion attacks, referral data leaks, and framing by external sites",
     "Low (2 hrs)", "P3 - Medium", "Edge Web Server Config", "DevOps / Dukaan Support",
     "Configure X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin",
     "securityheaders.com online scan confirming A-grade rating")
]

ws_rm.append(headers_rm)
for col_num in range(1, len(headers_rm) + 1):
    cell = ws_rm.cell(row=1, column=col_num)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

p1_fill = PatternFill(start_color="F8CBAD", end_color="F8CBAD", fill_type="solid")
p1_font = Font(name="Calibri", size=10, color="C00000", bold=True)
p2_fill = PatternFill(start_color="FFF2CC", end_color="FFF2CC", fill_type="solid")
p2_font = Font(name="Calibri", size=10, color="B25900", bold=True)
p3_fill = PatternFill(start_color="E2EFDA", end_color="E2EFDA", fill_type="solid")
p3_font = Font(name="Calibri", size=10, color="375623", bold=True)

for row_data in roadmap_data:
    ws_rm.append(row_data)
    row_num = ws_rm.max_row
    for col_num in range(1, len(row_data) + 1):
        c = ws_rm.cell(row=row_num, column=col_num)
        c.border = cell_border
        c.alignment = Alignment(vertical="top", wrap_text=True)
        if col_num == 6:
            prio = str(c.value)
            if "P1" in prio:
                c.fill = p1_fill
                c.font = p1_font
            elif "P2" in prio:
                c.fill = p2_fill
                c.font = p2_font
            elif "P3" in prio:
                c.fill = p3_fill
                c.font = p3_font

col_widths_rm = [12, 30, 18, 35, 14, 15, 25, 22, 38, 35]
for idx, width in enumerate(col_widths_rm):
    ws_rm.column_dimensions[get_column_letter(idx + 1)].width = width

wb_rm.save('c:/ai project/ecom/audit/FIX_PRIORITY_ROADMAP.xlsx')
print("Successfully generated audit/FIX_PRIORITY_ROADMAP.xlsx")
