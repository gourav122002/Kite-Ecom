Production-Ready ArchitectureSmall Next.js Ecommerce Website
Practical architecture for a small ecommerce store with storefront + admin
1. Recommended Stack
Next.js 16+ with TypeScript and App Router
PostgreSQL database
Prisma ORM
Auth.js / Better Auth
Tailwind CSS
Zod for validation
Razorpay for Indian payments
Cloudinary or Amazon S3 for product images
Vercel for deployment
2. High-Level Architecture
Customer → Next.js Storefront/Admin → Server Actions/API Routes → Prisma → PostgreSQL
Next.js also integrates with Cloudinary/S3 for images and Razorpay for payments.
Keep storefront, admin, and backend-for-frontend logic in one Next.js application initially.
3. Recommended Project Structure
ecommerce/├── app/│   ├── (store)/│   │   ├── page.tsx│   │   ├── products/│   │   │   ├── page.tsx│   │   │   └── [slug]/page.tsx│   │   ├── categories/[slug]/page.tsx│   │   ├── search/page.tsx│   │   ├── cart/page.tsx│   │   ├── checkout/page.tsx│   │   ├── orders/[id]/page.tsx│   │   └── blog/[slug]/page.tsx│   ├── admin/│   │   ├── page.tsx│   │   ├── products/│   │   ├── categories/│   │   ├── orders/│   │   ├── customers/│   │   ├── coupons/│   │   ├── inventory/│   │   └── blog/│   ├── api/│   │   ├── auth/│   │   ├── products/│   │   ├── orders/│   │   ├── payments/│   │   ├── webhooks/│   │   └── uploads/│   ├── sitemap.ts│   ├── robots.ts│   └── layout.tsx├── components/├── lib/├── server/├── prisma/├── validations/├── types/├── public/├── middleware.ts└── next.config.ts
4. Database Architecture
Core tables: User, Product, Category, ProductImage, ProductVariant, Cart, CartItem, Order, OrderItem, Address, Payment, Coupon, CouponUsage, Inventory, BlogPost.
Main relationships: Category → Products; Product → ProductImages/ProductVariants; User → Addresses/Orders/Cart; Order → OrderItems → Product.
5. Product Model
Recommended fields: id, name, slug, sku, description, shortDescription, price, compareAtPrice, costPrice, stock, status, categoryId, seoTitle, seoDescription, seoKeywords, brand, canonicalUrl, createdAt, updatedAt.
Keep SEO fields directly on Product for a small store.
6. SEO-Friendly URLs
/products/mono-kite-manja
/categories/kite-manja
/blog/article-slug
Keep slugs stable. Avoid query-based product URLs such as /product?id=123.
7. Next.js Rendering Strategy
Use Server Components for product pages, category pages, blog pages, homepage and informational pages.
Use dynamic/client functionality only where needed: cart, filters, search UI, checkout forms and admin forms.
Cache product/category/blog content and revalidate after admin updates.
8. Technical SEO
Every indexable product/page should have a unique title, meta description, canonical URL and Open Graph metadata.
Generate Product and BreadcrumbList structured data where applicable.
Generate /sitemap.xml from database content.
Generate /robots.txt and keep admin, API, cart, checkout and account areas out of the sitemap.
Maintain clean internal linking between categories, products and useful content.
9. Admin Architecture
Use /admin inside the same Next.js project initially.
Sections: Dashboard, Products, Categories, Orders, Customers, Inventory, Coupons and Blog.
Use real authentication and server-side authorization. Roles can start with CUSTOMER, STAFF and ADMIN.
10. Server Actions vs API Routes
Use Server Actions for internal admin mutations such as creating products, updating inventory and managing coupons.
Use API routes for external integrations, payment webhooks and third-party callbacks.
Never expose database credentials to the browser.
11. Cart and Checkout
Guest carts can use cookies/local storage; logged-in carts can be stored in the database.
On login, merge the guest cart into the user's database cart.
Never trust price, discount or total values supplied by the browser. Recalculate prices and totals on the server from database data.
12. Payment Flow
Customer → Checkout → Server creates order → Razorpay order → Payment → Razorpay webhook → Server verifies payment → Order/payment status updated.
Do not mark an order as paid solely from a frontend success callback. Verify server-side/webhook signatures.
13. Order & Payment Status
Order: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURN_REQUESTED, RETURNED, REFUNDED.
Payment: PENDING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED.
Keep order status and payment status separate.
14. Inventory
Do not reduce stock simply because a product was added to a cart.
Reserve/decrease inventory when an order is created according to your business rules, and release it when payment fails or an order is cancelled.
15. Images & Media
Store product images in Cloudinary or S3, not directly in PostgreSQL.
Store image URL, alt text and sort order in ProductImage.
Use optimized image formats/sizes and meaningful alt text.
16. Search
Start with PostgreSQL search for a small catalog using product name, SKU, category and brand.
Only introduce Meilisearch, Typesense or Algolia when catalog/search requirements justify the added infrastructure.
17. Performance & Core Web Vitals
Prefer Server Components.
Use next/image, optimized fonts, caching and CDN delivery.
Avoid making the entire application a Client Component.
Keep JavaScript to the minimum required for interaction.
18. Security Checklist
HTTPS, secure/HttpOnly cookies, authentication, server-side authorization, input validation with Zod, rate limiting, webhook signature verification, password hashing, upload validation, file-size limits and admin audit logs.
Never commit .env or secret credentials to Git.
19. Environment Variables
DATABASE_URL=AUTH_SECRET=RAZORPAY_KEY_ID=RAZORPAY_KEY_SECRET=RAZORPAY_WEBHOOK_SECRET=CLOUDINARY_CLOUD_NAME=CLOUDINARY_API_KEY=CLOUDINARY_API_SECRET=NEXT_PUBLIC_SITE_URL=
Do not expose secrets through NEXT_PUBLIC_ variables.
20. Analytics & Search
Connect Google Analytics 4, Google Search Console and Google Merchant Center as appropriate.
Track view_item, add_to_cart, begin_checkout, purchase and search events.
21. Deployment
Recommended simple production setup: GitHub → Vercel → Next.js; managed PostgreSQL such as Neon/Supabase; Cloudinary for images; Razorpay for payments; your custom domain.
Avoid AWS/Kubernetes/microservices until scale or operational requirements justify them.
22. What NOT to Build Initially
Microservices, Kubernetes, Redis, Elasticsearch, RabbitMQ/Kafka, a separate frontend/backend, a separate admin application, complex recommendation engines and other infrastructure that is not yet required.
23. Final Recommended Architecture
ONE Next.js application + ONE PostgreSQL database + Prisma + ONE admin + Razorpay + Cloudinary/S3 + proper authentication + SEO + analytics.
The goal is a small production system with a simple architecture that can grow without requiring a complete rewrite.
Implementation Priority
1. Initialize Next.js + TypeScript + App Router.
2. Set up PostgreSQL + Prisma and migrations.
3. Build Product/Category models and storefront pages.
4. Implement SEO metadata, sitemap, robots and structured data.
5. Build authentication and /admin authorization.
6. Build product/order/inventory administration.
7. Implement cart and server-side checkout calculations.
8. Integrate Razorpay and verified webhooks.
9. Add image storage/optimization.
10. Add analytics, Search Console and Merchant Center.
11. Run security, performance and SEO audits before launch.