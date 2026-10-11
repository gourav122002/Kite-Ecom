import { getCurrentUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  const isAuthorized = user && (user.role === "ADMIN" || user.role === "STAFF");

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center text-white shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black">Admin Access Required</h1>
          <p className="mt-2 text-xs text-slate-400">
            You must be signed in with an Administrator or Staff role to access the backend portal.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-800/80 p-4 text-left text-xs border border-slate-700">
            <p className="font-bold text-slate-300 mb-1">🔑 Demo Admin Credentials:</p>
            <p className="text-slate-400 font-mono">Email: admin@store.com</p>
            <p className="text-slate-400 font-mono">Password: admin123</p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/"
              className="rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition"
            >
              Sign In from Homepage Header
            </Link>
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white transition"
            >
              ← Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100/70 text-slate-900 font-sans">
      <AdminNav />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
