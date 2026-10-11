"use client";

import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface SimilarProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    stock: number;
    images: { url: string; altText?: string | null }[];
    category?: { name: string; slug: string } | null;
  };
}

export function SimilarProductCard({ product }: SimilarProductCardProps) {
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-2 sm:p-2.5 transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
    >
      {/* Image Container with Full Cover Image, Discount Badge & Original Seal */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100 mb-2">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        />

        {/* Orange Discount Badge on Top Right */}
        {discountPercent ? (
          <span className="absolute right-1.5 top-1.5 rounded-xs bg-[#ff6000] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black tracking-tight text-white shadow-xs">
            {discountPercent}% OFF
          </span>
        ) : null}
      </div>

      {/* Title & Info */}
      <div className="flex flex-col space-y-0.5">
        <h3
          className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition"
          title={product.name}
        >
          {product.name}
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">Per piece</span>

        {/* Pricing */}
        <div className="flex items-baseline gap-1.5 pt-0.5">
          <span className="text-xs sm:text-sm font-black text-slate-900">
            {formatCurrency(product.price).replace(".00", "")}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[10px] sm:text-[11px] text-slate-400 line-through font-normal">
              {formatCurrency(product.compareAtPrice).replace(".00", "")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
