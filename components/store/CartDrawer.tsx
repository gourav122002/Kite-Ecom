"use client";

import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { validateCouponAction } from "@/server/actions/storeActions";
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight, Tag, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

export function CartDrawer() {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeItem,
    refreshCart,
  } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartDrawerOpen) return null;

  const freeShippingThreshold = 999;
  const progressPercent = Math.min(
    100,
    Math.round((cart.subtotal / freeShippingThreshold) * 100)
  );
  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - cart.subtotal
  );

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
      setCouponError(res.error || "Invalid coupon");
    }
    setIsApplyingCoupon(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-slate-50 p-4 border-b border-slate-100">
            {remainingForFreeShipping > 0 ? (
              <p className="text-xs text-slate-600 font-medium mb-1.5">
                Add <span className="font-bold text-blue-600">₹{remainingForFreeShipping}</span> more to unlock <span className="text-emerald-600 font-bold">FREE Express Delivery</span>!
              </p>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>You qualify for FREE Delivery!</span>
              </div>
            )}
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6">
                <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Your cart is empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Discover our premium kite threads, tournament manja, and handcrafted kites.
                </p>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || "default"}`}
                  className="flex gap-4 rounded-xl border border-slate-100 p-3 hover:border-slate-200 transition bg-white shadow-xs"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-slate-400 hover:text-red-500 transition p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity - 1
                            )
                          }
                          className="p-1.5 text-slate-600 hover:text-slate-900"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity + 1
                            )
                          }
                          className="p-1.5 text-slate-600 hover:text-slate-900"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.items.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4">
              {/* Promo code */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Promo Code (e.g. WELCOME10)"
                      className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs uppercase text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-600 font-medium">{couponError}</p>
                )}
                {couponSuccess && (
                  <p className="text-xs text-emerald-600 font-medium">{couponSuccess}</p>
                )}
              </form>

              {/* Price breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/60 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(cart.subtotal)}
                  </span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({cart.couponCode})</span>
                    <span>-{formatCurrency(cart.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {cart.shippingFee === 0 ? (
                      <span className="text-emerald-600 font-semibold">FREE</span>
                    ) : (
                      formatCurrency(cart.shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (5% GST)</span>
                  <span>{formatCurrency(cart.tax)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-base text-blue-600">
                    {formatCurrency(cart.total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="block text-center text-xs font-semibold text-slate-600 hover:text-slate-900 py-1"
                >
                  View Full Cart Details
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
