# Rathore Patang Bhandar — Security & Privacy Technical Review

> **Store**: Rathore Patang Bhandar (`https://mydukaan.io/rathore65`)  
> **Platform**: MyDukaan  
> **Auditor Role**: Senior Application Security Reviewer & Compliance Specialist  
> **Scope**: Authorized, non-destructive security headers, transport encryption, cookie attributes, secret leakage, and privacy compliance review.  

---

## 🛡️ Executive Summary

The storefront is served over valid TLS/HTTPS encryption with trusted certificates issued to `*.mydukaan.io`. Non-destructive testing confirmed that **no payment gateway private keys, database credentials, or secret API tokens are exposed in public client scripts**.

However, the hosting infrastructure suffers from **critical HTTP security header deficiencies**, loose cookie scoping, and cross-subdomain framing permissions that create clickjacking vulnerabilities.

---

## 🔐 Transport & HTTP Security Headers Matrix

| Security Header | Status | Current Value | Severity | Risk & Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Strict-Transport-Security (HSTS)** | ❌ **MISSING** | *None* | **Critical** | Browsers are not instructed to enforce HTTPS. Users on public Wi-Fi or compromised routers are susceptible to SSL-stripping man-in-the-middle attacks. |
| **Content-Security-Policy (CSP)** | ⚠️ **PARTIAL** | `frame-ancestors 'self' *.mydukaan.io;` | **High** | CSP only specifies `frame-ancestors` and explicitly permits any subdomain under `*.mydukaan.io` to iframe the store. A compromised store on Dukaan can embed this store for clickjacking attacks. |
| **X-Content-Type-Options** | ❌ **MISSING** | *None* | **Medium** | Missing `nosniff` directive allows older browsers to MIME-sniff response bodies away from declared Content-Types, enabling drive-by script execution. |
| **X-Frame-Options** | ❌ **MISSING** | *None* | **Medium** | Relies solely on CSP `frame-ancestors` which is not supported by legacy user agents. |
| **Referrer-Policy** | ❌ **MISSING** | *None* | **Medium** | Outbound requests (e.g. to third-party image CDNs or analytics) may leak full internal URL query strings containing customer session tokens or search parameters. |
| **Permissions-Policy** | ❌ **MISSING** | *None* | **Low** | Does not explicitly restrict browser hardware APIs (e.g., camera, microphone, geolocation, payment request API). |

---

## 🍪 Cookie Configuration & Session Security

Inspection of cookies set upon visiting `https://mydukaan.io/rathore65`:

```http
Set-Cookie: dkn_visit_count=1; Max-Age=31536000; Path=/; Expires=Fri, 29 Oct 2027 19:56:03 GMT; HttpOnly
Set-Cookie: dkn-session-id=3z1M-1793303763262; Max-Age=1800; Path=/; Expires=Thu, 29 Oct 2026 20:26:03 GMT; HttpOnly; Secure
```

### Key Security Findings:
1. **`dkn_visit_count` Missing `Secure` Flag**:
   - The visit tracker cookie is transmitted over unencrypted HTTP requests if the user inadvertently initiates a plaintext connection.
2. **Global Cookie Path (`Path=/`)**:
   - Both session cookies are set on the root path `Path=/` of `mydukaan.io`.
   - **Multi-Tenant Cross-Contamination Risk**: Because all stores without custom domains share the `mydukaan.io` domain, cookies set on `Path=/` are shared or overwritable across distinct merchant stores on the platform.
   - **Recommendation**: Dukaan should isolate session cookies per store prefix (`Path=/rathore65/`) or migrate merchants to unique subdomains/custom domains.

---

## 🕵️ Client-Side Secret Leakage & Script Audit

Automated string pattern analysis and regex scanning were executed across:
- All HTML document inline `<script>` tags
- Inlined JSON payloads (`__DUKAAN_DATA__`)
- External script bundles (`auth.js`, `main.js`, `dukaan-utils.js`)

### Findings:
- **Payment Keys**: No Razorpay Key Secrets (`rzp_live_secret`), Cashfree App Secrets, or Stripe Private Keys were found exposed in client source code. Client scripts only interact with platform edge endpoints (`/api/v2/...`).
- **Database Credentials**: No database URLs, PostgreSQL connection strings, or Prisma client secrets detected.
- **Server Version Leakage (`BUG-011`)**:
  - The server publicly broadcasts `Server: nginx/1.31.3` and internal software identifiers (`X-Powered-By: DukaanTech|Sceptre`).
  - While not an exploitable vulnerability alone, it aids attackers during reconnaissance.

---

## 📜 Privacy & DPDP Act Compliance (India)

Under India's **Digital Personal Data Protection Act (DPDP Act 2023)**, ecommerce operators must provide clear consent notices and transparent data retention policies.

### Findings:
1. **Privacy Policy Content**:
   - A dedicated privacy policy is hosted at `/rathore65/p/privacy-policy`.
   - Outlines collection of name, mobile number, shipping address, and order history for fulfillment.
2. **Cookie Consent Banner**:
   - The storefront currently **lacks an active cookie consent banner** or tracker disclosure modal.
   - While common among Indian SME stores, compliance with evolving DPDP guidelines will require explicit consent mechanisms prior to firing third-party advertising tracking pixels.
3. **Broken Footer Links (`BUG-001`)**:
   - Footer links redirect to Dukaan's enterprise privacy policy instead of the store's policy, creating legal ambiguity regarding who acts as the Data Fiduciary (the merchant vs MyDukaan).

---

## 🛠️ Security Hardening Roadmap

1. **Deploy HSTS Immediately**:
   - Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` at the CDN/Nginx layer.
2. **Harden Content-Security-Policy**:
   - Replace open wildcard `*.mydukaan.io` with restricted trusted origins:
     `Content-Security-Policy: default-src 'self' https://dukaan.b-cdn.net https://*.mydukaan.io; frame-ancestors 'self';`
3. **Add Missing Defensive Headers**:
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
4. **Mask Server Signature**:
   - Configure Nginx `server_tokens off;` to suppress version `1.31.3`.
