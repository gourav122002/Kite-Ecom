"use client";

import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { validateCouponAction } from "@/server/actions/storeActions";
import {
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

export default function CartPage() {
  const { cart, updateQuantity, removeItem, refreshCart } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const freeShippingThreshold = 999;
  const progressPercent = Math.min(
    100,
    Math.round((cart.subtotal / freeShippingThreshold) * 100)
  );
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cart.subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    const res = await validateCouponAction(couponInput, cart.subtotal);
    if (res.success && res.coupon) {
      setCouponSuccess(`Coupon ${res.coupon.code} applied! Saved ₹${res.coupon.calculatedDiscount}`);
      await refreshCart(res.coupon.code);
    } else {
      setCouponError(res.error || "Invalid coupon code");
    }
    setIsApplyingCoupon(false);
  };

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-6">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Your Shopping Cart is Empty</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md">
            Looks like you haven&apos;t added any items yet. Explore our handcrafted tournament spools, fighter kites, and Bareilly cotton cords.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Free shipping banner */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            {remainingForFreeShipping > 0 ? (
              <p className="text-xs text-slate-700 font-medium mb-2">
                Add <strong className="text-blue-700 font-bold">₹{remainingForFreeShipping}</strong> more to get <strong className="text-emerald-700">FREE Express Delivery</strong>!
              </p>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Congratulations! You have unlocked FREE Express Delivery.</span>
              </div>
            )}
            <div className="h-2.5 w-full rounded-full bg-blue-200/60 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
            {cart.items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId || "default"}`}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4 hover:bg-slate-50/50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {item.sku}</p>
                    <p className="text-xs font-semibold text-blue-600 sm:hidden mt-1">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6">
                  {/* Quantity Stepper */}
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, item.quantity - 1)
                      }
                      className="p-1.5 text-slate-600 hover:text-slate-900"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, item.quantity + 1)
                      }
                      className="p-1.5 text-slate-600 hover:text-slate-900"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(item.total)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-slate-400 hover:text-red-500 transition p-1.5"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs">
            <Link
              href="/products"
              className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
            Order Summary
          </h2>

          {/* Coupon Code Box */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Apply Coupon Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs uppercase text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isApplyingCoupon}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}
            {couponSuccess && (
              <p className="text-xs text-emerald-600 font-medium">{couponSuccess}</p>
            )}
          </form>

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(cart.subtotal)}
              </span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount ({cart.couponCode})</span>
                <span>-{formatCurrency(cart.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>
                {cart.shippingFee === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  formatCurrency(cart.shippingFee)
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated GST (5%)</span>
              <span>{formatCurrency(cart.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-900">
              <span>Grand Total</span>
              <span className="text-xl text-blue-600">{formatCurrency(cart.total)}</span>
            </div>
          </div>

          {/* Checkout CTA */}
          <Link
            href="/checkout"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/25 hover:bg-blue-700 transition"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Guaranteed 256-bit Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
