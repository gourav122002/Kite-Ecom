import { prisma } from "@/lib/prisma";
import { generateBreadcrumbJsonLd, SITE_CONFIG } from "@/lib/seo";
import { ProductCard } from "@/components/store/ProductCard";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) return { title: "Category Not Found" };

  return {
    title: category.seoTitle || `${category.name} | ${SITE_CONFIG.name}`,
    description:
      category.seoDescription ||
      category.description ||
      `Shop ${category.name} online at ${SITE_CONFIG.name}.`,
    alternates: {
      canonical: `${SITE_CONFIG.url}/categories/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "ACTIVE" },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          category: true,
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const breadcrumbsJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Categories", url: "/products" },
    { name: category.name, url: `/categories/${category.slug}` },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      {/* Header & Breadcrumbs */}
      <div className="border-b border-slate-200 pb-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-slate-800">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-slate-800">
            Categories
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{category.name}</span>
        </nav>
        <h1 className="text-3xl font-black text-slate-900">{category.name}</h1>
        {category.description && (
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">{category.description}</p>
        )}
      </div>

      {/* Product List */}
      {category.products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 py-16 text-center">
          <h3 className="text-lg font-bold text-slate-800">No products found in this category</h3>
          <p className="text-xs text-slate-500 mt-1">
            New inventory is arriving soon. Explore our full catalog below.
          </p>
          <Link
            href="/products"
            className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white"
          >
            Shop All Products
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-4">
            Showing {category.products.length} {category.products.length === 1 ? "product" : "products"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
