# Mono Kite / ApexCraft E-Commerce Platform
## Complete Project Documentation & Technical Architecture Specification

---

## 1. Executive Summary

**Mono Kite** (ApexCraft Pro) is a modern, full-stack e-commerce web platform engineered using **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM**. 

The system provides a customer storefront (with catalog browsing, search, guest/authenticated carts, coupon discounting, and Razorpay payments) coupled with an administrative back-office portal (`/admin`) for catalog management, warehouse stock control, order dispatching, and audit logging.

---

## 2. Technology Stack & Key Libraries

| Layer | Technologies / Libraries | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.8 (App Router), React 19.2.8 | Server-Side Rendering (SSR), Server Components, Server Actions |
| **Language** | TypeScript 5+ | End-to-end type safety |
| **Database & ORM** | SQLite (`prisma/dev.db`), Prisma ORM 6.19 | Local embedded relational DB, schema migrations, type-safe queries |
| **Authentication** | JWT (`jsonwebtoken`), `bcryptjs`, HttpOnly Cookies | Stateless session tokens, password hashing, role-based security |
| **Validation** | Zod 4.6.5 | Input validation for forms, mutations, and API requests |
| **Payments** | Razorpay Node SDK 2.9.8 | Payment order creation, webhook handling, SHA-256 HMAC signature verification |
| **Styling & UI** | Tailwind CSS v4, Lucide React icons, Canvas Confetti | Modern responsive UI, micro-interactions, dark accents |
| **SEO & Meta** | Schema.org JSON-LD, Dynamic `sitemap.ts`, `robots.ts` | Search engine indexing, rich snippets, social OpenGraph sharing |

---

## 3. System Architecture & Directory Layout

The application adheres strictly to Next.js App Router conventions, isolating public storefront routes from authenticated admin routes:

```
ecom/
├── app/
│   ├── (store)/                     # Public Storefront Route Group
│   │   ├── layout.tsx               # Store Header (Search, Cart, Auth) & Footer
│   │   ├── page.tsx                 # Homepage (Hero, Categories, Best Sellers, Reviews)
│   │   ├── products/
│   │   │   ├── page.tsx             # Catalog with category, sorting, and price filters
│   │   │   └── [slug]/page.tsx      # Product Detail Page (PDP) with SEO Schema JSON-LD
│   │   ├── categories/[slug]/page.tsx # SEO Category Hubs
│   │   ├── search/page.tsx          # Real-time search page
│   │   ├── cart/page.tsx            # Shopping cart overview
│   │   ├── checkout/page.tsx        # Shipping address form & Razorpay payment gateway
│   │   ├── orders/[id]/page.tsx     # Order confirmation & digital invoice receipt
│   │   └── blog/                    # Content marketing & kite flying guides
│   ├── admin/                       # Protected Back-Office Management Portal
│   │   ├── layout.tsx               # Admin Navigation & Role Guard (ADMIN / STAFF)
│   │   ├── page.tsx                 # KPI Analytics Dashboard (Revenue, Orders, Low Stock)
│   │   ├── products/                # Catalog CRUD (List, Add, Edit, Safe Archive/Delete)
│   │   ├── categories/              # Category Hubs (Add, Edit, Safe Delete)
│   │   ├── inventory/               # Real-time Stock Adjustments & Movement Audit Logs
│   │   ├── orders/                  # Order fulfillment & status updates
│   │   ├── customers/               # Customer account directory & lifetime value
│   │   ├── coupons/                 # Promotional discount codes generator
│   │   └── blog/                    # Article editorial publisher
│   ├── api/                         # Backend API Route Handlers
│   │   ├── auth/me/route.ts         # User session check
│   │   ├── products/search/route.ts # Live search suggestions
│   │   └── webhooks/razorpay/route.ts # Razorpay webhook receiver
│   ├── sitemap.ts                   # Dynamic database-driven XML sitemap
│   └── robots.ts                    # Search crawler rules
├── components/                      # UI Components
│   ├── store/                       # Storefront UI (CartDrawer, ProductCard, Checkout)
│   └── admin/                       # Admin UI (ProductForm, CategoryManager, InventoryAdjustor)
├── context/
│   ├── AuthContext.tsx              # User authentication state & login modal
│   └── CartContext.tsx              # Cart item count & flyout drawer state
├── lib/
│   ├── prisma.ts                    # Global Prisma client singleton
│   ├── auth.ts                      # JWT session generation, verification & role enforcement
│   ├── cart.ts                      # Server-side pricing & coupon calculation engine
│   ├── razorpay.ts                  # Payment SDK instance & signature validator
│   └── utils.ts                     # Currency formatting (INR ₹), slug generation
├── server/actions/                  # Next.js Server Actions (Mutations)
│   ├── authActions.ts               # Login, Register, Logout
│   ├── storeActions.ts              # Add/Update/Remove cart items, apply coupon
│   ├── orderActions.ts              # Create order, initiate payment, verify payment
│   └── adminActions.ts              # Admin mutations (Products, Categories, Stock, Orders)
├── prisma/
│   ├── schema.prisma                # Relational database schema
│   ├── seed.ts                      # Production-like mock catalog & default accounts
│   └── dev.db                       # Active SQLite database file
└── validations/                     # Zod schema definitions
```

---

## 4. Database Architecture & Models

Configured in `prisma/schema.prisma`:

### Table Specifications:

1. **`User`**:
   - `id`, `email` (unique), `name`, `passwordHash`, `role` (`CUSTOMER`, `STAFF`, `ADMIN`), `phone`, timestamps.
