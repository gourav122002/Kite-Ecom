# Comprehensive Technical Architecture & Audit System Documentation

> **Document Title**: Complete Architecture, Automation, and Audit Documentation  
> **Target Store**: Rathore Patang Bhandar (`https://mydukaan.io/rathore65`)  
> **E-Commerce Platform**: MyDukaan (Sceptre Engine / Nginx 1.31.3 / BunnyCDN)  
> **Project Root**: `c:\ai project\ecom`  
> **Audit & Tooling Stack**: Python 3.12.3, Requests, BeautifulSoup4, OpenPyXL, Pandas, Playwright/Chromium  
> **Target Audience**: Secondary AI Reviewers, Principal QA Engineers, Enterprise Auditors, and Full-Stack Developers  
> **Generation Date**: October 2026  

---

## 📑 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Complete Project File Inventory](#2-complete-project-file-inventory)
3. [Architecture and Workflow](#3-architecture-and-workflow)
4. [Detailed Documentation of Every Script](#4-detailed-documentation-of-every-script)
5. [Configuration and Dependencies](#5-configuration-and-dependencies)
6. [Installation and Execution Guide](#6-installation-and-execution-guide)
7. [Ecommerce Audit Coverage Matrix](#7-ecommerce-audit-coverage-matrix)
8. [Data Flow and Output Formats](#8-data-flow-and-output-formats)
9. [Testing and Quality Assurance](#9-testing-and-quality-assurance)
10. [Errors, Bugs, and Technical Debt](#10-errors-bugs-and-technical-debt)
11. [Security and Privacy Review](#11-security-and-privacy-review)
12. [Performance and Reliability](#12-performance-and-reliability)
13. [Reproducibility and Evidence Log](#13-reproducibility-and-evidence-log)
14. [Missing Features and Improvement Roadmap](#14-missing-features-and-improvement-roadmap)
15. [Instructions for the Next AI Reviewer](#15-instructions-for-the-next-ai-reviewer)

---

## 1. Executive Summary

### 1.1 Project Purpose & Scope
This project is an automated, non-destructive technical audit suite and diagnostic toolkit engineered to systematically evaluate the live production ecommerce store **Rathore Patang Bhandar** (operating under the commercial brand name **Monokite** at `https://mydukaan.io/rathore65`). 

The primary objectives of the project are:
1. **Catalog & Surface Discovery**: Map 100% of public URLs, product pages, category hubs, policy documents, and promotional blogs indexed by the store.
2. **Technical SEO & Structured Data Validation**: Inspect canonical directives, heading hierarchies, XML sitemaps, robots.txt exclusions, and RFC 8259 syntax compliance for Schema.org JSON-LD structured data.
3. **Core Web Vitals & Latency Profiling**: Quantify Time to First Byte (TTFB), total transfer latency, document payload size, and render-blocking assets across key user journeys.
4. **Transport & Application Security Auditing**: Verify TLS certificates, HTTP defensive security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options), cookie security attributes, and sensitive credential exposure.
5. **Customer Journey Functional Verification**: Validate live product search, variant pricing, quantity selectors, cart/bag state persistence, and checkout authentication prompts using automated browser sessions.
6. **Conversion Funnel & Accessibility Assessment**: Identify UX friction points, trust signal deficits, and WCAG 2.1 AA accessibility non-compliance (specifically mobile viewport zoom lockout).

### 1.2 Target Storefront Profile
- **Legal Business Name**: Rathore Patang Bhandar
- **Brand / Consumer Identity**: Monokite
- **Production URL**: `https://mydukaan.io/rathore65`
- **Hosting Platform**: MyDukaan SaaS (`metal-edge` proxy / Sceptre v2 architecture)
- **Edge Infrastructure**: Nginx 1.31.3
- **Media CDN**: BunnyCDN (`dukaan.b-cdn.net`)
- **Primary Market / Currency**: India (INR `₹`) / Country Code `+91` / Domestic Courier Logistics

### 1.3 Current Development & Execution Status
- **Scripts Implemented**: 10 distinct Python automation and diagnostic scripts in `scripts/`, alongside 1 TypeScript data ingestion utility (`scripts/inspect-csv.ts`).
- **Audit Deliverables Generated**: 15 comprehensive documentation reports, Excel workbooks, and CSV matrices located in `audit/`.
- **Verified Execution**: Every audit module has been executed against live production endpoints without destructive side-effects. Zero orders were placed, zero live payments charged, and zero administrative credentials compromised.

### 1.4 Major Strengths, Critical Risks, & Missing Information
- **Key Strengths**:
  - Comprehensive coverage of 373 discovered URLs (26 active products, 6 categories, 8 policy pages, 331 blog articles).
  - High fidelity RFC 8259 JSON validation identifying latent schema bugs that cause Google Rich Results parsing failures.
  - Automated dual-format report generation (styled Excel workbooks with conditional formatting + CSV mirrors + Markdown reports).
- **Critical Risks Identified on the Live Store**:
  - `BUG-001` (Critical): Footer Privacy Policy & Terms links route to `/p/privacy-policy`, redirecting buyers off the merchant store to Dukaan's corporate enterprise landing page.
  - `BUG-002` (Critical): Product JSON-LD structured data contains raw unescaped control characters/newlines, completely invalidating Google rich snippet eligibility.
  - `BUG-003` (Critical): `Strict-Transport-Security` (HSTS) header is missing site-wide, exposing users to SSL stripping attacks.
  - `BUG-004` (High): Mobile viewport sets `user-scalable=no`, violating WCAG 2.1 AA (1.4.4 Resize Text).
  - `BUG-005` (High): Complete analytics blackout; DNS prefetch exists for GTM/Facebook, but zero active GA4 or Meta Pixel tracking containers are instantiated.
- **Missing Information & Environmental Limitations**:
  - Merchant Dukaan seller dashboard access is unavailable (precluding verification of backend webhook health, inventory depletion race conditions, and carrier API integrations).
  - Payment gateway sandbox credentials are unavailable (precluding end-to-end capture of live Razorpay/Cashfree transactions).

---

## 2. Complete Project File Inventory

### 2.1 Excluded Directories & System Rationale
The following directories exist in the workspace but are excluded from detailed code-level documentation:
- `.git/`: Internal Git revision tracking and object database.
- `.next/`: Build cache and compiled artifacts for the local Next.js workspace.
- `node_modules/`: Local NPM dependency trees.
- `prisma/`: Database migrations and schema files for the parallel Next.js development workspace (separate from the Dukaan audit suite).
- `.system_generated/`: Internal agent scratchpads, browser subagent task recordings (`.webp`), and temporary process logs.

### 2.2 Comprehensive File Inventory Table

| Relative Path | File Type | Primary Purpose & Responsibility | Key Components / Logic | Inputs & Outputs | External Dependencies | Implementation Status | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `scripts/audit_crawler.py` | Python Script | Homepage crawler & header/meta diagnostic | Scans HTTP status, security headers, canonical tag, JSON-LD schemas, and scans inline scripts for tracking patterns (`GTM-`, `G-`, `fbq`). | **In**: `https://mydukaan.io/rathore65`<br>**Out**: Console stdout header & tracking report | `requests`, `bs4`, `re`, `json` | **Complete / Functional** | Executed; identified missing HSTS and lack of active GA4/GTM IDs. |
| `scripts/test_pages.py` | Python Script | Systematic HTTP probe of legal, category & utility routes | Iterates through 20 core store routes; extracts HTTP status, `<title>`, `<h1>` elements, and text byte length. | **In**: Static list of 20 URLs<br>**Out**: Console status matrix | `requests`, `bs4` | **Complete / Functional** | Executed; discovered the footer link leakage to Dukaan corporate homepage. |
| `scripts/inspect_product.py` | Python Script | Detailed single-product PDP schema & DOM inspector | Inspects `mono-kite-fighter-manja`; extracts JSON-LD scripts and validates JSON syntax; checks `DUKAAN` window variables. | **In**: Product PDP URL<br>**Out**: Formatted JSON-LD dumps or raw syntax errors | `requests`, `bs4`, `json`, `sys` | **Complete / Functional** | Executed; discovered the initial `UnicodeEncodeError` and invalid control character parsing errors. |
| `scripts/crawl_all_products.py` | Python Script | Full catalog crawler & metadata extractor | Fetches `sitemap.xml`, extracts all product URLs, crawls each PDP, inspects prices, canonicals, H1s, and counts missing image `alt` attributes. | **In**: `sitemap.xml`<br>**Out**: `scripts/crawled_products.json` | `requests`, `bs4`, `xml.etree.ElementTree`, `json` | **Complete / Functional** | Executed across all 26 active products; generated the primary product JSON dataset. |
| `scripts/crawled_products.json` | JSON Dataset | Structured dataset of 26 crawled store products | Contains per-product metadata: URL, status, title, canonical matching, SKU, price, availability, H1 count, image count, missing alt count. | **In**: Produced by `crawl_all_products.py`<br>**Out**: Consumed by `generate_inventory.py` | Built-in JSON format | **Complete / Valid Data** | Size: 16.6 KB; 26 records verified. |
| `scripts/check_jsonld.py` | Python Script | Targeted JSON-LD RFC 8259 syntax validation utility | Tests multiple PDPs with `json.loads()` to verify if product schemas deserialize cleanly or throw control character syntax errors. | **In**: List of sample PDP URLs<br>**Out**: Pass/Fail syntax report with error character offsets | `requests`, `bs4`, `json` | **Complete / Functional** | Executed; confirmed `Invalid control character at: line 6 column 341`. |
| `scripts/performance_bench.py` | Python Script | Multi-page latency & TTFB benchmark harness | Measures network latency, TTFB, total transfer time, HTML document size, script counts, and stylesheet counts across 5 page archetypes. | **In**: 5 key store page URLs<br>**Out**: Tabular latency benchmark stdout | `requests`, `bs4`, `time`, `sys` | **Complete / Functional** | Executed; documented 1.5s–2.3s TTFB and 480KB HTML bloat. |
| `scripts/security_headers_audit.py` | Python Script | Comprehensive HTTP security header & cookie analyzer | Inspects HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, cookie flags (`Secure`, `HttpOnly`), and Server banner. | **In**: Homepage URL<br>**Out**: Security compliance audit report | `requests`, `sys` | **Complete / Functional** | Executed; confirmed missing HSTS, unmasked Nginx 1.31.3, and loose cookie path `/`. |
| `scripts/inspect_dukaan_config.py` | Python Script | Initial experiment to find `window.DUKAAN` variables | Attempts to split `<script>` text by semicolons searching for `window.DUKAAN` declarations. | **In**: Homepage HTML<br>**Out**: Variable statements | `requests`, `bs4`, `sys` | **Incomplete / Subsumed** | Produced 0 matches because Dukaan embeds config in `<script id="__DUKAAN_DATA__">`, not `window.DUKAAN`. Superceded by `parse_dukaan_data.py`. |
| `scripts/parse_dukaan_data.py` | Python Script | Dukaan embedded JSON state tree parser | Extracts and parses `<script type="application/json" id="__DUKAAN_DATA__">`; extracts Store ID, menus, edge endpoints, and custom domain flags. | **In**: Homepage HTML<br>**Out**: Store metadata, header menu, footer menu JSON | `requests`, `bs4`, `json`, `sys` | **Complete / Functional** | Executed; revealed Store ID `58732339`, empty custom domain, and hardcoded footer menu IDs. |
| `scripts/generate_excel_reports.py` | Python Script | Automated openpyxl workbook generator | Programmatically builds binary `.xlsx` workbooks for `FUNCTIONAL_TEST_CASES.xlsx` (24 rows) and `FIX_PRIORITY_ROADMAP.xlsx` (12 rows) with custom styles. | **In**: Hardcoded verified audit test matrices<br>**Out**: 2 binary `.xlsx` files in `audit/` | `openpyxl` | **Complete / Functional** | Executed; built both formatted workbooks with auto-fitted columns and color-coded status fills. |
| `scripts/generate_inventory.py` | Python Script | Markdown inventory builder | Reads `crawled_products.json`, re-queries `sitemap.xml`, and formats 373 URLs into structured Markdown tables. | **In**: `crawled_products.json`, `sitemap.xml`<br>**Out**: `audit/WEBSITE_INVENTORY.md` | `requests`, `xml.etree.ElementTree`, `json` | **Complete / Functional** | Executed; produced the 17.9 KB `WEBSITE_INVENTORY.md`. |
| `scripts/inspect-csv.ts` | TypeScript Script | Dukaan product CSV export parser | Parses `results_58732339_...csv` using custom quoted CSV tokenizer; maps product groups, variants, and SEO tags. | **In**: `results_58732339_....csv`<br>**Out**: Console summary of catalog export | `fs`, `path` | **Complete / Functional** | Confirms merchant catalog export matches live online store data. |
| `results_58732339_0a67c5bf-ce80-4981-9edc-4cb7c2d38e5a.csv` | CSV Data Export | Raw catalog export from Dukaan Seller Portal | Contains 886 rows of product variants, SKUs, titles, descriptions, MRPs, discounted prices, image URLs, and SEO metadata for Store `58732339`. | **In**: Exported from Dukaan<br>**Out**: Ingested by `inspect-csv.ts` | Standard CSV | **Static Data Artifact** | Size: 110.3 KB; provides verified baseline for merchant pricing. |
| `audit/MASTER_AUDIT_REPORT.md` | Markdown Report | Master Executive Audit synthesis | Executive summary, health scores, confirmed defects, full 24-case test matrix, 7-day urgent fix plan, and 30-day roadmap. | **In**: Compiled audit evidence<br>**Out**: Primary executive deliverable | Standard GFM Markdown | **Complete** | Primary deliverable (17.0 KB). |
| `audit/README.md` | Markdown Index | Audit suite overview & navigation guide | Project summary, deliverable links, audit coverage statistics, and replication instructions. | **In**: Project metadata<br>**Out**: Directory landing document | Standard GFM Markdown | **Complete** | Size: 6.8 KB. |
| `audit/WEBSITE_INVENTORY.md` | Markdown Inventory | Comprehensive breakdown of 373 discovered URLs | Tabular listings of 26 products, 6 categories, 18 policy/utility routes, and sample festival blogs. | **In**: Output of `generate_inventory.py`<br>**Out**: Inventory reference document | Standard GFM Markdown | **Complete** | Size: 18.0 KB. |
| `audit/BUG_REPORT.md` | Markdown Report | Formal defect tracker with reproduction steps | 11 confirmed defects with IDs, severity, evidence, impact, reproduction steps, code diffs, and verification steps. | **In**: Discovered defects<br>**Out**: Developer bug tracker | Standard GFM Markdown | **Complete** | Size: 16.9 KB. |
| `audit/SEO_AUDIT.md` | Markdown Report | Technical & On-Page SEO deep dive | Evaluates title tags, duplicate H1 tags, keyword stuffing, JSON-LD schema syntax, sitemaps, robots.txt, and blog duplication. | **In**: Crawled SEO metrics<br>**Out**: SEO audit deliverable | Standard GFM Markdown | **Complete** | Size: 7.8 KB. |
| `audit/PERFORMANCE_AUDIT.md` | Markdown Report | Latency, TTFB, and document bloat analysis | Benchmark table across 5 page types, Core Web Vitals diagnostic, `__DUKAAN_DATA__` bloat analysis, and optimization guide. | **In**: Output of `performance_bench.py`<br>**Out**: Performance audit deliverable | Standard GFM Markdown | **Complete** | Size: 5.3 KB. |
| `audit/SECURITY_PRIVACY_AUDIT.md` | Markdown Report | HTTP security headers, cookies, and DPDP review | Security header matrix (HSTS, CSP), cookie flags (`Secure`, `HttpOnly`), server banners, secret leakage scan, and DPDP compliance. | **In**: Output of `security_headers_audit.py`<br>**Out**: Security audit deliverable | Standard GFM Markdown | **Complete** | Size: 6.1 KB. |
| `audit/ANALYTICS_AUDIT.md` | Markdown Report | Marketing attribution & tracking telemetry review | GTM/GA4/Pixel status, enhanced ecommerce event lifecycle analysis, WhatsApp widget gaps, and implementation steps. | **In**: Output of `audit_crawler.py`<br>**Out**: Analytics audit deliverable | Standard GFM Markdown | **Complete** | Size: 5.5 KB. |
| `audit/ACCESSIBILITY_UX_AUDIT.md` | Markdown Report | WCAG 2.1 AA compliance & mobile usability review | Focuses on viewport zoom lockout (`user-scalable=no`), missing image alt text, contrast ratios, and touch targets. | **In**: DOM inspection & WCAG criteria<br>**Out**: Accessibility audit deliverable | Standard GFM Markdown | **Complete** | Size: 5.4 KB. |
| `audit/CONVERSION_OPTIMIZATION.md` | Markdown Report | CRO, funnel leakage, and trust architecture audit | Evaluates store name vs brand identity duality, header navigation clutter, missing PDP pincode checker, and combo bundling. | **In**: User journey evaluations<br>**Out**: CRO audit deliverable | Standard GFM Markdown | **Complete** | Size: 5.7 KB. |
| `audit/PLATFORM_LIMITATIONS.md` | Markdown Report | Closed SaaS constraints & blocked test catalog | Explains unavailable checks (live payments, admin panel, GSC), why they matter, required credentials, and safe alternatives. | **In**: Testing constraints<br>**Out**: Platform limitation matrix | Standard GFM Markdown | **Complete** | Size: 4.3 KB. |
| `audit/FUNCTIONAL_TEST_CASES.xlsx` | Excel Workbook | 24-case functional test execution matrix | Formatted spreadsheet with columns: Test ID, Feature, Objective, Steps, Expected, Actual, Status, Severity, Evidence URL. | **In**: Output of `generate_excel_reports.py`<br>**Out**: Binary spreadsheet deliverable | `openpyxl` binary format | **Complete** | Size: 9.6 KB. Formatted with colored fills. |
| `audit/FUNCTIONAL_TEST_CASES.csv` | CSV Matrix | Tabular mirror of functional test cases | Raw CSV representation of all 24 test cases for CLI consumption or headless pipeline ingestion. | **In**: Exported from `FUNCTIONAL_TEST_CASES.xlsx`<br>**Out**: Plaintext tabular artifact | Standard CSV | **Complete** | Size: 7.9 KB. |
| `audit/FIX_PRIORITY_ROADMAP.xlsx` | Excel Workbook | Actionable remediation roadmap | Formatted spreadsheet with columns: Issue ID, Title, Category, Impact, Effort, Priority, Dependencies, Owner, Fix, Verification. | **In**: Output of `generate_excel_reports.py`<br>**Out**: Binary spreadsheet deliverable | `openpyxl` binary format | **Complete** | Size: 8.2 KB. Formatted with P1/P2/P3 fills. |
| `audit/FIX_PRIORITY_ROADMAP.csv` | CSV Matrix | Tabular mirror of fix priority roadmap | Raw CSV representation of prioritized fixes for automated tracking systems (Jira/Linear). | **In**: Exported from `FIX_PRIORITY_ROADMAP.xlsx`<br>**Out**: Plaintext tabular artifact | Standard CSV | **Complete** | Size: 4.8 KB. |

---

## 3. Architecture and Workflow

### 3.1 End-to-End System Architecture
The audit suite operates through five distinct modular layers:
1. **Discovery Layer**: Queries the XML sitemap (`https://mydukaan.io/rathore65/sitemap.xml`) and `robots.txt` to identify all navigable nodes.
2. **Deep Inspection Layer**: Probes individual HTTP endpoints using `requests` and `BeautifulSoup4` to evaluate response codes, HTTP headers, document size, inlined JSON configs, and DOM elements.
3. **Automated Browser Emulation Layer**: Utilizes Playwright/Chromium browser automation to execute dynamic interactions (live search dropdowns, variant toggling, cart slide-over drawer animations, and mobile OTP checkout modal invocation).
4. **Validation & Benchmarking Layer**: Runs specialized syntax verifiers (e.g. RFC 8259 JSON validation via `json.loads`) and microsecond network benchmarking to quantify TTFB and transfer latency.
5. **Synthesis & Reporting Layer**: Consolidates raw JSON crawl dumps (`crawled_products.json`) and test execution matrices into binary Excel workbooks (`openpyxl`), CSV mirrors (`pandas`), and detailed Markdown reports.

### 3.2 Architectural Flowchart (Mermaid)

```mermaid
flowchart TD
    subgraph Target["Live Storefront (https://mydukaan.io/rathore65)"]
        Sitemap["/rathore65/sitemap.xml\n(373 URLs)"]
        Robots["/rathore65/robots.txt\n(Disallow: /*bag$)"]
        Homepage["/rathore65\n(HTML + __DUKAAN_DATA__)"]
        PDP["/rathore65/products/*\n(26 Active PDPs)"]
        Utility["/rathore65/p/*, /bag, /search\n(Policies & Account)"]
    end

    subgraph Discovery_Phase["Phase 1: Discovery & Inspection"]
        AC["scripts/audit_crawler.py"]
        TP["scripts/test_pages.py"]
        CAP["scripts/crawl_all_products.py"]
        PDD["scripts/parse_dukaan_data.py"]
        
        Sitemap --> CAP
        Robots --> AC
        Homepage --> AC
        Homepage --> PDD
        Utility --> TP
    end

    subgraph Intermediate_Data["Intermediate Artifacts"]
        CPJ["scripts/crawled_products.json\n(26 Product Records)"]
        CSVExp["results_58732339_...csv\n(Catalog Baseline)"]
        CAP --> CPJ
    end

    subgraph Diagnostic_Phase["Phase 2: Validation & Benchmarking"]
        CJ["scripts/check_jsonld.py\n(RFC 8259 Validator)"]
        PB["scripts/performance_bench.py\n(TTFB & Payload Latency)"]
        SHA["scripts/security_headers_audit.py\n(HSTS & Cookies)"]
        BA["Playwright Browser Subagent\n(User Journey Automation)"]
        
        PDP --> CJ
        PDP --> PB
        Homepage --> SHA
        PDP --> BA
    end

    subgraph Reporting_Phase["Phase 3: Synthesis & Deliverables Generation"]
        GI["scripts/generate_inventory.py"]
        GER["scripts/generate_excel_reports.py"]
        
        CPJ --> GI
        Sitemap --> GI
        
        GI --> DocInv["audit/WEBSITE_INVENTORY.md"]
        GER --> Xlsx1["audit/FUNCTIONAL_TEST_CASES.xlsx"]
        GER --> Xlsx2["audit/FIX_PRIORITY_ROADMAP.xlsx"]
        
        DocInv -.-> Master["audit/MASTER_AUDIT_REPORT.md"]
        Xlsx1 -.-> Master
        Xlsx2 -.-> Master
        BA -.-> Master
        CJ -.-> Master
        PB -.-> Master
        SHA -.-> Master
    end
```

---

## 4. Detailed Documentation of Every Script

---

### 4.1 `scripts/audit_crawler.py`
- **Responsibility**: Inspects the store homepage to assess HTTP status, basic security headers, canonical consistency, JSON-LD schemas, external JavaScript sources, and searches inline scripts for tracking tokens (GTM, GA4, Meta Pixel).
- **Key Functions / Logic**:
  - Direct HTTP GET via `requests.get()` with desktop User-Agent header.
  - Header filtering against defensive security header keywords.
  - Regex pattern matching using `re.findall()` for tracking patterns (`GTM-`, `G-`, `UA-`, `fbq`, `pixel`).
- **Inputs & Arguments**: None (target URL hardcoded to `https://mydukaan.io/rathore65`).
- **Outputs**: Formatted stdout console log.
- **External Dependencies**: `requests`, `bs4` (`BeautifulSoup`), `re`, `json`.
- **Error Handling**: Basic stream parsing; lacks try-except wrappers on network requests.
- **Security Considerations**: Read-only passive HTTP request.
- **Limitations**: Only audits the homepage; does not execute JavaScript.
- **Representative Code Excerpt**:
  ```python
  # Search for analytics container patterns
  inline_scripts = [s.string for s in soup.find_all('script') if s.string]
  inline_combined = '\n'.join(filter(None, inline_scripts))
  for pattern in ['GTM-', 'G-', 'UA-', 'fbq', 'clarity', 'hotjar', 'pixel', 'dukaan']:
      matches = set(re.findall(r'(' + pattern + r'[A-Za-z0-9_-]+)', inline_combined, re.IGNORECASE))
      if matches:
          print(f'Detected tracking/IDs for {pattern}:', matches)
  ```

---

### 4.2 `scripts/test_pages.py`
- **Responsibility**: Systematically probes 20 core store routes (legal policies, category pages, sample product pages, wishlist, bag, and footer links) to verify HTTP response codes, document titles, H1 tags, and page weight.
- **Key Functions / Logic**:
  - Iterates over `urls_to_test` list.
  - Extracts `<title>` and all `<h1>` tags using BeautifulSoup.
  - Compares length of extracted text.
- **Inputs & Arguments**: Hardcoded array of 20 relative paths.
- **Outputs**: Prints `[status_code] path -> Title | H1 | Length` to stdout.
- **External Dependencies**: `requests`, `bs4`.
- **Error Handling**: Wrapped in `try...except Exception as e` per URL, preventing network timeouts from halting execution.
- **Key Discovery**: Exposed that `/p/privacy-policy` and `/p/terms-conditions` return the generic Dukaan corporate landing page (`Title: Dukaan - Enterprise Ecommerce Platform...`) rather than store-specific legal policies.

---

### 4.3 `scripts/crawl_all_products.py`
- **Responsibility**: The workhorse product catalog crawler. Fetches `sitemap.xml`, discovers all product URLs, crawls every PDP sequentially, inspects pricing, availability, SKU, canonical matching, counts images, and tallies missing image `alt` attributes.
- **Key Functions / Logic**:
  - Parses XML sitemap using `xml.etree.ElementTree`.
  - Filters URLs matching `/products/`.
  - Crawls each PDP with a 10-second timeout.
  - Extracts Schema.org Product JSON-LD if present.
  - Serializes all extracted product metadata into `scripts/crawled_products.json`.
- **Inputs & Arguments**: `https://mydukaan.io/rathore65/sitemap.xml`.
- **Outputs**: Writes structured JSON array to `scripts/crawled_products.json`.
- **External Dependencies**: `requests`, `bs4`, `xml.etree.ElementTree`, `json`, `sys`.
- **Error Handling**: Per-product `try...except` block ensures single-product crawl failures do not abort the catalog run.
- **Known Limitations**: Sequential execution takes ~45 seconds for 26 products. Lacks connection pooling or multi-threading.
- **Representative Code Excerpt**:
  ```python
  # Tally images missing accessibility alt attributes
  imgs = soup.find_all('img')
  img_srcs = [img.get('src') for img in imgs if img.get('src')]
  missing_alt = [img.get('src') for img in imgs if not img.get('alt')]
  
  product_data.append({
      'url': url,
      'status': r.status_code,
      'page_title': page_title,
      'sku': sku,
      'price': price,
      'availability': availability,
      'h1_count': len(h1s),
      'total_images': len(imgs),
      'missing_alt_count': len(missing_alt)
  })
  ```

---

### 4.4 `scripts/check_jsonld.py`
- **Responsibility**: Performs strict RFC 8259 syntax validation on Product JSON-LD schemas embedded in Product Detail Pages.
- **Key Functions / Logic**:
  - Fetches target PDPs.
  - Locates `<script type="application/ld+json">` elements.
  - Passes raw script text to `json.loads()`.
  - Catches `json.decoder.JSONDecodeError` and reports exact character offsets of invalid control characters.
- **Inputs & Arguments**: List of sample product URLs.
- **Outputs**: Pass/Fail syntax diagnosis printed to stdout.
- **External Dependencies**: `requests`, `bs4`, `json`.
- **Key Discovery**: Confirmed `BUG-002`—Dukaan inserts raw unescaped line breaks (`\n`) inside product description strings, triggering fatal syntax errors in RFC-compliant JSON parsers like Googlebot.

---

### 4.5 `scripts/performance_bench.py`
- **Responsibility**: Benchmark network latency and document payload characteristics across five fundamental page archetypes: Homepage, Product Detail Page, Category Page, Search Page, and Policy Page.
- **Key Functions / Logic**:
  - Computes Time to First Byte (TTFB) via `r.elapsed.total_seconds() * 1000`.
  - Measures total HTTP transfer time via `time.time()`.
  - Measures HTML document payload size in Kilobytes (`len(r.content) / 1024`).
  - Counts total script tags, link stylesheets, and image tags.
- **Inputs & Arguments**: Dictionary of page archetype names mapped to URLs.
- **Outputs**: Formatted stdout performance table.
- **External Dependencies**: `requests`, `bs4`, `time`, `sys`.
- **Key Findings**: Homepage TTFB was measured at 1,541.1 ms with a 458.1 KB document payload; Policy page TTFB was 2,351.3 ms.

---

### 4.6 `scripts/security_headers_audit.py`
- **Responsibility**: Evaluates transport security, HTTP response defensive headers, cookie flags, and server banner disclosures.
- **Key Functions / Logic**:
  - Issues GET request to homepage.
  - Checks for presence and values of: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`.
  - Audits session cookies for `Secure` and `HttpOnly` attributes.
  - Flags information disclosure in `Server` and `X-Powered-By` headers.
- **Inputs & Arguments**: Homepage URL.
- **Outputs**: Formatted security compliance checklist to stdout.
- **External Dependencies**: `requests`, `sys`.
- **Key Findings**: HSTS missing; X-Content-Type-Options missing; Server leaks `nginx/1.31.3`.

---

### 4.7 `scripts/parse_dukaan_data.py`
- **Responsibility**: Extracts and parses the embedded client-side state tree from the HTML document (`<script id="__DUKAAN_DATA__">`).
- **Key Functions / Logic**:
  - Locates script tag with `id="__DUKAAN_DATA__"`.
  - Deserializes JSON payload into a Python dictionary.
  - Extracts Store ID (`58732339`), store name, payment settings, currency config, and header/footer menu structures.
- **Inputs & Arguments**: Homepage URL.
- **Outputs**: Formatted JSON inspection of store configuration.
- **External Dependencies**: `requests`, `bs4`, `json`, `sys`.
- **Key Findings**: Revealed that the store operates on shared subdomain infrastructure (`CUSTOM_DOMAIN: None`, `IS_CUSTOM_DOMAIN: False`), and that the header menu contains 12 links including 6 legal policies.

---

### 4.8 `scripts/inspect_dukaan_config.py`
- **Responsibility**: Initial experimental probe attempting to find `window.DUKAAN` JavaScript variables.
- **Key Functions / Logic**: Loops over script tags, splits text by semicolon, searches for `window.DUKAAN`.
- **Status / Technical Debt**: **Incomplete / Superceded**. Produced empty results because Dukaan encapsulates its state in `<script id="__DUKAAN_DATA__">`. Preserved in repository for historical lineage; functionality completely replaced by `parse_dukaan_data.py`.

---

### 4.9 `scripts/generate_excel_reports.py`
- **Responsibility**: Generates professional binary `.xlsx` workbooks containing the complete functional test execution matrix and fix priority roadmap.
- **Key Functions / Logic**:
  - Initializes `openpyxl.Workbook()`.
  - Applies enterprise styling: Navy headers (`#1F497D`), white bold Calibri text, light gray cell borders (`#D9D9D9`), text wrapping, and explicit column widths.
  - Implements conditional formatting fills:
    - Status: Soft Green (`#C6EFCE`) for `PASS`, Soft Red (`#FFC7CE`) for `FAIL`, Soft Yellow (`#FFEB9C`) for `BLOCKED`.
    - Priority: Peach (`#F8CBAD`) for `P1 - Critical`, Light Yellow (`#FFF2CC`) for `P2 - High`, Pale Green (`#E2EFDA`) for `P3 - Medium`.
- **Inputs & Arguments**: Structured tuple lists defining 24 test cases and 12 roadmap items.
- **Outputs**:
  - `c:/ai project/ecom/audit/FUNCTIONAL_TEST_CASES.xlsx`
  - `c:/ai project/ecom/audit/FIX_PRIORITY_ROADMAP.xlsx`
- **External Dependencies**: `openpyxl`, `os`.
- **Error Handling**: Wrapped in filesystem output checks with directory auto-creation (`os.makedirs`).

---

### 4.10 `scripts/generate_inventory.py`
- **Responsibility**: Compiles the final `audit/WEBSITE_INVENTORY.md` document by aggregating crawled product data from `scripts/crawled_products.json` and sitemap URLs from `sitemap.xml`.
- **Key Functions / Logic**:
  - Loads `scripts/crawled_products.json`.
  - Re-fetches `https://mydukaan.io/rathore65/sitemap.xml` to enumerate all 331 blog posts.
  - Formats tables for Products, Categories, Legal/Utility pages, and sample blog posts.
- **Inputs & Arguments**: `scripts/crawled_products.json` and live sitemap XML.
- **Outputs**: `c:/ai project/ecom/audit/WEBSITE_INVENTORY.md`.
- **External Dependencies**: `requests`, `xml.etree.ElementTree`, `json`.
- **Error Handling**: UTF-8 explicit file encoding to prevent Windows cp1252 write crashes.

---

### 4.11 `scripts/inspect-csv.ts`
- **Responsibility**: Validates and inspects the raw Dukaan catalog CSV export (`results_58732339_...csv`).
- **Key Functions / Logic**:
  - Custom character-by-character CSV tokenizer handling multiline quoted cells and escaped quotes (`""`).
  - Groups variant rows by `Product ID`.
  - Outputs raw product names, SEO title tags, meta descriptions, and prices.
- **Inputs & Arguments**: `results_58732339_0a67c5bf-ce80-4981-9edc-4cb7c2d38e5a.csv`.
- **Outputs**: Formatted stdout summary of exported catalog items.
- **External Dependencies**: Node.js `fs`, `path`.

---

## 5. Configuration and Dependencies

### 5.1 Runtime & Environment Requirements
- **Python Version**: Python 3.12.3 (compatible with Python 3.10+)
- **Node.js Runtime** (for TypeScript utilities): Node.js v20+ / v22+
- **Operating System**: Windows 11 / Windows Server (fully compatible with Linux / macOS via standard POSIX paths)
- **Browser Automation Driver**: Chromium / Playwright (for automated UI and customer journey recording)

### 5.2 Third-Party Python Package Manifest
The Python audit scripts depend on the following verified packages:

| Package Name | Installed / Verified Version | Functional Purpose in Project |
| :--- | :--- | :--- |
| `requests` | 2.32.x+ | Synchronous HTTP/HTTPS client for sitemap fetching, page scraping, latency profiling, and header inspection. |
| `beautifulsoup4` (`bs4`) | 4.12.x+ | HTML/XML parsing, DOM tree traversal, meta tag extraction, and structured data discovery. |
| `openpyxl` | 3.1.x+ | Programmatic creation, cell styling, font formatting, and generation of binary `.xlsx` spreadsheets. |
| `pandas` | 2.2.x+ | Tabular data manipulation and generation of CSV mirror exports (`.csv`) from Excel workbooks. |

*Standard Library Dependencies Utilized*: `sys`, `os`, `time`, `re`, `json`, `xml.etree.ElementTree`.

### 5.3 Environment Variables & Secret Configuration
The audit suite operates strictly on public, non-authenticated storefront routes and **does not require secret environment variables** to execute.
- No `DUKAAN_API_KEY` or `ADMIN_PASSWORD` is stored or required for public crawler operation.
- If future sandboxed payment gateway tests are authorized, credentials must be supplied via local `.env` (e.g. `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) and loaded via `python-dotenv`.

### 5.4 Directory Structure Conventions
```
c:\ai project\ecom\
├── scripts\                # Automation, crawling, and analysis scripts
│   ├── crawled_products.json # Crawled product dataset artifact
│   └── *.py                # Modular Python audit scripts
├── audit\                  # Generated audit deliverables and spreadsheets
│   ├── *.md                # Markdown reports (Master, Bugs, SEO, Perf, etc.)
│   ├── *.xlsx              # Formatted binary Excel workbooks
│   └── *.csv               # Plaintext CSV tabular mirrors
└── results_58732339_*.csv  # Official merchant catalog export artifact
```

---

## 6. Installation and Execution Guide

### 6.1 Environment Setup Commands
Open PowerShell or a bash terminal in the project root:

```powershell
# 1. Verify Python installation (Requires Python 3.10+)
python --version
# Expected: Python 3.12.3

# 2. (Optional) Create and activate a Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# 3. Install required third-party packages
pip install requests beautifulsoup4 openpyxl pandas
```

### 6.2 Running Individual Audit Modules
Each script can be run independently to inspect specific facets of the store:

```powershell
# Run homepage header, canonical, and tracking container inspection
python scripts/audit_crawler.py

# Run systematic HTTP status check on 20 policy and category pages
python scripts/test_pages.py

# Inspect product page JSON-LD and DUKAAN data structures
python scripts/inspect_product.py

# Verify RFC 8259 syntax on product schemas
python scripts/check_jsonld.py

# Run network latency and TTFB benchmark suite
python scripts/performance_bench.py

# Run defensive security headers and cookie audit
python scripts/security_headers_audit.py

# Parse embedded __DUKAAN_DATA__ state tree
python scripts/parse_dukaan_data.py
```

### 6.3 Executing Full Catalog Crawl & Report Generation
To execute the end-to-end audit pipeline and regenerate all deliverables:

```powershell
# Step 1: Crawl all 26 products from sitemap.xml and save crawled_products.json
python scripts/crawl_all_products.py

# Step 2: Regenerate WEBSITE_INVENTORY.md from crawled dataset
python scripts/generate_inventory.py

# Step 3: Regenerate binary Excel workbooks (FUNCTIONAL_TEST_CASES.xlsx & FIX_PRIORITY_ROADMAP.xlsx)
python scripts/generate_excel_reports.py

# Step 4: Export CSV mirrors from Excel workbooks
python -c "import pandas as pd; pd.read_excel('audit/FUNCTIONAL_TEST_CASES.xlsx').to_csv('audit/FUNCTIONAL_TEST_CASES.csv', index=False); pd.read_excel('audit/FIX_PRIORITY_ROADMAP.xlsx').to_csv('audit/FIX_PRIORITY_ROADMAP.csv', index=False); print('CSVs updated.')"
```

---

## 7. Ecommerce Audit Coverage Matrix

| Audit Domain | Relevant Script(s) | Specific Implemented Checks | Expected Result | Actual Verified Result | Status | Testing Limitation / Gap |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Homepage & Nav** | `audit_crawler.py`, Browser | Header layout, logo link, menu links, search input visibility. | Clean category navigation; working logo reload. | Header cluttered with 6 legal policy pages; logo reloads home. | **FAIL (Nav)** / **PASS (Logo)** | None; 100% verified. |
| **Product Detail Pages** | `crawl_all_products.py`, `inspect_product.py` | Title, description, SKU, MRP, discounted price, stock badge. | Price ₹999, InStock badge, clear thread specs. | Price and availability render accurately; titles keyword-stuffed. | **PASS** | None; all 26 PDPs crawled. |
| **Images & Media** | `crawl_all_products.py` | Image count, image format, CDN domain, `alt` attribute presence. | Descriptive alt tags on all product images. | 22–50 images per PDP lack alt text; images served via BunnyCDN WebP. | **FAIL (Alt)** / **PASS (CDN)** | None; automated count. |
| **Search Functionality** | Browser, `performance_bench.py` | Live dropdown suggestions, empty search query recovery, SSR markup. | Matching suggestions on 'fighter'; clean empty state; SSR cards. | Dropdown displays matching items; empty state passes; SSR returns 0 products without JS. | **PASS (UI)** / **FAIL (SSR)** | Search requires client JS execution. |
| **Cart / Bag Flow** | Browser Subagent | 'Add to Bag' click, drawer slide-in, quantity +/-, price recalculation. | Subtotal increments dynamically; persistent cart state. | Bag counter increments; subtotal updates to ₹1,998 for qty=2; persists on reload. | **PASS** | Fully verified in browser. |
| **Checkout Initiation** | Browser Subagent | Click checkout, phone input, OTP prompt, terms agreement. | Phone number prompt with +91 country code. | Prompts 10-digit mobile number with terms agreement modal. | **PASS** | Verified up to phone entry. |
| **Payment Processing** | N/A (Platform) | Live capture of credit card / UPI / Net Banking charge. | Order confirmation and payment callback. | Untested: Real financial transactions withheld per audit safety guidelines. | **BLOCKED** | Requires merchant sandbox gateway mode. |
| **Customer Accounts** | `test_pages.py` | Route check on `/account` and `/login`. | Unified customer portal; clean redirect. | `/account` renders OTP login portal; `/login` returns raw 404 error. | **PASS (/account)** / **FAIL (/login)** | None. |
| **Sitemap & Robots** | `audit_crawler.py`, `generate_inventory.py` | XML sitemap structure, robots.txt directives. | 200 OK on sitemap; `Disallow: /*bag$`. | 373 URLs in sitemap.xml (121.9 KB); valid robots.txt disallowing cart. | **PASS** | None. |
| **SEO Headings** | `crawl_all_products.py`, `test_pages.py` | Single `<h1>` per page; logical heading hierarchy. | Exactly 1 H1 per page reflecting page title. | 2 H1 tags on 100% of PDPs (logo is H1); category H1 contains store name. | **FAIL** | None. |
| **Structured Data** | `check_jsonld.py`, `inspect_product.py` | RFC 8259 syntax validation on Schema.org JSON-LD. | Clean JSON-LD parseable by Googlebot. | SyntaxError: invalid control characters/newlines in product descriptions. | **FAIL** | Confirmed across multiple PDPs. |
| **Speed & Performance** | `performance_bench.py` | TTFB, transfer latency, HTML payload size, resource counts. | TTFB < 800ms; HTML payload < 100KB. | TTFB 1,537ms–2,351ms; HTML payload 458KB–483KB; 26 scripts per page. | **FAIL** | Lab benchmarks; field data requires GSC access. |
| **Security Headers** | `security_headers_audit.py` | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Server leaks. | Full defensive header suite; masked server. | HSTS missing; nosniff missing; Server leaks `nginx/1.31.3`. | **FAIL** | None. |
| **Mobile Zoom (A11y)** | Browser, `security_headers_audit.py` | Viewport user scaling support (WCAG 1.4.4). | Viewport allows 200%+ pinch-to-zoom. | `maximum-scale=1.0, user-scalable=no` hardcoded in viewport meta. | **FAIL** | Confirmed in DOM. |
| **Analytics Tracking** | `audit_crawler.py` | GA4 `G-` ID, Meta Pixel `fbq`, GTM container. | Active event telemetry on ecommerce steps. | DNS-prefetch present, but zero active GA4 or Meta Pixel containers. | **FAIL** | Verified via script scan. |

---

## 8. Data Flow and Output Formats

### 8.1 Data Pipeline Flow
```
[https://mydukaan.io/rathore65/sitemap.xml]
               │
               ▼
[scripts/crawl_all_products.py] ──> Extracts PDP Metadata
               │
               ▼
[scripts/crawled_products.json] ──> 26 Normalized Product Records
               │
               ├─────────────────────────┐
               ▼                         ▼
[scripts/generate_inventory.py]    [scripts/generate_excel_reports.py]
               │                         │
               ▼                         ▼
[audit/WEBSITE_INVENTORY.md]       [audit/*.xlsx & *.csv]
```

### 8.2 Representative Schema: `crawled_products.json`
```json
[
  {
    "url": "https://mydukaan.io/rathore65/products/mono-kite-fighter-manja",
    "status": 200,
    "page_title": "Monokite Fighter Manjha 6000m – Premium Fighter Kite String",
    "meta_desc_len": 158,
    "has_canonical": true,
    "canonical_matches": true,
    "sku": "21641040",
    "price": "999",
    "availability": "https://schema.org/InStock",
    "h1_count": 2,
    "h1_text": [
      "Rathore Patang Bhandar",
      "Monokite Fighter Manjha (6000m) – India’s Top Durable Fighter Kite String | Buy manjha online | Best for kite flying | Premium Strong Manja for Kite Fighting"
    ],
    "total_images": 28,
    "missing_alt_count": 22,
    "cta_buttons": ["Add to Bag", "Buy Now"]
  }
]
```

---

## 9. Testing and Quality Assurance

### 9.1 Static Code Review vs. Executed Tests
- **Static Code Analysis**: Executed across all 10 Python scripts, identifying unhandled UTF-8 character encoding on Windows cmd (`cp1252`), which was mitigated across scripts using `sys.stdout.reconfigure(encoding='utf-8')`.
- **Dynamic Live Executions**:
  - `crawl_all_products.py`: Executed; 26/26 products returned HTTP 200.
  - `performance_bench.py`: Executed; 5/5 page archetypes profiled.
  - `security_headers_audit.py`: Executed; verified against live Nginx headers.
  - `check_jsonld.py`: Executed; replicated syntax parser errors.
  - `Playwright Subagent`: Executed; full browser video recording captured in `dukaan_store_audit_1793303484318.webp`.

---

## 10. Errors, Bugs, and Technical Debt

### 10.1 Prioritized Defect Registry

| Finding ID | Script / Source Location | Defect Description | Severity | Impact | Recommended Fix | Confidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Store Theme Footer Template | Footer Privacy Policy and Terms links route to root `/p/...` instead of `/rathore65/p/...`. | **Critical** | Bounces customers off-store to Dukaan enterprise software site. | Prepend `/rathore65` to footer policy anchor tags. | 100% |
| **BUG-002** | PDP JSON-LD Generator | Unescaped control characters (`\n`, `\r`) injected into description string. | **Critical** | Google Rich Results parser rejects Product schema; drops star ratings and prices in SERP. | Sanitize description string using standard JSON encoder before template output. | 100% |
| **BUG-003** | Nginx Edge Proxy Config | `Strict-Transport-Security` header missing. | **Critical** | Man-in-the-middle SSL stripping vulnerability. | Add `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;`. | 100% |
| **BUG-004** | Document `<head>` Template | Viewport forces `maximum-scale=1.0, user-scalable=no`. | **High** | Violates WCAG 1.4.4; blocks low-vision mobile users from zooming. | Replace with `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. | 100% |
| **BUG-005** | Store Plugin / Analytics | DNS prefetch exists but no active GA4 or Meta Pixel containers. | **High** | Total marketing attribution blindness; zero conversion tracking. | Install and configure GA4 Measurement ID in Dukaan Plugins. | 100% |
| **BUG-006** | Header Navigation Template | Store logo is wrapped in an `<h1>`. | **High** | Duplicate H1 headings on every PDP; dilutes product keyword rankings. | Demote logo wrapper from `<h1>` to `<div>` or `<span>`. | 100% |
| **BUG-007** | PDP Carousel Template | Product images lack `alt` attributes. | **High** | Violates WCAG 1.1.1; misses Google Image Search traffic. | Inject automated fallback: `alt="{Product Name} - Rathore Patang Bhandar"`. | 100% |
| **BUG-008** | Catalog Search Architecture | `/search` returns empty shell on SSR; requires client JS. | **Medium** | Search pages not indexable by standard web crawlers. | Implement server-side rendering for search results. | 100% |
| **BUG-009** | Server Routing Table | Direct access to `/login` returns 404 Not Found. | **Medium** | Frustrates returning customers expecting standard login route. | Add 301 redirect: `/rathore65/login` -> `/rathore65/account`. | 100% |
| **BUG-010** | Store Locator Metadata | `/store-locator` renders empty `<title></title>`. | **Low** | Displays "No Title" in browser tabs and SERPs. | Populate title tag in Dukaan page settings. | 100% |
| **BUG-011** | Nginx Server Config | Leaks `Server: nginx/1.31.3` and Sceptre version strings. | **Low** | Information disclosure aids automated vulnerability scanners. | Set `server_tokens off;` and strip `X-Powered-By` headers. | 100% |

### 10.2 Technical Debt in Automation Scripts
1. **`scripts/inspect_dukaan_config.py` is obsolete**: Subsumed by `scripts/parse_dukaan_data.py`. Should be archived or deleted in future refactoring.
2. **Lack of Concurrency in `crawl_all_products.py`**: Requests are synchronous and sequential. Can be optimized using `asyncio` and `aiohttp` or `concurrent.futures`.

---

## 11. Security and Privacy Review

### 11.1 Secret & Credential Handling
- Automated pattern matching scanning across all crawled scripts and inlined JSON payloads detected **zero exposed API secret keys** (e.g. Razorpay secret keys, Stripe keys, database passwords, or JWT signing secrets).
- All client-side checkout interactions communicate exclusively with Dukaan's edge proxies (`/api/v2/...`).

### 11.2 Cookie Security & Multi-Tenant Exposure
- `dkn_visit_count` cookie lacks the `Secure` flag, permitting transmission over unencrypted connections.
- Both `dkn-session-id` and `dkn_visit_count` are set with `Path=/` on `mydukaan.io`. Because multiple unrelated merchants share the `mydukaan.io` domain without custom domains, this creates a potential cookie cross-contamination surface. Setting up a custom domain (e.g. `monokite.in`) completely mitigates this platform-level risk.

### 11.3 DPDP Act Compliance (India)
- While the store publishes a Privacy Policy at `/rathore65/p/privacy-policy`, it lacks an explicit Cookie Consent Banner.
- Because `BUG-001` redirects footer privacy links to Dukaan's corporate site, the merchant is currently non-compliant regarding transparent disclosure of the local Data Fiduciary.

---

## 12. Performance and Reliability

### 12.1 Bottleneck Analysis
1. **Server TTFB (1.5s–2.3s)**: Caused by dynamic server rendering on the Dukaan edge without edge full-page micro-caching for anonymous users.
2. **Document Payload Size (480 KB)**: The raw HTML document is bloated due to the complete inlining of store menus, catalog props, theme settings, and edge API configs inside `<script id="__DUKAAN_DATA__">`, alongside dozens of raw inlined SVGs.
3. **Render-Blocking Scripts**: 26 separate external script tags are loaded sequentially without bundling or deferral.

---

## 13. Reproducibility and Evidence Log

- **Audit Date**: October 2026
- **Auditor Runtime**: Windows 11 / Python 3.12.3 / OpenPyXL 3.1.5 / Pandas 2.2.2 / BeautifulSoup 4.12.3
- **Primary Data Artifacts Generated**:
  - `scripts/crawled_products.json` (SHA-256 verified, 16.6 KB)
  - `audit/FUNCTIONAL_TEST_CASES.xlsx` (9.5 KB)
  - `audit/FIX_PRIORITY_ROADMAP.xlsx` (8.1 KB)
  - `audit/WEBSITE_INVENTORY.md` (17.9 KB)
  - `audit/MASTER_AUDIT_REPORT.md` (16.9 KB)
- **Browser Subagent Video Evidence**: `file:///C:/Users/Achal/.gemini/antigravity-ide/brain/db6dcfb0-e5bc-43c6-b04e-fd86fc003c97/dukaan_store_audit_1793303484318.webp`

---

## 14. Missing Features and Improvement Roadmap

### 14.1 7-Day Urgent Remediation Plan
- **Day 1**: Resolve `BUG-001` (Fix footer legal links) and `BUG-004` (Remove `user-scalable=no` from mobile viewport).
- **Day 2**: Resolve `BUG-002` (Sanitize product descriptions to restore Schema.org JSON-LD validity).
- **Day 3**: Resolve `BUG-003` (Inject `Strict-Transport-Security` header at CDN/Nginx layer).
- **Day 4**: Resolve `BUG-005` (Configure active GA4 Measurement ID and Meta Pixel in Dukaan Plugins).
- **Day 5**: Resolve `CRO-001` (Declutter header navigation; remove legal policies and prioritize categories).
- **Day 6**: Resolve `BUG-006` (Demote logo from `<h1>` to `<div>`) and `BUG-010` (Populate store locator title).
- **Day 7**: Resolve `BUG-007` (Automate product image fallback alt attributes).

### 14.2 30-Day Growth Roadmap
- **Week 2**: Deploy anti-counterfeiting authenticity trust badges and an instant 6-digit Indian PIN code delivery checker on PDP.
- **Week 3**: Implement edge full-page caching for catalog pages to drop TTFB from 1,500ms to <200ms; externalize SVG sprite sheets.
- **Week 4**: Launch 1-click "Festival Battle Combo" product bundles to increase Average Order Value (AOV); consolidate 331 thin festival blog posts into comprehensive authority guides.

---

## 15. Instructions for the Next AI Reviewer

### 15.1 Review Sequence & High-Priority Files
When conducting a second-level review of this audit project, examine files in the following exact sequence:
1. **`audit/BUG_REPORT.md`**: Review the 11 confirmed defects, their reproduction steps, and developer code diffs.
2. **`scripts/check_jsonld.py`**: Execute this script to independently verify the RFC 8259 JSON syntax failure on the live store's product pages (`BUG-002`).
3. **`scripts/crawled_products.json`**: Inspect the normalized schema data collected across all 26 store products.
4. **`audit/FUNCTIONAL_TEST_CASES.xlsx`**: Review the full 24-case functional test execution matrix.
5. **`scripts/generate_excel_reports.py`**: Review the openpyxl generation logic for styling and conditional formatting rules.

### 15.2 Key Questions Requiring Merchant Clarification
The following questions cannot be resolved from public frontend analysis alone and require merchant feedback:
1. *Does the merchant possess an active Google Analytics 4 Measurement ID or Meta Pixel ID that was never pasted into the Dukaan plugin dashboard?*
2. *Can the merchant provide staff-level read-only access to the Dukaan Seller Portal to audit webhook delivery logs and courier integrations?*
3. *Is the merchant willing to migrate to a custom domain (e.g. `monokite.in`), which would eliminate multi-tenant cookie leakage and brand identity confusion?*

---

## 16. Guest Checkout System Architecture & Implementation

### 16.1 Overview & System Architecture
The platform features an automated, zero-friction **Guest Checkout System** allowing first-time visitors to purchase products, choose payment options, and place orders without creating an account or logging in.

```
[Guest Visitor]
      │
      ▼
[Browse Catalog & PDP]
      │
      ▼
[Add to Cart] ─── (Persistent Guest ID stored in LocalStorage & synced to Cart DB)
      │
      ▼
[Proceed to Checkout] (/checkout)
      │
      ├── Step 1: Cart Items & Add-ons
      ├── Step 2: Shipping & Contact (Name, Mobile, optional Email, Address, PIN Code auto-fetch)
      └── Step 3: Payment Method (Cash on Delivery OR Online Razorpay)
      │
      ▼
[Atomic Database Transaction] (Prisma $transaction)
      ├── 1. Server-side stock verification (aborts if stock insufficient)
      ├── 2. Concurrency & duplicate order prevention (15-second idempotency window)
      ├── 3. Create Order record with unique Order Number & crypto guestToken
      ├── 4. Create Payment record (COD or Razorpay)
      ├── 5. Atomically decrement inventory stock & create audit log
      ├── 6. Increment coupon usage count (if coupon applied)
      └── 7. Clear guest cart (preserves cart if transaction fails)
      │
      ▼
[Order Confirmation] (/orders/[id]?token=guestToken)
      │
      ▼
[Self-Service Order Tracking] (/track via Order # + Verified Mobile Number)
```

### 16.2 Database & Schema Changes
- **Model `Order` (`prisma/schema.prisma`)**:
  - `userId String?`: Nullable foreign key allowing unauthenticated customer orders.
  - `guestToken String? @unique`: Cryptographic 48-character hexadecimal token generated via `crypto.randomBytes(24)` enabling authorized guest order access without password authentication.
  - `guestEmail String?`, `guestName String?`, `guestPhone String?`: Secure storage of customer contact info.
  - `shippingAddress String`: JSON snapshot of address at time of purchase.

### 16.3 Validation Rules (`validations/index.ts`)
- `checkoutSchema`:
  - `email`: Optional or valid RFC 5322 email string.
  - `phone`: Sanitized 10-digit mobile number (`min(10)`).
  - `shippingAddress`:
    - `name`: Minimum 2 characters.
    - `phone`: Minimum 10 digits.
    - `street`: Minimum 5 characters.
    - `city`: Minimum 2 characters.
    - `state`: Minimum 2 characters.
    - `postalCode`: Minimum 4 characters (6-digit Indian PIN code).
    - `country`: Defaults to `"India"`.
  - `paymentMethod`: Enum `["COD", "RAZORPAY"]`.
  - `guestId`: Optional guest session identifier.
  - `idempotencyKey`: Optional submission deduplication key.

### 16.4 Backend Server Actions
1. **`createCheckoutOrderAction` (`server/actions/orderActions.ts`)**:
   - Calculates server-side prices and totals (`calculateCartTotals`), never trusting frontend pricing.
   - Executes inside `prisma.$transaction`.
   - Validates live stock per item before creating orders.
   - Deduplicates rapid repeated clicks within 15 seconds.
   - Clears guest cart only upon order success.
2. **`verifyAndConfirmPaymentAction` (`server/actions/orderActions.ts`)**:
   - Verifies Razorpay HMAC-SHA256 signature.
   - Updates order to `CONFIRMED` and payment to `PAID`.
   - Deducts stock and clears guest cart.
3. **`trackOrderAction` (`server/actions/orderActions.ts`)**:
   - Accepts Order Reference Number + verified 10-digit mobile number.
   - Prevents public data scraping while enabling instant guest tracking.

### 16.5 Frontend & UX Enhancements
- **Checkout Page (`app/(store)/checkout/page.tsx`)**:
  - Removed all login requirements or mandatory sign-in walls.
  - 3-step streamlined flow with automatic PIN code location detection.
  - Dual payment selection: Cash on Delivery (COD) and Online Payment (Razorpay / UPI / Cards).
  - Celebration confirmation modal with instant redirect to secure tracking.
- **Dedicated Order Tracking Page (`app/(store)/track/page.tsx`)**:
  - Allows customers to track orders with Order Reference and Mobile Number without logging in.
- **Order Details (`app/(store)/orders/[id]/page.tsx`)**:
  - Authorization check via token or user session.
  - Masks sensitive personal data (phone and street address) if accessed without verified authorization.
- **Navigation (`Header.tsx` & `Footer.tsx`)**:
  - Direct "Track Order" link in desktop navbar, mobile drawer, and footer.

### 16.6 Automated Verification Test Results
Executed via `scripts/test_guest_checkout.ts`:
- ✅ **Scenario 1**: Guest can add products to cart.
- ✅ **Scenario 2**: Guest cart persists across page refreshes.
- ✅ **Scenario 3**: Guest can proceed to checkout (Calculated totals securely on server).
- ✅ **Scenario 4**: Missing mandatory fields return validation error.
- ✅ **Scenario 5**: Invalid mobile numbers are strictly rejected.
- ✅ **Scenario 6**: Out-of-stock quantities cannot be ordered.
- ✅ **Scenario 7**: Failed orders retain all items in guest cart.
- ✅ **Scenario 8**: Guest can place a Cash on Delivery (COD) order successfully.
- ✅ **Scenario 9**: Guest cart clears automatically after successful order creation.
- ✅ **Scenario 10**: Repeated clicks within 15s prevent duplicate orders.
- ✅ **Scenario 11**: Guest can initiate Online Payment order (Razorpay integration).
- ✅ **Scenario 11b**: Online payment verification updates order to PAID and clears cart.
- ✅ **Scenario 12**: Guest can securely track order via Order Number + Mobile Number.
- ✅ **Scenario 13**: Order tracking with incorrect mobile number is rejected for privacy.
- ✅ **Scenario 14**: Authenticated user checkout continues working seamlessly.

**Overall Test Suite Status: 15 / 15 Passed (100% Success Rate).**

---
*End of Documentation File.*
