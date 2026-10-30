# Rathore Patang Bhandar — Accessibility & Usability (UX) Audit

> **Store**: Rathore Patang Bhandar (`https://mydukaan.io/rathore65`)  
> **Platform**: MyDukaan  
> **Standards Assessed**: WCAG 2.1 Level AA, Mobile UX Guidelines, WAI-ARIA 1.2  
> **Auditor Role**: Senior UX Architect & Accessibility (A11y) Specialist  

---

## ♿ Executive Summary

The storefront provides an attractive, modern visual presentation featuring clean typography (`GalanoGrotesque`), crisp product photography, and responsive card layouts.

However, from an **accessibility and mobile usability standpoint**, the site contains several critical non-compliance items:
1. **WCAG 1.4.4 Violation**: Mobile pinch-to-zoom is strictly disabled via viewport metadata.
2. **WCAG 1.1.1 Violation**: Extensive missing image alt attributes across product sliders and catalog listings.
3. **Keyboard & Screen Reader Gaps**: Incomplete ARIA modal role declarations on cart drawers and search dropdowns.

---

## 📋 Accessibility & UX Compliance Matrix

| WCAG Guideline / UX Area | Compliance Status | Observed Behavior | Severity | Remediation Requirement |
| :--- | :--- | :--- | :--- | :--- |
| **1.4.4 Resize Text (Level AA)** | ❌ **FAIL** | `maximum-scale=1.0, user-scalable=no` hardcoded in `<meta name="viewport">`. | **High** | Remove `user-scalable=no` to allow low-vision users to zoom up to 200%. |
| **1.1.1 Non-Text Content (Level A)** | ❌ **FAIL** | 22–50 product and carousel images per page lack `alt` attributes. | **High** | Add descriptive alt text reflecting product name, color, and size. |
| **2.4.7 Focus Visible (Level AA)** | ⚠️ **NEEDS REVIEW** | Default browser outline visible on desktop tab; custom high-contrast focus rings missing on interactive buttons. | **Medium** | Implement explicit `:focus-visible` styling (`outline: 2px solid var(--primary);`). |
| **1.4.3 Contrast Minimum (Level AA)** | ⚠️ **PARTIAL** | Primary text (`#1a181e` on `#ffffff`) passes at 15.3:1. Secondary muted labels (`var(--black-50): #808080` on light gray) borderline at 3.9:1. | **Medium** | Darken secondary meta text to `#595959` to maintain >4.5:1 ratio. |
| **4.1.2 Name, Role, Value (Level A)** | ⚠️ **PARTIAL** | Search modal and Bag slide-over drawer lack `aria-modal="true"` and dynamic `aria-expanded` attributes. | **Medium** | Add proper ARIA attributes to modals and drawer toggles. |
| **Touch Target Ergonomics** | ✅ **PASS** | Mobile buttons (Add to Bag, Quantity +, -) meet 44x44px minimum touch targets. | **PASS** | Well-designed touch surfaces on mobile devices. |
| **Empty State Usability** | ✅ **PASS** | Empty search queries and empty bag display friendly illustrations and clear calls to action. | **PASS** | Good error recovery design. |

---

## 📱 Mobile Usability & Ergonomics Review

### 1. Viewport Zoom Lockout (`BUG-004`)
The document `<head>` forces:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
```
- **Usability Impact**: Kite threads and manja spools have critical visual details (e.g. ply count, gattu branding, holographic anti-counterfeiting stickers). Customers on mobile devices cannot zoom in to inspect whether the manja spool has authentic Monokite holographic packaging.

### 2. Sticky Add-to-Bag Button on Mobile
- In mobile screen sizes (`< 768px`), Dukaan applies:
  ```css
  .product-details-section .pdp-button-wrapper {
    position: fixed !important;
    width: 100% !important;
    z-index: 2;
  }
  ```
- **Positive Impact**: The "Add to Bag" CTA remains persistently accessible at the bottom of the viewport as the user scrolls through lengthy product descriptions, significantly boosting mobile conversion velocity.

### 3. Bottom Navigation Bar on Mobile
- Mobile view features a fixed bottom dock: **Home**, **Categories**, **Bag** (with badge counter), and **Account**.
- Navigation buttons are spaced comfortably with clear SVG icons and legible labels.

---

## ⌨️ Keyboard Navigation & Focus Flow

Testing with pure keyboard navigation (`Tab`, `Shift+Tab`, `Enter`, `Escape`):
1. **Search Bar**:
   - `Tab` successfully focuses search input.
   - Typing triggers dropdown; however, pressing the `Down Arrow` key does not navigate down the list of suggested items—user is forced to use the mouse cursor or keep tabbing through irrelevant header elements.
2. **Cart Drawer**:
   - When the Bag drawer opens, focus is not programmatically trapped inside the drawer. Pressing `Tab` continues to navigate background page links behind the overlay.
3. **Escape Key Handling**:
   - Pressing `Escape` successfully closes open search and cart modals.

---

## 🛠️ Accessibility Remediation Recommendations

1. **Unlock Mobile Viewport**:
   - Change to `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
2. **Enforce Image Alt Text Automation**:
   - Inject server-side fallback: `alt="Monokite Fighter Manja 6000m - Rathore Patang Bhandar"`.
3. **Implement Modal Focus Trapping**:
   - Add focus trap JavaScript on the cart drawer so keyboard navigation cycles cleanly through quantity controls and the checkout button while the drawer is active.
4. **Boost Contrast on Secondary Metadata**:
   - Increase color contrast of SKU, delivery estimates, and crossed-out MRP text to exceed WCAG 4.5:1 ratio.
