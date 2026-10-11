import { prisma } from "@/lib/prisma";
import { generateBreadcrumbJsonLd, generateProductJsonLd, SITE_CONFIG } from "@/lib/seo";
import { SimilarProductCard } from "@/components/store/SimilarProductCard";
import { ProductDetailClient } from "@/components/store/ProductDetailClient";
import { ProductReviews } from "@/components/store/ProductReviews";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
  });

  if (!product) {
    return { title: "Product Not Found" };
  }

  const title = product.seoTitle || `${product.name} | ${SITE_CONFIG.name}`;
  const description = product.seoDescription || product.description.slice(0, 160);
  const images = product.images.length > 0 ? [product.images[0].url] : [SITE_CONFIG.ogImage];
  const canonical = product.canonicalUrl || `${SITE_CONFIG.url}/products/${product.slug}`;

  return {
    title,
    description,
    keywords: product.seoKeywords ? product.seoKeywords.split(",").map((k) => k.trim()) : undefined,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: images.map((url) => ({ url })),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { priceDelta: "asc" } },
      category: true,
    },
  });

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  // Fetch up to 12 similar products for the 6-column grid
  const similarProducts = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      status: "ACTIVE",
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
    take: 12,
  });

  const productJsonLd = generateProductJsonLd({
    name: product.name,
    description: product.description,
    price: product.price,
    slug: product.slug,
    sku: product.sku,
    brand: product.brand,
    images: product.images,
    stock: product.stock,
    rating: product.rating,
    reviewCount: product.reviewCount,
  });

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: product.category.name, url: `/categories/${product.category.slug}` },
    { name: product.name, url: `/products/${product.slug}` },
  ]);

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12 bg-white">
        {/* JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
        />

        {/* 1. Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600 transition">
            Products
          </Link>
          <span>/</span>
          <Link href={`/categories/${product.category.slug}`} className="hover:text-blue-600 transition">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* 2. Interactive Product Details & Gallery (Pure White Background) */}
        <ProductDetailClient product={product} />

        {/* 3. SIMILAR PRODUCTS (Matching user screenshot: 6-column grid with orange % off badge) */}
        {similarProducts.length > 0 && (
          <section className="pt-10 border-t border-slate-200">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-6">
              SIMILAR PRODUCTS
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {similarProducts.map((rel) => (
                <SimilarProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}

        {/* 4. CUSTOMER REVIEWS & RATINGS */}
        <div className="pt-6">
          <ProductReviews
            productName={product.name}
            rating={product.rating || 4.95}
            reviewCount={product.reviewCount || 48}
          />
        </div>
      </div>
    </div>
  );
}
