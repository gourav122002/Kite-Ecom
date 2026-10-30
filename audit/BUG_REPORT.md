# Rathore Patang Bhandar — Defect & Bug Report

> **Store**: Rathore Patang Bhandar (`https://mydukaan.io/rathore65`)  
> **Platform**: MyDukaan  
> **Audit Date**: October 2026  
> **Status**: 11 Confirmed Reproducible Defects  

---

## 📋 Defect Summary Matrix

| Defect ID | Feature / URL | Category | Severity | Status | Summary |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Footer Navigation | UX / CRO | **Critical** | `FAIL` | Footer Privacy Policy & Terms links redirect users off the store to Dukaan sales landing page. |
| **BUG-002** | Structured Data (PDP) | SEO | **Critical** | `FAIL` | Product JSON-LD contains raw unescaped control characters/newlines, breaking schema parsing. |
| **BUG-003** | Edge Security Headers | Security | **Critical** | `FAIL` | `Strict-Transport-Security` (HSTS) header is missing across all storefront responses. |
| **BUG-004** | Mobile Viewport | Accessibility | **High** | `FAIL` | Viewport sets `maximum-scale=1.0, user-scalable=no`, blocking zoom in violation of WCAG 1.4.4. |
| **BUG-005** | Marketing & Analytics | Tracking | **High** | `FAIL` | DNS prefetch exists for GTM/Facebook, but zero active GA4 or Meta Pixel tracking containers exist. |
| **BUG-006** | Heading Hierarchy (Site-wide) | SEO | **High** | `FAIL` | Header store logo is coded as an `<h1>`, forcing duplicate H1 tags across all PDPs and categories. |
| **BUG-007** | Image Accessibility (Catalog) | A11y / SEO | **High** | `FAIL` | 22 to 50 product catalog and thumbnail images per PDP completely lack `alt` attributes. |
| **BUG-008** | Catalog Search SSR | SEO / Tech | **Medium** | `FAIL` | `/rathore65/search` renders a 0-product empty shell on initial HTTP response without JS. |
| **BUG-009** | Direct Authentication Route | Routing | **Medium** | `FAIL` | Direct access to `/rathore65/login` returns a raw HTTP 404 instead of redirecting to `/account`. |
| **BUG-010** | Store Locator Metadata | SEO / UI | **Low** | `FAIL` | `/rathore65/store-locator` renders an empty `<title>` tag (`No Title`) in the browser document head. |
| **BUG-011** | Server Information Disclosure | Security | **Low** | `FAIL` | HTTP `Server: nginx/1.31.3` and Sceptre version banners are publicly leaked in headers. |

---

## 🔍 Detailed Defect Reports

---

### BUG-001: Footer Privacy Policy & Terms Links Redirect Out of Store to Dukaan Enterprise Page
- **Finding ID**: `BUG-001`
- **Affected URL**: `https://mydukaan.io/rathore65` (Footer component)
- **Target Links**: `https://mydukaan.io/p/privacy-policy` & `https://mydukaan.io/p/terms-conditions`
- **Category**: User Experience (UX) / Conversion Rate Optimization (CRO)
- **Severity**: **Critical**
- **Status**: `FAIL` (Confirmed Reproducible)
- **Confidence Level**: 100% (Verified via automated scraper and browser click)

#### Description & Evidence
In the footer copyright section, the text links for **Privacy Policy** and **Terms & Conditions** point to relative root paths (`/p/privacy-policy` and `/p/terms-conditions`) rather than the store's policy URLs (`/rathore65/p/privacy-policy` and `/rathore65/p/terms-conditions`).
When clicked, the browser loads Dukaan's corporate marketing page:
- Expected Title: `Rathore Patang Bhandar - Privacy Policy`
- Actual Title: `Dukaan - Enterprise Ecommerce Platform for Brands & Retailers`
- Actual H1: `Your Global Commerce Partner, Engineered for Peak Performance`

#### Business Impact
Shoppers attempting to review return rules, data privacy, or terms prior to completing checkout are forcibly expelled from the seller's storefront into Dukaan's B2B software sales funnel. This creates immediate funnel drop-off and trust degradation.

#### Reproducible Steps
1. Navigate to `https://mydukaan.io/rathore65`.
2. Scroll to the bottom footer copyright area.
3. Click on the hyperlink labeled **Privacy Policy**.
4. Observe the destination URL in the browser address bar.

