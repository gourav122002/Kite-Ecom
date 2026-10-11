"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User as UserIcon,
  X,
  ShieldCheck,
  Zap,
  Sparkles,
  LogOut,
  SlidersHorizontal,
  Wind,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export function Header() {
  const { user, setIsAuthModalOpen, logout } = useAuth();
  const { totalItemCount, setIsCartDrawerOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.products.slice(0, 5));
          setShowSearchDropdown(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu & Mono Kite Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            {/* Distinctive Diamond Kite Icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 text-white shadow-lg shadow-blue-600/25 rotate-3 hover:rotate-0 transition-transform">
              <KiteLogoIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 font-sans">
                  Mono <span className="text-blue-600">Kite</span>
                </span>
              </div>
              <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 -mt-0.5">
                Est. 2005
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div ref={searchRef} className="relative hidden md:block flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchDropdown(true);
              }}
              placeholder="Search Mono Kite Manja, 9-Cord, 12-Cord, Kites, Firkis..."
              className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-10 text-xs text-slate-800 placeholder-slate-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {isSearching && (
              <div className="absolute right-3.5 top-2.5 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 z-50">
              <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Search Results ({searchResults.length})
              </p>
              <div className="space-y-1">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => setShowSearchDropdown(false)}
                    className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition"
                  >
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-slate-100 flex-shrink-0">
                      <Image
                        src={product.images[0]?.url || "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-800 truncate">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{product.category.name}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600">
                      {formatCurrency(product.price)}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="border-t border-slate-100 mt-2 pt-2 text-center">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View all results for &ldquo;{searchQuery}&rdquo; →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-semibold text-slate-600">
          <Link href="/products" className="hover:text-blue-600 transition">
            All Products
          </Link>
          <Link href="/categories/kite-manja" className="hover:text-blue-600 transition">
            Monokite Manja
          </Link>
          <Link href="/categories/special-cotton-fighter-manja" className="text-emerald-700 hover:text-emerald-800 font-bold transition">
            Special Cotton Manja
          </Link>
          <Link href="/categories/handcrafted-kites" className="hover:text-blue-600 transition">
            Kite
          </Link>
          <Link href="/categories/firki-and-spools" className="hover:text-blue-600 transition">
            Firkis/Spool
          </Link>
          <Link href="/blog" className="hover:text-blue-600 transition">
            Flight Guides
          </Link>
        </nav>

        {/* Right: Actions (Account, Cart) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Account / Auth */}
          {mounted && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-2 pr-3 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline-block max-w-[100px] truncate">
                  {user.name?.split(" ")[0] || "Account"}
                </span>
                {user.role === "ADMIN" && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    ADMIN
                  </span>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white p-2 shadow-xl border border-slate-100 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  {(user.role === "ADMIN" || user.role === "STAFF") && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      <span>Admin Portal</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              <UserIcon className="h-4 w-4 text-slate-500" />
              <span>Sign In</span>
            </button>
          )}

          {/* Cart Icon Button */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex items-center gap-2 rounded-full bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline-block">Cart</span>
            {mounted && totalItemCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-black text-blue-600">
                {totalItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white p-4 lg:hidden">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Mono Kite Manja, Kites..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs"
            />
          </form>
          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              Shop All Products
            </Link>
            <Link
              href="/categories/kite-manja"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              Mono Kite Manja
            </Link>
            <Link
              href="/categories/special-cotton-fighter-manja"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-emerald-700 font-bold hover:bg-emerald-50"
            >
              Special Cotton Fighter Manja
            </Link>
            <Link
              href="/categories/handcrafted-kites"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              Fighter Kites (Patang)
            </Link>
            <Link
              href="/categories/firki-and-spools"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              Teakwood Firki Reels
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              Kite Flight Guides
            </Link>
            {mounted && user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-slate-900 text-white px-3 py-2"
              >
                Admin Portal
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function KiteLogoIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M12 22c2 1 4 0 5-2" />
    </svg>
  );
}
