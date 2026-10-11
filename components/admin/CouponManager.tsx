"use client";

import { createCouponAction, deleteCouponAction } from "@/server/actions/adminActions";
import { formatCurrency } from "@/lib/utils";
import { Percent, Plus, Trash2, Tag, Check, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export function CouponManager({ coupons }: { coupons: any[] }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("10");
  const [minOrderValue, setMinOrderValue] = useState("500");
  const [maxDiscount, setMaxDiscount] = useState("300");
  const [usageLimit, setUsageLimit] = useState("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await createCouponAction({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: minOrderValue ? Number(minOrderValue) : null,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isActive: true,
    });

    if (res.success) {
      setCode("");
      router.refresh();
    } else {
      setError(res.error || "Failed to create coupon");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (confirm(`Delete coupon "${codeName}"?`)) {
      await deleteCouponAction(id);
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Promotions & Coupons</h1>
        <p className="text-xs text-slate-500 mt-1">
          Create percentage discounts, flat discount codes, and usage limits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Coupon Form (1 col) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-xs h-fit">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="h-4 w-4 text-blue-600" />
            <span>Create Promo Coupon</span>
          </h2>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-red-600 font-bold border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="FESTIVAL20"
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono uppercase font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Type *
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-slate-800 focus:border-blue-600 focus:outline-none"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Flat (₹)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Value *
                </label>
                <input
                  type="number"
                  required
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="20"
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Min Order (₹)
                </label>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  placeholder="500"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Max Cap (₹)
                </label>
                <input
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  placeholder="300"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Usage Limit (Total times)
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="200"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Coupon"}
            </button>
          </form>
        </div>

        {/* Existing Coupons (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Tag className="h-4 w-4 text-blue-600" />
            <span>Active Discount Codes ({coupons.length})</span>
          </h2>

          <div className="divide-y divide-slate-100 text-xs">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-blue-100 px-2.5 py-1 font-mono font-black text-blue-800 text-xs">
                      {coupon.code}
                    </span>
                    <span className="font-bold text-slate-900">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}% OFF`
                        : `${formatCurrency(coupon.discountValue)} FLAT OFF`}
                    </span>
                  </div>
                  <p className="text-slate-500">
                    Min Order: ₹{coupon.minOrderValue || 0} • Max Discount: ₹
                    {coupon.maxDiscount || "Unlimited"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Used: {coupon.usageCount} / {coupon.usageLimit || "∞"} times
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(coupon.id, coupon.code)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                  title="Delete Coupon"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