#### Recommended Fix
Update the store theme layout template or Dukaan menu settings to ensure footer policy URLs prepend the store base path:
```diff
- <a href="/p/privacy-policy">Privacy Policy</a>
- <a href="/p/terms-conditions">Terms & Conditions</a>
+ <a href="/rathore65/p/privacy-policy">Privacy Policy</a>
+ <a href="/rathore65/p/terms-conditions">Terms & Conditions</a>
```

#### Verification Steps
Click both links and confirm HTTP status 200 with URL prefix `/rathore65/p/`.

---

### BUG-002: Malformed Product JSON-LD Syntax Due to Unescaped Control Characters
- **Finding ID**: `BUG-002`
- **Affected URL**: All Product Detail Pages (e.g. `https://mydukaan.io/rathore65/products/mono-kite-fighter-manja`)
- **Category**: Technical SEO / Rich Snippets
- **Severity**: **Critical**
- **Status**: `FAIL` (Confirmed Reproducible)
- **Confidence Level**: 100% (Verified via RFC 8259 parser)

#### Description & Evidence
Inspection of the `<script type="application/ld+json">` tag on product pages reveals syntax errors:
```json
Invalid control character at: line 6 column 341 (char 581)
Snippet: "description": "Mono Kite Fighter Manja is designed for kite enthusiasts...\n\n✅ 6000 meters long.\n💪 Super Strong..."
```
Raw unescaped newline control characters (`\n`, `\r`) are inserted directly into the JSON string value for `"description"`. In RFC 8259, literal unescaped control characters within strings are illegal.

#### Business Impact
Googlebot, Bingbot, and Pinterest Rich Pins parsers fail to deserialize the Product schema. As a direct consequence:
- Google Search drops star rating snippets (`AggregateRating` 4.08 / 467 reviews).
- Google Search drops Price (`₹999`) and InStock badges from organic SERP snippets.
- Google Merchant Center automated feeds reject or flag product markup.

#### Reproducible Steps
1. Fetch `https://mydukaan.io/rathore65/products/mono-kite-fighter-manja`.
2. Extract the content of the first `application/ld+json` script tag.
3. Execute `json.loads(content)` in Python or pass into Google Rich Results Test tool.
4. Parser throws an invalid control character exception.

#### Recommended Fix
Sanitize product description strings on the server before serialization into JSON-LD by using proper JSON string encoders (`json.dumps()` or `JSON.stringify()`) which convert raw newlines into escaped `\n` character literals.

#### Verification Steps
Validate product URLs against the Google Rich Results Test tool; verify 0 syntax errors.

---

### BUG-003: Missing Strict-Transport-Security (HSTS) Header Site-Wide
- **Finding ID**: `BUG-003`
- **Affected URL**: Site-wide (`https://mydukaan.io/rathore65/*`)
- **Category**: Security & Transport Integrity
- **Severity**: **Critical**
- **Status**: `FAIL` (Confirmed Reproducible)
- **Confidence Level**: 100% (Verified via response header audit)

#### Description & Evidence
HTTP response headers returned by the Dukaan edge server completely omit the `Strict-Transport-Security` header:
```http
Server: nginx/1.31.3
Content-Type: text/html; charset=utf-8
Content-Security-Policy: frame-ancestors 'self' *.mydukaan.io;
Set-Cookie: dkn_visit_count=1; Max-Age=31536000; Path=/; HttpOnly
[MISSING: Strict-Transport-Security]
```

#### Business Impact
Without HSTS, user connections can be downgraded to plaintext HTTP via SSL stripping attacks (e.g. sslstrip tools on public Wi-Fi), intercepting session cookies and customer checkout data.

#### Reproducible Steps
1. Execute `curl -I https://mydukaan.io/rathore65`.
2. Inspect headers for `strict-transport-security`.
3. Observe header is completely absent.

#### Recommended Fix
Configure Nginx or Cloudflare edge to return:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

#### Verification Steps
Run `curl -I https://mydukaan.io/rathore65` and verify header is returned.

---

### BUG-004: Mobile Viewport Disables User Pinch-to-Zoom (WCAG 1.4.4 Violation)
- **Finding ID**: `BUG-004`
- **Affected URL**: Site-wide (`<head>` template)
- **Category**: Accessibility (A11y) & Usability
- **Severity**: **High**
- **Status**: `FAIL` (Confirmed Reproducible)
- **Confidence Level**: 100% (Verified in DOM source)

