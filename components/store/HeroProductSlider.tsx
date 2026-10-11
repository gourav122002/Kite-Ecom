"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface HeroProduct {
  id: string;
  name: string;
  slug: string;
  images: { url: string; altText?: string | null }[];
}

interface HeroProductSliderProps {
  products: HeroProduct[];
}

export function HeroProductSlider({ products }: HeroProductSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  if (!products || products.length === 0) {
    return null;
  }

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    if (isPaused || products.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, products.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const current = products[currentIndex] || products[0];
  const imageUrl =
    current.images && current.images.length > 0
      ? current.images[0].url
      : "https://dms.mydukaan.io/original/jpeg/media/160d317a-c244-4a5e-abff-974f637064cb.png";

  return (
    <div
      className="relative mx-auto w-full max-w-xl lg:max-w-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Outer Card Frame - Increased size and prominent display */}
      <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-[1/1] xl:aspect-[1.05/1] min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] rounded-3xl border border-slate-200/90 bg-white p-2.5 sm:p-4 shadow-2xl transition-all duration-300">
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50/70 to-slate-100/40 group">
          {/* Main Product Image Only - Click to open product detail page */}
          <Link
            href={`/products/${current.slug}`}
            className="relative block h-full w-full cursor-pointer"
            title={`View ${current.name}`}
          >
            <Image
              key={current.id}
              src={imageUrl}
              alt={current.name}
              fill
              className="object-contain p-2 sm:p-4 transition-transform duration-700 ease-out group-hover:scale-108"
              priority
            />
          </Link>

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous product image"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-lg backdrop-blur-xs border border-slate-200/80 hover:bg-white hover:text-blue-600 hover:scale-110 transition cursor-pointer z-20 opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next product image"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-lg backdrop-blur-xs border border-slate-200/80 hover:bg-white hover:text-blue-600 hover:scale-110 transition cursor-pointer z-20 opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Slide Dots Indicator */}
      <div className="flex items-center justify-center gap-2.5 pt-4">
        {products.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to image ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentIndex === idx
                ? "h-2.5 w-10 bg-blue-600 shadow-xs"
                : "h-2.5 w-2.5 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
