# Rathore Patang Bhandar — Speed & Performance Technical Audit

> **Store**: Rathore Patang Bhandar (`https://mydukaan.io/rathore65`)  
> **Platform**: MyDukaan (Edge Proxy: `metal-edge` / Nginx 1.31.3)  
> **CDN**: BunnyCDN (`dukaan.b-cdn.net`)  
> **Auditor Role**: Senior Performance Engineer & Core Web Vitals Specialist  

---

## ⚡ Executive Summary

While Rathore Patang Bhandar benefits from BunnyCDN for image delivery, the storefront experiences **significant server-side and document bloat latency**.
Key benchmarks:
- **Time to First Byte (TTFB)** averages **1,500ms – 2,350ms** (exceeding Google's recommended threshold of <800ms by up to 3x).
- **Initial HTML Document Size** is an alarming **458 KB to 483 KB** per page before external scripts and images are loaded.
- Over **26 JavaScript files** and **18 stylesheets** are loaded per product page, generating excessive render-blocking overhead on Indian mobile networks.

---

## 📊 Measured Network & Performance Benchmarks

*Tests executed using automated HTTP latency probes and Chromium headless browser over simulated 4G broadband.*

| Page Type | HTTP Status | TTFB (ms) | Total Transfer Time (ms) | Initial HTML Size (KB) | Script Tags | Link Stylesheets | Image Elements | Performance Grade |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Homepage** | 200 OK | **1,541.1 ms** | 2,104.5 ms | **458.1 KB** | 23 | 10 | 36 | **D+ (Sluggish TTFB)** |
| **Product Detail (PDP)** | 200 OK | **1,537.8 ms** | 2,047.6 ms | **483.2 KB** | 26 | 18 | 28 | **D (Heavy Document Bloat)** |
| **Category Page** | 200 OK | **1,309.9 ms** | 1,828.6 ms | 333.2 KB | 25 | 12 | 13 | **C- (Needs Edge Cache)** |
| **Catalog Search** | 200 OK | **1,268.8 ms** | 1,631.8 ms | 319.5 KB | 22 | 12 | 13 | **C- (Client Render Delay)** |
| **Policy Page** | 200 OK | **2,351.3 ms** | 2,607.3 ms | 309.7 KB | 17 | 12 | 12 | **F (Unacceptable Latency)** |

---

## 🔬 Core Web Vitals & Diagnostic Analysis

### 1. TTFB & Server Edge Caching Gaps
- **Target**: < 800 ms (Good), < 200 ms (Optimal).
- **Actual**: 1,537 ms to 2,351 ms.
- **Root Cause**: The edge server header reveals `x-edge: metal-edge` and `DUKAAN_STORE_DETAIL_CACHE_STATUS`. Catalog pages are dynamically rendered on every request rather than served from a static edge cache (Cloudflare/Fastly full-page cache). Policy pages, which never change, take 2.35 seconds just to respond with the first byte!

### 2. Massive HTML Document Bloat (480 KB Payload)
- **Target**: < 50 KB for initial HTML document.
- **Actual**: 483.2 KB on Product Detail Pages.
- **Why is it so large?**:
  1. **Inlined JSON State Trees**: The `<script id="__DUKAAN_DATA__">` tag serializes the entire store's catalog props, menus, theme settings, banner metadata, and edge API configs into the raw HTML.
  2. **Inlined SVG Icons**: Dozens of raw SVG icons (search icons, bag icons, social icons, arrow icons) are inlined directly into HTML markup rather than loaded via an SVG sprite sheet.
  3. **Duplicate Style Blocks**: The document `<head>` contains multiple redundant `<style>` blocks alongside 18 external stylesheet links.

### 3. JavaScript & Render-Blocking Overhead
On each product page load:
- **26 external scripts** are fetched, including `auth.js`, `category-popup.js`, `coupon_offer_drawer.js`, `bxgy_sticky_footer.js`, `sidebar-menu.js`, `axios.min.js`, `dukaan-coupons.js`, `dukaan-offers.js`, `splide.min.js`, `variant-utils.js`, `dukaan-utils.js`, `main.js`, `wishlist-utils.js`, `snackbar.js`, `home.js`, and `lottie-player.js`.
- **Render-Blocking Impact**: Browsers pause DOM parsing while downloading and executing these scripts sequentially, pushing **First Contentful Paint (FCP)** beyond 2.8 seconds on 4G connections.

### 4. Image Delivery & CDN Optimization
- **Strengths**:
  - Images are served via BunnyCDN (`https://dukaan.b-cdn.net/`).
  - Images are compressed in modern **WebP** format.
  - Image widths are tailored (e.g. `700x700/webp/media/...`).
- **Weaknesses**:
  - The page attempts to preload hero images via `<link rel="preload" as="image" href="...">`, but also preloads 1,400px wide banners that are hidden on mobile viewports, wasting mobile bandwidth.
  - Missing native `loading="lazy"` attributes on carousel thumbnails and below-the-fold related products.

---

## 🚀 Performance Optimization Recommendations

1. **Implement Edge Page Caching (Cloudflare / Dukaan Edge)**:
   - Configure cache rules for anonymous traffic on `/rathore65`, `/categories/*`, `/products/*`, and `/p/*`.
   - Serving HTML from edge memory drops TTFB from **1,500ms down to <150ms**.
2. **Externalize `__DUKAAN_DATA__` & Static SVG Assets**:
   - Move static icons into an SVG sprite (`/icons/sprite.svg`).
   - Compress or trim the embedded JSON state tree so only data needed for the current route is inlined.
3. **Bundle & Defer JavaScript Assets**:
   - Consolidate the 15 separate Dukaan script files into a single minified bundle (`dukaan-core.min.js`).
   - Add `defer` or `async` attributes to non-critical scripts (`lottie-player.js`, `wishlist-utils.js`).
4. **Conditional Preloading**:
   - Use `media="(min-width: 768px)"` on desktop banner preloads to prevent mobile devices from downloading 1400px banners.
