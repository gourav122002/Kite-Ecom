"use client";

import { useAuth } from "@/context/AuthContext";
import {
  BarChart3,
  BookOpen,
  Box,
  FileText,
  FolderTree,
  Home,
  LogOut,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { name: "Overview", href: "/admin", icon: BarChart3 },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { name: "Coupons", href: "/admin/coupons", icon: Percent },
  { name: "Blog Posts", href: "/admin/blog", icon: BookOpen },
  { name: "Customers", href: "/admin/customers", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800 min-h-screen">
      {/* Brand & Top */}
      <div>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-amber-500 text-white font-bold">
              <KiteNavIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">
                Mono <span className="text-blue-500">Kite</span>
              </span>
              <p className="text-[10px] text-amber-500 font-bold uppercase">Control Hub • 2005</p>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Store link */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
        >
          <Home className="h-4 w-4 text-amber-400" />
          <span>View Live Store ↗</span>
        </Link>

        <div className="flex items-center justify-between px-2 pt-2 text-xs">
          <div className="min-w-0">
            <p className="font-bold text-white truncate">{user?.name || "Mono Kite Admin"}</p>
            <p className="text-[10px] text-slate-500 font-mono">{user?.role || "ADMIN"}</p>
          </div>
          <button
            onClick={() => logout()}
            className="text-slate-400 hover:text-red-400 p-1 transition"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function KiteNavIcon(props: React.SVGProps<SVGSVGElement>) {
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
