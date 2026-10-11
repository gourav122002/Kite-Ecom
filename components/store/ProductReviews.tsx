"use client";

import { CheckCircle2, MessageSquare, Star, ThumbsUp } from "lucide-react";
import React, { useState } from "react";

interface ProductReviewsProps {
  productName: string;
  rating: number;
  reviewCount: number;
}

const sampleReviews = [
  {
    id: "r1",
    author: "Vikram Mehta",
    location: "Ahmedabad, Gujarat",
    verified: true,
    rating: 5,
    date: "2 days ago",
    title: "Mono Kite 9-Cord is unmatched in Uttarayan tournament!",
    content:
      "Have been using Mono Kite products since 2012. The 9-cord sun-cured thread cut through 14 opponent lines in our club battle. Zero stretch and supreme responsiveness on the firki. Highly recommended for genuine fliers.",
    helpfulCount: 24,
  },
  {
    id: "r2",
    author: "Rajesh Bareilly",
    location: "Bareilly, Uttar Pradesh",
    verified: true,
    rating: 5,
    date: "1 week ago",
    title: "Authentic Bareilly craftsmanship and sunlight curing",
    content:
      "100% pure Egyptian cotton substrate. The silicate coating is flexible and does not powder or flake off during tight tactical maneuvers. Packaging was top-notch with bubble protection.",
    helpfulCount: 19,
  },
  {
    id: "r3",
    author: "Karan Patel",
    location: "Surat, Gujarat",
    verified: true,
    rating: 5,
    date: "2 weeks ago",
    title: "Fast dispatch and great tensile balance",
    content:
      "Delivered to Surat in 2 days. The spool is evenly wound with zero tangles. Combined this with their teakwood bearing firki for lightning speed release.",
    helpfulCount: 15,
  },
  {
    id: "r4",
    author: "Amitabh Sen",
    location: "Kolkata, West Bengal",
    verified: true,
    rating: 4.8,
    date: "3 weeks ago",
    title: "Superior flight control and clean knots",
    content:
      "Bridling was effortless with the Bareilly cotton cordon. Flies stable even in 30 km/h gusts. Will definitely order the 12-cord reel next.",
    helpfulCount: 11,
  },
];

export function ProductReviews({
  productName,
  rating = 4.95,
  reviewCount = 48,
}: ProductReviewsProps) {
  const [helpfulMap, setHelpfulMap] = useState<Record<string, number>>({});

  const handleHelpful = (id: string) => {
    setHelpfulMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  return (
    <section className="border-t border-slate-200 pt-10 space-y-8">
      {/* Header & Rating Breakdown (Open layout, no card box) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Verified Buyer Feedback
          </span>
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl mt-1">
            Customer Ratings & Reviews
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real feedback from tournament fliers across India for {productName}.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-4xl font-black text-slate-900 leading-none">
              {rating.toFixed(1)}
            </span>
            <span className="text-[11px] font-bold text-slate-400 block mt-1">out of 5.0</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-700">
              {reviewCount} verified reviews • 98% recommend
            </p>
          </div>
        </div>
      </div>

      {/* Rating Distribution Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-y border-slate-100 py-6">
        <div className="space-y-2 col-span-2 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="w-12 font-bold text-slate-700">5 Star</span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full w-[94%]" />
            </div>
            <span className="w-8 text-right text-slate-500 font-semibold">94%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-12 font-bold text-slate-700">4 Star</span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full w-[5%]" />
            </div>
            <span className="w-8 text-right text-slate-500 font-semibold">5%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-12 font-bold text-slate-700">3 Star</span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full w-[1%]" />
            </div>
            <span className="w-8 text-right text-slate-500 font-semibold">1%</span>
          </div>
        </div>

        <div className="flex flex-col justify-center text-xs text-slate-500 space-y-1 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
          <p className="font-bold text-slate-900">100% Authentic Buyer Verification</p>
          <p className="text-[11px]">
            Every review is tied to a verified courier order dispatched from our factory floor.
          </p>
        </div>
      </div>

      {/* Reviews List (Open design with divider lines, no heavy cards) */}
      <div className="divide-y divide-slate-100">
        {sampleReviews.map((rev) => (
          <div key={rev.id} className="py-6 space-y-3 first:pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <span>{rev.author}</span>
                  {rev.verified && (
                    <span title="Verified Buyer">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" />
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-slate-400">• {rev.location}</span>
              </div>
              <span className="text-[11px] text-slate-400">{rev.date}</span>
            </div>

            <h4 className="text-sm font-bold text-slate-900">{rev.title}</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
              {rev.content}
            </p>

            <div className="pt-1 flex items-center gap-2 text-xs">
              <button
                onClick={() => handleHelpful(rev.id)}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-semibold transition"
              >
                <ThumbsUp className="h-3.5 w-3.5 text-slate-400" />
                <span>Helpful ({rev.helpfulCount + (helpfulMap[rev.id] || 0)})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
