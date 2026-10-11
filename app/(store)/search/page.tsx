import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { Search } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Catalog",
  description: "Search for Mono Kite Manja, fighter kites, and artisan spools.",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  let products: any[] = [];
  if (query) {
    products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { sku: { contains: query } },
          { brand: { contains: query } },
        ],
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Search Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-black text-slate-900">
          {query ? `Search Results for "${query}"` : "Search Our Catalog"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {query
            ? `Found ${products.length} matching ${products.length === 1 ? "product" : "products"}`
            : "Type a keyword above or explore our popular categories."}
        </p>
      </div>

      {/* Results */}
      {query && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No matching products found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            We couldn&apos;t find any products matching &ldquo;{query}&rdquo;. Try checking the spelling or searching for &ldquo;Manja&rdquo;, &ldquo;Kite&rdquo;, or &ldquo;Firki&rdquo;.
          </p>
          <Link
            href="/products"
            className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition"
          >
            Browse All Products
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
