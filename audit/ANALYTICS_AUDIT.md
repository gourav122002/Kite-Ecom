# Rathore Patang Bhandar — Analytics & Marketing Attribution Audit

> **Store**: Rathore Patang Bhandar (`https://mydukaan.io/rathore65`)  
> **Platform**: MyDukaan  
> **Auditor Role**: Senior Ecommerce Analytics & CRO Specialist  

---

## 📈 Executive Summary

A comprehensive DOM and network tracking audit revealed a **major tracking blackout** on Rathore Patang Bhandar:
- While `<link rel="dns-prefetch">` tags are present for `googletagmanager.com` and `connect.facebook.net`, **neither Google Analytics 4 (GA4), Google Tag Manager (GTM), nor the Meta (Facebook) Pixel are actively instantiated**.
- Standard ecommerce conversion events (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`) are **not firing to any external analytics dashboard**.
- The business currently has zero visibility into customer funnel drop-offs, organic search keyword conversions, or paid advertising ROAS.

---

## 🔍 Tracking Infrastructure Audit

| Tracking Tool | Expected Integration | Current Status | Finding / Evidence | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Google Analytics 4** | `G-XXXXXXXXXX` Measurement ID sending ecom telemetry | ❌ **NOT CONFIGURED** | Zero `gtag('config', ...)` or `google-analytics.com/g/collect` hits detected. | **High** |
| **Meta (Facebook) Pixel** | Pixel ID tracking `PageView`, `AddToCart`, `Purchase` | ❌ **NOT CONFIGURED** | Zero `fbq('init', ...)` calls; no `fbevents.js` script loaded. | **High** |
| **Google Tag Manager** | `GTM-XXXXXXX` container script in `<head>` and `<body>` | ❌ **NOT CONFIGURED** | Only DNS-prefetch tag exists; no GTM library injected. | **High** |
| **Google Search Console** | Verification meta tag or DNS TXT record | ✅ **VERIFIED** | Present: `<meta name="google-site-verification" content="vP1QsSF3WNpjVm-ryhZM54j6IqDsoxTb7BWccoLzf1g"/>` | **PASS** |
| **WhatsApp Chat Support** | Floating WhatsApp contact widget for customer orders | ⚠️ **PARTIAL / ABSENT** | Social links exist for YouTube and Instagram; direct floating WhatsApp chat widget is not active on storefront. | **Medium** |

---

## 🛒 Ecommerce Funnel Event Telemetry Analysis

Standard Google Analytics 4 Ecommerce and Meta Pixel events were monitored during manual and automated customer journeys:

```
[Customer Journey Phase]               [Expected Event]            [Actual Fired Event]     [Status]
1. Browse Product Detail Page  ----->  view_item (GA4)             None                     FAIL
                                       ViewContent (Meta)          None                     FAIL
2. Select Variant & Click Add  ----->  add_to_cart (GA4)           Internal Dukaan Edge API  PARTIAL (Platform Only)
                                       AddToCart (Meta)            None                     FAIL
3. View Bag Drawer / Modal     ----->  view_cart (GA4)             None                     FAIL
4. Proceed to Checkout Form    ----->  begin_checkout (GA4)        None                     FAIL
                                       InitiateCheckout (Meta)     None                     FAIL
5. Enter Shipping Information  ----->  add_shipping_info (GA4)     None                     FAIL
6. Order Payment Confirmation  ----->  purchase (GA4)              Untested (No sandbox)    BLOCKED
                                       Purchase (Meta)             Untested (No sandbox)    BLOCKED
```

### Diagnostic Findings:
1. **Platform-Only Internal Metrics**:
   - Dukaan logs internal merchant visit metrics via cookie `dkn_visit_count` and internal analytics endpoints.
   - However, **none of this data is exported or synced to the merchant's external marketing tools (GA4, Google Ads, Meta Ads Manager)**.
2. **Attribution Blindness**:
   - The store publishes seasonal blog posts and Instagram content (`@monokitemanjha_`).
   - Without UTM parameter tracking or GA4 event tracking, it is impossible to determine which blog articles or social reels drive actual kite sales.

---

## 📱 Social & Direct Messaging Integration

- **Instagram**: Linked in footer to `https://www.instagram.com/monokitemanjha_` (Status: Valid).
- **YouTube**: Linked in footer to `https://www.youtube.com/channel/UCsEFkRlDbFxEsITENp9Lkpg` (Status: Valid).
- **WhatsApp**:
  - In India, kite flying is a community hobby where customers frequently request custom orders, spool capacities, and bulk pricing via WhatsApp.
  - While Dukaan natively supports a WhatsApp floating button, it has not been enabled on this store, missing out on high-converting conversational commerce.

---

## 🛠️ Step-by-Step Analytics Implementation Plan

1. **Activate Google Analytics 4 Plugin in Dukaan**:
   - Navigate to **Dukaan Dashboard → Plugins → Google Analytics**.
   - Enter active GA4 Measurement ID (`G-XXXXXXXXXX`).
   - Enable Enhanced Ecommerce Event streaming (`view_item`, `add_to_cart`, `purchase`).
2. **Install Meta Pixel via Dukaan Marketplace**:
   - Connect Meta Pixel ID (`fbq('init', '...')`).
   - Enable Conversions API (CAPI) for server-side order tracking to bypass iOS 14+ ad blockers.
3. **Enable Floating WhatsApp Support Widget**:
   - Configure official WhatsApp business phone number in Dukaan settings.
   - Set pre-filled greeting: *"Hello Rathore Patang Bhandar, I want to order kite manja..."*
4. **Enforce Campaign UTM Tagging**:
   - Standardize all bio links, YouTube video descriptions, and seasonal promotions using UTM parameters (`?utm_source=instagram&utm_medium=bio&utm_campaign=monokite_fest`).
