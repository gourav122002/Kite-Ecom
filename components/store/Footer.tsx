import { ShieldCheck, Truck, PhoneCall, Mail, MapPin, Award, Sun, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-400">
      {/* Value Propositions Bar (Centered) */}
      <div className="border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl grid grid-cols-1 gap-6 sm:grid-cols-3 justify-items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Free Delivery (Above ₹700)</h4>
              <p className="text-xs text-slate-400">Delivery happens within: 3-5 days</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/10 text-purple-400 border border-purple-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Cash on Delivery</h4>
              <p className="text-xs text-slate-400">Pay cash / UPI at doorstep</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Payment Options</h4>
              <p className="text-xs text-slate-400">Cash on delivery / UPI / Cards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-amber-500 text-white font-bold">
                <KiteIcon className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Mono <span className="text-blue-500">Kite</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              India&apos;s premier manufacturer of tournament-grade manja, handcrafted fighter kites, and teakwood firkis since 2005.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span>Bareilly & Ahmedabad Craft Hubs</span>
            </div>
          </div>

          {/* 1. Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Quick Links</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories/kite-manja" className="hover:text-white transition">
                  Kite Manja Spools
                </Link>
              </li>
              <li>
                <Link href="/categories/handcrafted-kites" className="hover:text-white transition">
                  Fighter Kites (Patang)
                </Link>
              </li>
              <li>
                <Link href="/categories/firki-and-spools" className="hover:text-white transition">
                  Teakwood Bearing Firkis
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition">
                  My Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-blue-400 hover:text-blue-300 font-semibold transition">
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* 2. Free Delivery Info */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Free Delivery</h5>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Free delivery on all orders <strong>Above ₹700</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>Delivery happens within: <strong>3-5 days</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="h-3.5 w-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Dispatched within 24 hours from factory</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                <span>Free replacement transit protection</span>
              </li>
            </ul>
          </div>

          {/* 3. Payment Options */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Payment Options</h5>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="font-semibold text-slate-200">Cash on delivery (Available)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>UPI (GPay / PhonePe / Paytm / BHIM)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>Credit / Debit Cards (Visa, RuPay, Master)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>Net Banking (All Indian Banks)</span>
              </li>
              <li className="pt-1">
                <span className="inline-block rounded-md bg-slate-900 border border-slate-800 px-2.5 py-1 text-[10px] text-emerald-400 font-bold">
                  ✓ 100% Secure Checkout
                </span>
              </li>
            </ul>
          </div>

          {/* 4. Customer Support */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">Customer Support</h5>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <PhoneCall className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                <span className="font-semibold text-slate-200">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                <span>support@monokite.in</span>
              </li>
              <li className="flex items-start gap-2 pt-1">
                <Clock className="h-3.5 w-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">
                  Mon – Sat: 9:00 AM – 8:00 PM<br />
                  Sunday: 10:00 AM – 4:00 PM
                </span>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin"
                  className="text-[11px] font-bold text-slate-400 hover:text-white transition"
                >
                  Admin Portal Login →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & payment badges */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row text-xs">
          <p className="text-slate-400">
            © {new Date().getFullYear()} <strong className="text-white">Mono Kite</strong>. All rights reserved. Since 2005.
          </p>
          <div className="flex items-center gap-2.5 text-slate-400 font-mono text-[11px] flex-wrap justify-center">
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">Cash on Delivery</span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">UPI / GPay / Paytm</span>
            <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">Cards / Net Banking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function KiteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 12l10 10 10-10L12 2z" />
      <path d="M12 2v20" />
      <path d="M2 12h20" />
    </svg>
  );
}
