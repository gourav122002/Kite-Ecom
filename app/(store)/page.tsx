import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import {
  ArrowRight,
  Award,
  CheckCircle,
  Flame,
  Layers,
  Package,
  Shield,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  Wind,
  Zap,
} from "lucide-react";
import { sortProductsByPriority } from "@/lib/productOrder";
import { HeroProductSlider } from "@/components/store/HeroProductSlider";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  const [rawProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      take: 10,
      include: {
        _count: {
          select: { products: { where: { status: "ACTIVE" } } },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const allProducts = sortProductsByPriority(rawProducts);

  // 4 Flagship Manjha products for Hero Slider
  const heroSlugs = [
    "mono-kite-manja",
    "monokite-fighter-manjha-6000m",
    "tuntun-manja-tournament-edition",
    "monofil-gold-manja-special-edition-8000m",
  ];
  const heroSliderProducts = heroSlugs
    .map((slug) => allProducts.find((p) => p.slug === slug))
    .filter(Boolean) as typeof allProducts;

  // 3 Special Cotton Fighter Manja products
  const cottonSlugs = [
    "mayur-gold-cotton-manja-8000m",
    "red-panda-manjha-original-5000m",
    "100-pure-cotton-kite-manja-3-reel-9-cord",
  ];
  const cottonProducts = cottonSlugs
    .map((slug) => allProducts.find((p) => p.slug === slug))
    .filter(Boolean) as typeof allProducts;

  // Pack of 2 Manja products (Twin spool value packs)
  const packOf2Products = allProducts.filter(
    (p) =>
      p.category.slug === "kite-manja" &&
      (p.slug.includes("pack-of-2") || p.name.toLowerCase().includes("pack of 2"))
  );

  // Fighter & Designer Kites (Patang)
  const kiteProducts = allProducts.filter(
    (p) => p.category.slug === "handcrafted-kites"
  );

  // Products excluded from the main All Products section (Kites & Firki reels)
  const EXCLUDED_FROM_MAIN_CATALOG = new Set([
    "big-fighter-kites-pack-of-25",
    "big-fighter-kites-pack-of-40",
    "handcrafted-wooden-kite-flying-spool-charkhifirki",
    "medium-size-fiber-kite-spool-charkhifirki-3000-4000m",
    "fiber-wheel-kite-spool-with-short-handle-charkhifirki",
    "full-size-classic-charkhi-reel-plasticfiber",
  ]);

  const catalogProducts = allProducts.filter(
    (p) => !EXCLUDED_FROM_MAIN_CATALOG.has(p.slug)
  );

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION (Light, Clean, Vibrant Aesthetic) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/60 via-slate-50/40 to-white text-slate-900 border-b border-slate-200/60">
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[450px] w-[750px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-0 h-[350px] w-[450px] rounded-full bg-amber-400/10 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Hero Left Content */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-4 py-1.5 text-xs font-bold text-blue-700 shadow-xs backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>MONO KITE MANJA • SINCE 2005</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight text-slate-900">
                India&apos;s Trusted Manufacturer of{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent">
                  Mono Kite
                </span>
              </h1>

              <p className="text-base text-slate-600 sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Since 2005, we&apos;ve proudly crafted genuine <strong>Mono Kite Manja</strong> and high-performance kite gear, trusted by passionate fliers and tournament champions across India.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/products/mono-kite-manja"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition duration-200 cursor-pointer"
                >
                  <span>Explore 9-Cord Manja</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/products"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-800 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition duration-200"
                >
                  <span>View All Kites & Firkis</span>
                </Link>
              </div>

              {/* Key Trust Stats */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-200/80 pt-8">
                <div>
                  <p className="text-2xl font-black text-slate-900 sm:text-3xl">Est. 2005</p>
                  <p className="text-xs text-slate-500 font-medium">19+ Years Heritage</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-600 sm:text-3xl">4.95 ★</p>
                  <p className="text-xs text-slate-500 font-medium">50,000+ Fliers</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-600 sm:text-3xl">72 Hours</p>
                  <p className="text-xs text-slate-500 font-medium">Solar Cured Cotton</p>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Showcase - Flagship Manjha Slider */}
            <HeroProductSlider products={heroSliderProducts} />
          </div>
        </div>
      </section>

      {/* 2. SHOP BY KITE GEAR CATEGORY (Centered Professional Layout) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Shop by Kite Gear Category
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Explore authentic tournament spools, handcrafted cords, fighter kites & teakwood firkis
          </p>
        </div>

        {/* Centered circular category row */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center flex-shrink-0 text-center transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
            >
              {/* Circular Image Container with crisp border and hover shadow */}
              <div className="relative h-20 w-20 sm:h-26 sm:w-26 overflow-hidden rounded-full border-2 sm:border-3 border-slate-200 bg-white p-1 shadow-sm transition-all duration-300 group-hover:border-blue-600 group-hover:shadow-lg group-hover:scale-105">
                <div className="relative h-full w-full overflow-hidden rounded-full">
                  <Image
                    src={category.imageUrl || "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400"}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>
              {/* Category Name */}
              <span className="mt-2.5 text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 max-w-[100px] sm:max-w-[120px] truncate transition">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>



      {/* 3. ALL PRODUCTS SECTION (4 Cards per row) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Official Factory Catalog
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl mt-1">
              All Products &amp; Kite Gear
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Showing all {catalogProducts.length} tournament spools &amp; factory-sealed manjha
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <span>Filter Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 4 Cards in a Row Grid (2 on mobile, 3 on tablet, 4 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {catalogProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 2.6 PACK OF 2 MANJA SECTION */}
      {/* {packOf2Products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-black">
                  2x
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Twin Spool Value Combos
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl mt-1">
                Pack of 2 Manja
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Double the flight time with paired tournament spools &amp; complementary cord blends
              </p>
            </div>
            <Link
              href="/categories/kite-manja"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>View All Manja</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {packOf2Products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )} */}


      {/* 2.5 SPECIAL COTTON FIGHTER MANJA (Dedicated Category Showcase) */}
      {cottonProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 p-6 sm:p-8 lg:p-10 border border-emerald-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  <span>100% PURE COTTON • BAREILLY HERITAGE</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  Special Cotton Fighter Manja
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-medium max-w-2xl leading-relaxed">
                  Authentic sunlight-cured pure cotton thread for razor-sharp combat, zero nylon elasticity, and instant high-altitude touch cutting.
                </p>
              </div>
              <Link
                href="/categories/special-cotton-fighter-manja"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 shrink-0 bg-white border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-50 transition"
              >
                <span>View All Cotton Manja</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* 3 Cotton Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {cottonProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}


      {/* 2.7 FIGHTER & DESIGNER KITES SECTION */}
      {kiteProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-amber-50/70 via-white to-sky-50/50 p-6 sm:p-8 lg:p-10 border border-amber-200/70 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-bold text-amber-800 shadow-xs">
                  <Wind className="h-3.5 w-3.5 text-amber-600" />
                  <span>HAND-BALANCED PATANG • TOURNAMENT GRADE</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  Fighter &amp; Designer Kites (Patang)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-medium max-w-2xl leading-relaxed">
                  Precision-balanced Indian fighter kites crafted with high-grade virgin paper and shaved bamboo for sharp maneuverability, rapid dives, and aerial combat control.
                </p>
              </div>
              <Link
                href="/categories/handcrafted-kites"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-900 shrink-0 bg-white border border-amber-300 px-4 py-2 rounded-xl hover:bg-amber-50 transition"
              >
                <span>View All Kites</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Kite Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {kiteProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. HERITAGE CRAFT SPECIFICATIONS (Light Theme) */}
      <section className="bg-slate-50/80 border-y border-slate-200/80 py-14 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Manufactured with Pride Since 2005
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Why Kite Lovers Nationwide Choose Mono Kite
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Every single spool carries 19+ years of artisanal mastery and aerodynamic testing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">100% Pure Egyptian Cotton</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Zero synthetic elasticity or dangerous nylon tangling. Natural cotton multi-cord delivers crisp aerodynamic tension under solar heat and crosswinds.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4">
                <Sun className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">72-Hour Natural Sunlight Curing</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Cured under open natural sunlight with organic herbal gums for maximum tensile sharpness that won&apos;t flake off during high-altitude combat.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Factory Direct Authenticity</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Avoid low-quality counterfeits. Buy genuine factory-sealed Mono Kite spools and hand-balanced fighter kites directly from the source.
              </p>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