#### Description & Evidence
The viewport meta tag in the document `<head>` is configured as:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
```
Setting `maximum-scale=1.0` and `user-scalable=no` prevents mobile users from zooming into product images, product descriptions, or terms of service.

#### Business Impact
Direct violation of **WCAG 2.1 Success Criterion 1.4.4 (Resize Text - Level AA)**. Shoppers with mild visual impairments or elderly kite enthusiasts cannot magnify product thread specifications, leading to order abandonment.

#### Reproducible Steps
1. Open `https://mydukaan.io/rathore65` on an iOS Safari or Android Chrome device.
2. Attempt two-finger pinch-to-zoom on the product image or text.
3. The page remains locked at 1.0x scale.

#### Recommended Fix
Modify the viewport meta tag to allow user scaling:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
```

#### Verification Steps
Perform pinch-to-zoom on mobile and verify page expands up to at least 200%.

---

### BUG-005: Analytics Configured with DNS Prefetches but No Active GA4/Meta Pixel Container
- **Finding ID**: `BUG-005`
- **Affected URL**: Site-wide
- **Category**: Analytics & Marketing Attribution
- **Severity**: **High**
- **Status**: `FAIL` (Confirmed Reproducible)
- **Confidence Level**: 100% (Verified via DOM regex inspection)

#### Description & Evidence
The page `<head>` includes prefetch directives:
```html
<link rel="dns-prefetch" href="https://www.googletagmanager.com/">
<link rel="dns-prefetch" href="https://connect.facebook.net/">
```
However, a thorough scan of all inline scripts and external JavaScript tags revealed **zero active Google Analytics Measurement IDs** (`G-XXXXXXXXXX`), **zero Google Tag Manager containers** (`GTM-XXXXXXX`), and **zero Meta Pixel initialization snippets** (`fbq('init', ...)`).

#### Business Impact
Store management operates completely blind regarding website traffic, bounce rates, cart abandonments, and revenue attribution. Ad spend on Instagram or Google cannot measure ROAS or optimize for purchase conversions.

#### Reproducible Steps
1. View page source on `https://mydukaan.io/rathore65`.
2. Search for `G-`, `GTM-`, or `fbq`.
3. Only CSS classes matching `g-` appear; no tracking containers are loaded.

#### Recommended Fix
Install and activate Google Analytics 4 and Meta Pixel plugins from the Dukaan App Store, providing verified Measurement IDs.

#### Verification Steps
Verify network hits to `google-analytics.com/g/collect` and `facebook.com/tr/` on page load.

---

### BUG-006: Header Store Logo Configured as H1 Tag Resulting in Duplicate H1s Site-wide
- **Finding ID**: `BUG-006`
- **Affected URL**: All pages (Homepage, PDP, Categories, Policies)
- **Category**: On-Page SEO
- **Severity**: **High**
- **Status**: `FAIL` (Confirmed Reproducible)
- **Confidence Level**: 100% (Verified across all 26 product pages)

#### Description & Evidence
In the header template (`.header .store-name-section`), the store name / logo is wrapped inside an `<h1>` tag:
```html
<div class="store-name-section">
  <img src="..."/>
  <h1>Rathore Patang Bhandar</h1>
</div>
```
When viewing a Product Detail Page, the product title is also wrapped in an `<h1>`:
```html
<h1>Monokite Fighter Manjha (6000m)...</h1>
```
This causes every single product page and policy page on the store to contain **two conflicting H1 headings**.

#### Business Impact
Dilutes primary search keyword signals. Search engines evaluate H1 headings to determine the core subject of the document; having "Rathore Patang Bhandar" as an H1 on every product page dilutes the ranking power of the specific product title.

#### Recommended Fix
Replace the header store name `<h1>` with a `<div>` or `<span>`, reserving the single `<h1>` tag exclusively for the main page content (Product Title, Category Name, or Homepage Hero).

#### Verification Steps
Run HTML heading audits on any PDP; verify exactly one `<h1>` tag is returned.

---

### BUG-007: Over 30 Product and Category Images per Page Lack Alt Attributes
- **Finding ID**: `BUG-007`
- **Affected URL**: Product Detail Pages & Category Pages
- **Category**: Accessibility (WCAG 1.1.1) & Image SEO
- **Severity**: **High**
- **Status**: `FAIL` (Confirmed Reproducible)
- **Confidence Level**: 100% (Audited on 26 products)

