"use client";

import { useAuth } from "@/context/AuthContext";
import { loginAction, registerAction } from "@/server/actions/authActions";
import { Lock, Mail, User, X } from "lucide-react";
import React, { useState } from "react";

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode, refreshUser } =
    useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    if (authMode === "register") {
      formData.append("name", name);
      if (phone) formData.append("phone", phone);
      const res = await registerAction(formData);
      if (res.success) {
        await refreshUser();
        setIsAuthModalOpen(false);
      } else {
        setError(res.error || "Registration failed");
      }
    } else {
      const res = await loginAction(formData);
      if (res.success) {
        await refreshUser();
        setIsAuthModalOpen(false);
      } else {
        setError(res.error || "Login failed");
      }
    }
    setLoading(false);
  };

  const setDemoCredentials = (role: "admin" | "customer") => {
    if (role === "admin") {
      setEmail("admin@store.com");
      setPassword("admin123");
    } else {
      setEmail("rahul.sharma@example.com");
      setPassword("customer123");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all">
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900">
            {authMode === "login" ? "Welcome Back" : "Create an Account"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {authMode === "login"
              ? "Sign in to manage orders, addresses and track shipments."
              : "Register to experience fast checkout and exclusive perks."}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === "register" && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-4 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
          >
            {loading
              ? "Please wait..."
              : authMode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

   

        <div className="mt-5 text-center text-xs text-slate-600">
          {authMode === "login" ? (
            <span>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAuthMode("register");
                }}
                className="font-bold text-blue-600 hover:underline"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setAuthMode("login");
                }}
                className="font-bold text-blue-600 hover:underline"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
