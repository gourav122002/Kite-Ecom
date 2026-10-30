"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { trackOrderAction } from "@/server/actions/orderActions";
import {
  Package,
  Search,
  Truck,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  PhoneCall,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanNum = orderNumber.trim();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanNum) {
      setErrorMessage("Please enter your Order Reference Number (e.g. MK-ORD-...)");
      return;
    }

    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number used during checkout.");
      return;
    }

    setIsSearching(true);
    try {
      const res = await trackOrderAction({
        orderNumber: cleanNum,
        phone: cleanPhone,
      });

      if (!res.success || !res.orderId) {
        setErrorMessage(
          res.error ||
            "No matching order found. Please double-check your Order Reference and Mobile Number."
        );
        setIsSearching(false);
        return;
      }

      const tokenParam = res.guestToken ? `?token=${res.guestToken}` : "";
      router.push(`/orders/${res.orderId}${tokenParam}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to search order. Please try again.");
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-[75vh] bg-slate-50 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        {/* Header Banner */}
        <div className="text-center space-y-3 mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25">
            <Truck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Check the live fulfillment status and dispatch timeline for your Mono Kite shipment without needing to log in.
          </p>
        </div>

        {/* Tracking Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          {errorMessage && (
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Order ID / Reference Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder="E.g. MK-ORD-20261031-ABCD"
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm font-mono text-slate-900 focus:border-blue-600 focus:outline-none transition"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Found on your order confirmation screen or SMS dispatch notification.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden focus-within:border-blue-600 transition">
                <span className="bg-slate-50 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-600 border-r border-slate-200">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile number"
                  className="w-full p-3 text-xs sm:text-sm text-slate-900 focus:outline-none"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter the mobile number provided during guest checkout.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition cursor-pointer disabled:opacity-60"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Searching Order...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Track Order Now</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Value props strip */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Secure Guest Lookup</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Real-time Courier Status</span>
            </span>
          </div>
        </div>

        {/* Support Card */}
        <div className="mt-8 rounded-2xl bg-white p-5 border border-slate-200 text-center text-xs text-slate-600 space-y-2">
          <p className="font-semibold text-slate-800">
            Having trouble finding your order?
          </p>
          <p className="text-slate-500">
            Our WhatsApp & phone team is active daily from 9:00 AM – 8:00 PM.
          </p>
          <div className="pt-2 flex items-center justify-center gap-4">
            <a
              href="tel:+919876543210"
              className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:underline"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>+91 98765 43210</span>
            </a>
            <Link
              href="/products"
              className="font-bold text-slate-700 hover:text-slate-900"
            >
              Continue Shopping →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