#### Description & Evidence
Across all 26 product detail pages crawled, between 22 and 50 `<img>` elements completely lack an `alt` attribute. Example:
```html
<img src="https://dukaan.b-cdn.net/700x700/webp/media/337f685c-aabc-49ab-b064-c045ed83a7eb.png" class="splide__image">
```

#### Business Impact
- Screen readers announce raw filenames or "image" to visually impaired users.
- Products miss out on high-intent Google Image Search traffic for terms like "fighter manja 6000m" and "wooden charkhi firki".

#### Recommended Fix
Update the image carousel component to inject the product title as the fallback `alt` attribute for all product images.

#### Verification Steps
Run an automated DOM check; confirm 0 `<img>` tags without `alt`.

---

### BUG-008: Catalog Search Page Renders Empty Shell on Initial HTTP Response
- **Finding ID**: `BUG-008`
- **Affected URL**: `https://mydukaan.io/rathore65/search?q=...`
- **Category**: Technical SEO / Crawlability
- **Severity**: **Medium**
- **Status**: `FAIL` (Confirmed Reproducible)
- **Confidence Level**: 100% (Tested with python requests)

#### Description & Evidence
Performing an HTTP GET request for `https://mydukaan.io/rathore65/search?q=manja` yields 0 product cards in the HTML response. The search interface requires client-side JavaScript execution to fetch products from `DUKAAN_ADVANCED_SEARCH_API_BASE_URL`.

#### Business Impact
Search queries cannot be indexed by basic web crawlers, and users with slow connections or disabled JavaScript see an empty white screen before scripts hydrate.

#### Recommended Fix
Implement server-side rendering (SSR) or dynamic pre-rendering for search result pages so the initial HTML payload contains hydrated product cards.

#### Verification Steps
Request `/search?q=manja` using `curl` and verify product HTML nodes are present in output.

---

### BUG-009: Direct Navigation to `/login` Returns 404 Not Found Error
- **Finding ID**: `BUG-009`
- **Affected URL**: `https://mydukaan.io/rathore65/login`
- **Category**: Usability / Routing
- **Severity**: **Medium**
- **Status**: `FAIL` (Confirmed Reproducible)
- **Confidence Level**: 100% (HTTP 404 response received)

#### Description & Evidence
Standard ecommerce customer convention expects `/login` to route to the login form. On Rathore Patang Bhandar, customer authentication is housed under `/rathore65/account`. Navigating to `/login` returns a dead 404 error page.

#### Business Impact
Frustrates returning customers who type `/login` into the URL bar or click obsolete external links.

#### Recommended Fix
Add a 301 permanent redirect rule:
```
Redirect 301 /rathore65/login -> /rathore65/account
```

#### Verification Steps
Test `curl -I https://mydukaan.io/rathore65/login` and verify HTTP 301 redirect to `/account`.

---

### BUG-010: Store Locator Page Missing Document Title Tag
- **Finding ID**: `BUG-010`
- **Affected URL**: `https://mydukaan.io/rathore65/store-locator`
- **Category**: SEO / Browser UI
- **Severity**: **Low**
- **Status**: `FAIL` (Confirmed Reproducible)
- **Confidence Level**: 100% (Verified in page head)

#### Description & Evidence
The HTML head of `/rathore65/store-locator` renders:
```html
<title></title>
```
The browser tab displays "No Title" or the raw URL.

#### Business Impact
Unprofessional appearance in browser tabs and bookmark bars; search engines generate generic SERP snippets.

#### Recommended Fix
Populate page title in Dukaan Page Settings:
`Store Locator & Outlets | Rathore Patang Bhandar`

#### Verification Steps
Check `<title>` tag in page source.

---

### BUG-011: Public Server Software & Version Disclosure in Headers
- **Finding ID**: `BUG-011`
- **Affected URL**: Site-wide
- **Category**: Information Disclosure / Security
- **Severity**: **Low**
- **Status**: `FAIL` (Confirmed Reproducible)
- **Confidence Level**: 100% (Verified via curl header inspection)

#### Description & Evidence
HTTP responses publicly advertise:
```http
Server: nginx/1.31.3
X-Powered-By: DukaanTech|Sceptre
X-sceptre-version: sceptre:0abf2a4
```

#### Business Impact
Assists malicious reconnaissance scanners in identifying targeted CVEs for specific Nginx versions.

#### Recommended Fix
Configure `server_tokens off;` in Nginx and strip `X-Powered-By` headers at the edge proxy.

#### Verification Steps
Confirm `Server: nginx` without version number or masked header.