2. **`Address`**:
   - `userId`, `name`, `phone`, `street`, `city`, `state`, `postalCode`, `country`, `isDefault`.
3. **`Category`**:
   - `name`, `slug` (unique), `description`, `imageUrl`, `seoTitle`, `seoDescription`, `featured`.
4. **`Product`**:
   - `name`, `slug`, `sku` (unique), `description`, `shortDescription`, `price`, `compareAtPrice`, `costPrice`, `stock`, `status` (`ACTIVE`, `DRAFT`, `ARCHIVED`), `categoryId`, `brand`, `rating`, `reviewCount`, `featured`, SEO fields.
5. **`ProductImage` & `ProductVariant`**:
   - Support for multiple product gallery pictures and product variations (e.g., spool lengths: 5000m, 9000m, colors).
6. **`Cart` & `CartItem`**:
   - Supports both logged-in users (`userId`) and anonymous visitors (`guestId`), with automatic item persistence.
7. **`Order` & `OrderItem`**:
   - `orderNumber` (e.g. `ORD-2026-XXXXX`), status (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `RETURNED`), shipping JSON snapshot, subtotal, discount, tax, shipping fee, total, tracking numbers.
8. **`Payment`**:
   - `orderId`, `amount`, `currency`, `provider` (`RAZORPAY`), `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, `status` (`PENDING`, `PAID`, `FAILED`).
9. **`Inventory`**:
   - Audit trail for stock changes (`productId`, `change`, `reason`: `RESTOCK`, `CORRECTION`, `DAMAGE`, `RETURN`, `ORDER_PLACED`).
10. **`Coupon` & `CouponUsage`**:
    - Promotional codes (`PERCENTAGE` or `FIXED`), minimum order requirements, max discounts, and per-user usage tracking.

---

## 5. Dynamic Catalog & Inventory Operations

All changes made in the admin portal interact directly with the database via Server Actions:

### Product Management
- **Create**: `createProductAction` creates product record, variants, image gallery items, and an initial `Inventory` log record.
- **Update**: `updateProductAction` synchronizes fields, updates images/variants, and invalidates Next.js route caches (`/products`, `/products/[slug]`).
- **Safe Delete / Archive**: `deleteProductAction` checks if the product is linked to existing customer order records.
  - If ordered: Safely transitions to `status = "ARCHIVED"` and `stock = 0`, preserving historical customer invoices and financial audit logs.
  - If not ordered: Fully deletes related images, variants, cart items, and inventory logs.

### Category Management
- **Create**: `createCategoryAction` with automatic slugification.
- **Update**: `updateCategoryAction` for metadata and homepage featured status.
- **Safe Delete**: `deleteCategoryAction` prevents orphaned products by verifying that 0 products belong to the category before permitting deletion.

### Real-Time Inventory Control
- **Stock Adjustment**: `adjustInventoryAction` atomically modifies product `stock` using `{ increment: change }` and appends a permanent timestamped entry to the `Inventory` audit log.
- **Reasons Recorded**: `RESTOCK` (batch arrival), `CORRECTION` (physical count), `DAMAGE` (warehouse transit), and `RETURN`.

---

## 6. Authentication & Security Architecture

1. **Password Security**: Passwords are salted and hashed using `bcryptjs` with 10 rounds.
2. **Session Cookies**: Upon login, a JWT containing `{ id, email, role, name }` is written to an **HttpOnly, SameSite=Lax** cookie (`auth_token`), preventing client-side XSS token theft.
3. **Role-Based Access Control (RBAC)**:
   - Server Actions enforce permissions via `requireAuth(["ADMIN", "STAFF"])`.
   - Unauthorized requests immediately throw access violations or redirect to login.
4. **Price Tampering Protection**:
   - The client never passes order prices to the payment gateway.
   - During checkout, `calculateCartTotals` fetches fresh product prices, active coupon validations, and shipping rules directly from the database before generating Razorpay orders.

---

## 7. Configuration & Environment Variables

The project reads settings from `.env`:

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
AUTH_SECRET="ecom_super_secret_jwt_key_984395874293847293847293"

# Payment Gateway (Razorpay Test Keys)
RAZORPAY_KEY_ID="rzp_test_sampleKeyId123"
RAZORPAY_KEY_SECRET="sampleSecretKey456"
RAZORPAY_WEBHOOK_SECRET="whsec_sampleSecretWebhook789"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_sampleKeyId123"

# Media Storage
CLOUDINARY_CLOUD_NAME="monokite_india"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="sampleCloudinarySecret"

# Storefront Branding & SEO
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_STORE_NAME="Mono Kite"
NEXT_PUBLIC_STORE_CURRENCY="₹"
```

---

## 8. Developer & Operational Runbook

### Starting Development Server
```bash
npm run dev
```
Store URL: `http://localhost:3000`  
Admin Control Center: `http://localhost:3000/admin`

### Default Login Accounts
- **Administrator**: `admin@store.com` | Password: `admin123`
- **Customer**: `rahul.sharma@example.com` | Password: `customer123`

### Inspecting Database Visually (Prisma Studio)
```bash
npx prisma studio
```
Opens interactive GUI at `http://localhost:5555`.

### Reseeding the Database
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### Switching to Production Database (e.g., PostgreSQL)
To transition from SQLite to PostgreSQL (Supabase, Neon, or Railway):
1. In `prisma/schema.prisma`, update the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `DATABASE_URL` in `.env` to your PostgreSQL connection string.
3. Run `npx prisma db push` to generate all tables.
