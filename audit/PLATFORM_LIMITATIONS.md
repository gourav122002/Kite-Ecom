# Rathore Patang Bhandar — MyDukaan Platform Limitations & Blocked Tests

> **Store**: Rathore Patang Bhandar (`https://mydukaan.io/rathore65`)  
> **Platform**: MyDukaan (SaaS Hosted Platform)  
> **Auditor Role**: Senior Ecommerce Technical Auditor & QA Lead  
> **Testing Principle**: Strict non-destructive testing; zero unauthorized modifications, zero fictitious claims.  

---

## 🔒 Platform Governance & Constraints Overview

MyDukaan operates as a closed multi-tenant Software-as-a-Service (SaaS) ecommerce platform. Because the underlying codebase, Nginx reverse proxy configuration, server-side caching layer, and database schemas are platform-managed, independent third-party auditors cannot directly inspect backend logs, modify Nginx headers, or execute deep white-box penetration tests without merchant admin authorization.

The table below itemizes every test scenario that was **BLOCKED** or **RESTRICTED**, why it matters, and the specific artifacts required to achieve 100% verification coverage.

---

## 📋 Blocked & Unavailable Verification Matrix

| Area / Feature | Unavailable Test Scenario | Why It Matters | Required Access / Screenshot / Export | Safe Alternative Test Executed |
| :--- | :--- | :--- | :--- | :--- |
| **Payment Gateways** | End-to-end live payment capture and order creation (Razorpay / Cashfree / Simpl / UPI). | Must confirm webhook callbacks, order status progression (`CONFIRMED`), and double-debit prevention. | Test/Sandbox gateway credentials or merchant order creation log export. | Verified checkout initialization, mobile number prompt, terms agreement, and address form without processing real money. |
| **Dukaan Admin Settings** | Inspection of active Dukaan plugins, marketing tracking keys, and warehouse inventory counts. | Confirms whether GA4, Meta Pixel, or delivery integrations are configured in the dashboard but broken in theme rendering. | Admin portal access (`mydukaan.io/seller`) or screenshot export of **Plugins** and **Store Settings**. | Analyzed public DOM, scripts, and embedded `__DUKAAN_DATA__` JSON state tree. |
| **Web Server Config (Nginx)** | Direct inspection and editing of Nginx configuration files (`/etc/nginx/nginx.conf`). | Required to inject missing `Strict-Transport-Security` and `X-Content-Type-Options` security headers. | Dukaan platform engineering support ticket or custom domain Cloudflare proxy access. | Executed non-destructive HTTP header analysis via `curl` and Python `requests`. |
| **Search Console & Analytics** | Review of Google Search Console index coverage, crawl errors, and Core Web Vitals field data. | Identifies how many of the 331 blog URLs and 26 product URLs are actively indexed and generating impressions. | Read-only access or CSV export from **Google Search Console** and **Google Analytics 4**. | Crawled `sitemap.xml`, inspected `robots.txt`, and validated structured data with RFC 8259 JSON parsers. |
| **Email & SMS Notifications** | Verification of order receipt emails and SMS tracking dispatch. | Customers must receive timely order receipts and courier tracking URLs. | Execution of an authorized test order with a sandboxed phone number and test email. | Documented checkout data payload structure and notification prerequisites. |
| **Inventory Depletion** | Verification of real-time inventory count reduction on simultaneous purchases. | Prevents overselling during high-traffic festival flash sales (e.g. August 15 Kite Fest). | Merchant dashboard access to configure a test product with stock = 1. | Documented stock availability flags (`InStock`) in Product schema. |

---

## 🛠️ Recommended Action Items to Unblock Remaining Audits

To complete a 100% exhaustive verification across the remaining blocked scenarios, the merchant should provide:
1. **Dukaan Seller Dashboard Access (Staff / Read-Only Role)**:
   - Enables auditing of payment gateway API keys, webhook status, and shipping partner pincode serviceability rules.
2. **Authorized Sandbox Payment Mode**:
   - Temporarily enable Razorpay Test Mode or a ₹1 test product coupon (`100OFFTEST`) allowing non-destructive order placement.
3. **Google Search Console Delegated Access**:
   - Allows diagnosing which specific product schema errors Google has flagged in the "Product Snippets" and "Merchant Listings" enhancement tabs.
