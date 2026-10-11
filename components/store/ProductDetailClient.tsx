"use client";

import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import {
  Check,
  CreditCard,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Zap,
  Sun,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    shortDescription?: string | null;
    price: number;
    compareAtPrice?: number | null;
    stock: number;
    rating?: number;
    reviewCount?: number;
    brand?: string | null;
    images: { id: string; url: string; altText?: string | null }[];
    variants: { id: string; name: string; sku?: string | null; priceDelta: number; stock: number }[];
    category: { name: string; slug: string };
  };
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem, setIsCartDrawerOpen } = useCart();
  const [selectedImage, setSelectedImage] = useState(
    product.images[0]?.url ||
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800"
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants && product.variants.length > 0 ? product.variants[0].id : null
  );
  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId) || null;
  const currentPrice = product.price + (selectedVariant?.priceDelta || 0);
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > currentPrice
      ? Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100)
      : null;

  const handleAddToCart = async () => {
    if (isAdding || currentStock <= 0) return;
    setIsAdding(true);
    await addItem(product.id, selectedVariantId, quantity);
    setIsAdding(false);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2500);
  };

  const handleBuyNow = async () => {
    if (isBuyingNow || currentStock <= 0) return;
    setIsBuyingNow(true);
    await addItem(product.id, selectedVariantId, quantity);
    setIsCartDrawerOpen(false);
    router.push("/checkout");
  };

  // Gallery image list with fallbacks to ensure full multi-photo experience
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url)
      : [
          "https://dms.mydukaan.io/original/jpeg/media/160d317a-c244-4a5e-abff-974f637064cb.png",
        ];

  const displayImages = galleryImages;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      {/* 1. Interactive Product Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-white group shadow-xs">
          <Image
            src={selectedImage || displayImages[0]}
            alt={product.name}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Thumbnail Gallery Strip */}
        <div className="flex gap-3 overflow-x-auto pb-1 pt-1">
          {displayImages.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(imgUrl)}
              className={`relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition ${
                (selectedImage || displayImages[0]) === imgUrl
                  ? "border-blue-600 ring-2 ring-blue-200 scale-105 shadow-sm"
                  : "border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={imgUrl}
                alt={`${product.name} angle ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* 2. Product Information & Open Description */}
      <div className="flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          {/* Category Header */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              {product.category.name}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl leading-snug">
            {product.name}
          </h1>

          {/* Price & Taxes */}
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-3xl font-black text-slate-900">
              {formatCurrency(currentPrice)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
              <span className="text-base text-slate-400 line-through font-semibold">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Taxes Included
            </span>
          </div>

          {/* Color / Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Color / Option:
                </label>
                {selectedVariant && (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {selectedVariant.name}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const hexMatch = v.name.match(/#[a-fA-F0-9]{6}/);
                  const hex = hexMatch ? hexMatch[0] : null;
                  const isSelected = selectedVariantId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`group relative flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {hex && (
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-slate-300 shadow-xs"
                          style={{ backgroundColor: hex }}
                        />
                      )}
                      <span>{v.name.replace(/\s*\(#[a-fA-F0-9]{6}\)/, "")}</span>
                      {v.priceDelta !== 0 && (
                        <span className="text-[10px] text-slate-500 font-semibold">
                          ({v.priceDelta > 0 ? `+₹${v.priceDelta}` : `-₹${Math.abs(v.priceDelta)}`})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Open Product Description (no enclosed card box) */}
          <div className="pt-2 border-t border-slate-200/80 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              <span>Product Description & Specifications</span>
            </h3>
            <div
              className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-slate-600 [&_strong]:text-slate-900 [&_strong]:font-semibold [&_p]:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>

          {/* Quantity & Stock Availability */}
          <div className="pt-2 flex items-center gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Quantity:
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-bold text-slate-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-5">
              {currentStock > 10 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <Check className="h-4 w-4" /> In Stock & Factory Ready
                </span>
              ) : currentStock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600">
                  <Zap className="h-4 w-4" /> Hurry, only {currentStock} spools left!
                </span>
              ) : (
                <span className="text-xs font-bold text-red-600">
                  Currently Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons (Add to Cart + Buy Now) */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || currentStock <= 0}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-xs sm:text-sm font-bold transition cursor-pointer ${
                isSuccess
                  ? "border-2 border-emerald-600 bg-emerald-50 text-emerald-700"
                  : currentStock <= 0
                  ? "border-2 border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                  : "border-2 border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50"
              }`}
            >
              {isSuccess ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Added to Cart!</span>
                </>
              ) : isAdding ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isBuyingNow || currentStock <= 0}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-xs sm:text-sm font-black bg-amber-500 text-slate-950 hover:bg-amber-400 transition cursor-pointer disabled:opacity-50"
            >
              {isBuyingNow ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              ) : (
                <>
                  <CreditCard className="h-4 w-4 text-slate-950" />
                  <span>Buy Now • {formatCurrency(currentPrice * quantity)}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Seamless Guarantee Highlights (no heavy cards) */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span>
              <strong className="text-slate-900">Express Delivery:</strong> Dispatched in 24h.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong className="text-slate-900">Authentic:</strong> 100% genuine Bareilly craft.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong className="text-slate-900">Transit Protection:</strong> Free replacement.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
