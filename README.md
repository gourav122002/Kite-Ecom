# Mono Kite / ApexCraft E-Commerce Platform

Production-ready Next.js E-Commerce platform built with Next.js 16 App Router, Prisma ORM, SQLite/PostgreSQL, Tailwind CSS, and Razorpay.

> 📖 **Full System Documentation**: See [docs/PROJECT_DOCUMENTATION.md](file:///c:/ai%20project/ecom/docs/PROJECT_DOCUMENTATION.md) for comprehensive data models, security workflows, admin guide, and architecture diagrams.

---

## 🚀 Architecture Highlights

- **Framework**: Next.js 16+ App Router with TypeScript & Server Components
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM
- **Authentication**: JWT & HttpOnly secure session cookies with role-based access control (`CUSTOMER`, `STAFF`, `ADMIN`) and `bcryptjs` password hashing
- **Styling**: Tailwind CSS with sleek glassmorphism, modern typography, responsive layouts, and interactive micro-animations
- **Validation**: Strict Zod validation schemas for forms, server actions, and API payloads
- **Payments**: Razorpay payment integration with server-side signature verification and webhook handling
- **Inventory & Cart**: Server-side price & discount recalculation, guest cart + logged-in user cart synchronization, inventory logs
- **Technical SEO**:
  - Dynamic `sitemap.ts` and `robots.ts`
  - Canonical URLs, OpenGraph tags, and Twitter Cards
  - Schema.org JSON-LD structured data (`Product`, `BreadcrumbList`, `Organization`)
- **Admin Portal (`/admin`)**:
  - Analytics KPI dashboard (Revenue, Orders, Products, Customers, Low Stock alerts)
  - Products CRUD (SKUs, Pricing, Stock, Images, SEO fields)
  - Categories management
  - Orders management & status updates (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`)
  - Warehouse Inventory Adjustments & Audit Logs
  - Promotions & Coupon code generator (`WELCOME10`, `FESTIVAL20`, `FLAT150`)
  - Artisan Blog & Knowledge Guides publisher

---

## 📂 Project Structure

```
ecom/
├── app/
│   ├── (store)/                   # Public Storefront Route Group
│   │   ├── layout.tsx             # Store Header & Footer layout
│   │   ├── page.tsx               # Storefront Homepage
│   │   ├── products/
│   │   │   ├── page.tsx           # Product Catalog & Filters
│   │   │   └── [slug]/page.tsx    # Product Detail Page (PDP) & JSON-LD
│   │   ├── categories/[slug]/page.tsx # Category Hubs
│   │   ├── search/page.tsx        # Search Catalog
│   │   ├── cart/page.tsx          # Shopping Cart
│   │   ├── checkout/page.tsx      # Secure Checkout & Razorpay
│   │   ├── orders/[id]/page.tsx   # Order Confirmation & Receipt
│   │   └── blog/
│   │       ├── page.tsx           # Artisan Blog Listing
│   │       └── [slug]/page.tsx    # Single Article View
│   ├── admin/                     # Role-Protected Admin Portal
│   │   ├── layout.tsx             # Admin Navigation & Auth Guard
│   │   ├── page.tsx               # Dashboard & KPIs
│   │   ├── products/              # Products Catalog Management
│   │   ├── categories/            # Category Hub Management
│   │   ├── orders/                # Order Fulfillment & Tracking
│   │   ├── inventory/             # Inventory Movement & Adjustments
│   │   ├── coupons/               # Promo Code Creator
│   │   ├── customers/             # Customer Accounts & Lifetime Spend
│   │   └── blog/                  # Blog Posts Editor
│   ├── api/
│   │   ├── auth/me/route.ts       # Auth Session Check
│   │   ├── products/search/route.ts # Live Product Search
│   │   └── webhooks/razorpay/route.ts # Razorpay Webhook Receiver
│   ├── sitemap.ts                 # Dynamic Database Sitemap
│   ├── robots.ts                  # Robots.txt Configuration
│   └── layout.tsx                 # Root Providers & Fonts
├── components/
│   ├── store/                     # Storefront UI Components
│   └── admin/                     # Admin Portal Components
├── context/
│   ├── AuthContext.tsx            # Client Auth State
│   └── CartContext.tsx            # Cart & Drawer State
├── lib/
│   ├── prisma.ts                  # Prisma Singleton
│   ├── auth.ts                    # JWT / Password / Role Utils
│   ├── razorpay.ts                # Payment Gateway & Signatures
│   ├── cart.ts                    # Server-Side Cart Calculation Engine
│   ├── seo.ts                     # Schema.org JSON-LD Builders
│   └── utils.ts                   # Formatting & Helper Utils
├── server/actions/
│   ├── authActions.ts             # Login / Register Server Actions
│   ├── storeActions.ts            # Cart & Coupon Actions
│   ├── orderActions.ts            # Checkout & Payment Actions
│   └── adminActions.ts            # Admin Mutations & Audits
├── prisma/
│   ├── schema.prisma              # Complete Database Schema
│   └── seed.ts                    # Realistic Demo Seeding Script
├── validations/                   # Zod Validation Schemas
└── middleware.ts                  # Security Headers & Middleware
```

---

## 🔑 Default Demo Accounts

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Administrator** | `admin@store.com` | `admin123` | Full access to `/admin` and storefront |
| **Customer** | `rahul.sharma@example.com` | `customer123` | Storefront customer account |

*(1-Click Demo Login buttons are also available in the Sign In modal on the header).*

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (`.env`)
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="ecom_super_secret_jwt_key_984395874293847293847293"
RAZORPAY_KEY_ID="rzp_test_sampleKeyId123"
RAZORPAY_KEY_SECRET="sampleSecretKey456"
RAZORPAY_WEBHOOK_SECRET="whsec_sampleSecretWebhook789"
CLOUDINARY_CLOUD_NAME="demo_store"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="sampleCloudinarySecret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_STORE_NAME="ApexCraft"
NEXT_PUBLIC_STORE_CURRENCY="₹"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_sampleKeyId123"
```

### 3. Database Sync & Seed
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the store, or [http://localhost:3000/admin](http://localhost:3000/admin) to view the admin control center.
