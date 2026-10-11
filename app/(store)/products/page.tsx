import { prisma } from "@/lib/prisma";
import { sortProductsByPriority } from "@/lib/productOrder";
import { ProductCard } from "@/components/store/ProductCard";
import { Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Artisan Kites, Mono Manja & Spools",
  description:
    "Explore our complete catalog of tournament Mono Kite Manja, Bareilly cotton cords, fighter kites, and carved wooden firkis.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const categorySlug = params.category;
  const sort = params.sort || "latest";

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: { where: { status: "ACTIVE" } } },
      },
    },
  });

  const whereClause: any = {
    status: "ACTIVE",
  };

  if (categorySlug) {
    whereClause.category = { slug: categorySlug };
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "rating") orderBy = { rating: "desc" };

  const rawProducts = await prisma.product.findMany({
    where: whereClause,
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      variants: true,
    },
    orderBy,
  });

  const products = sort === "latest" ? sortProductsByPriority(rawProducts) : rawProducts;

  const activeCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Breadcrumb */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-slate-800">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">
            {activeCategory ? activeCategory.name : "All Products"}
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          {activeCategory ? activeCategory.name : "Artisan Kite & Thread Catalog"}
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          {activeCategory?.description ||
            "Discover tournament-proven Mono Kite Manja, hand-balanced fighter kites, and precision firki reels built for aerial combat."}
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/products"
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              !categorySlug
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Items ({categories.reduce((sum, c) => sum + c._count.products, 0)})
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}${sort !== "latest" ? `&sort=${sort}` : ""}`}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                categorySlug === cat.slug
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat.name} ({cat._count.products})
            </Link>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Sort:</span>
          <div className="flex gap-1 text-xs">
            <Link
              href={`/products?${categorySlug ? `category=${categorySlug}&` : ""}sort=latest`}
              className={`rounded-lg px-2.5 py-1 ${
                sort === "latest" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Latest
            </Link>
            <Link
              href={`/products?${categorySlug ? `category=${categorySlug}&` : ""}sort=price_asc`}
              className={`rounded-lg px-2.5 py-1 ${
                sort === "price_asc" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Price: Low-High
            </Link>
            <Link
              href={`/products?${categorySlug ? `category=${categorySlug}&` : ""}sort=rating`}
              className={`rounded-lg px-2.5 py-1 ${
                sort === "rating" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Top Rated
            </Link>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 py-16 text-center">
          <h3 className="text-lg font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            There are currently no products in this category. Try selecting another collection.
          </p>
          <Link
            href="/products"
            className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white"
          >
            Clear Filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
