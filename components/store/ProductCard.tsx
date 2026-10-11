"use client";

import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Star, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    stock: number;
    rating?: number;
    reviewCount?: number;
    images: { url: string; altText?: string | null }[];
    category?: { name: string; slug: string } | null;
    brand?: string | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "https://dms.mydukaan.io/original/jpeg/media/160d317a-c244-4a5e-abff-974f637064cb.png";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding || product.stock <= 0) return;

    setAdding(true);
    await addItem(product.id, null, 1);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10">
      {/* Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-slate-50/70"
      >
        <Image
          src={imageUrl}
          alt={product.images[0]?.altText || product.name}
          fill
          className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Discount Badge on Top Right */}
        {discountPercent && (
          <div className="absolute right-2 top-2 z-10">
            <span className="rounded-md bg-[#ff6000] px-1.5 py-0.5 text-[10px] font-black text-white shadow-xs">
              {discountPercent}% OFF
            </span>
          </div>
        )}

        {/* Stock Badges on Top Left */}
        <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
          {product.stock <= 5 && product.stock > 0 && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              Only {product.stock} Left!
            </span>
          )}
          {product.stock <= 0 && (
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              Sold Out
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <Link href={`/products/${product.slug}`} className="flex-1">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
            {product.name}
          </h3>
          {/* Ratings */}
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
            <div className="flex items-center text-amber-400">
              <Star className="h-3 w-3 fill-current" />
              <span className="ml-1 font-bold text-slate-800">
                {product.rating ? product.rating.toFixed(1) : "4.8"}
              </span>
            </div>
            <span>•</span>
            <span>{product.reviewCount || 12} reviews</span>
          </div>
        </Link>

        {/* Price & Action */}
        <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5 gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-slate-900">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[11px] text-slate-400 line-through truncate">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] text-emerald-600 font-semibold">Taxes incl.</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock <= 0}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-bold transition cursor-pointer flex-shrink-0 ${
              added
                ? "border border-emerald-600 bg-emerald-50 text-emerald-600"
                : product.stock <= 0
                ? "border border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                : "border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50"
            }`}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : adding ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            ) : product.stock <= 0 ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
