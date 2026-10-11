"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import {
  createCheckoutOrderAction,
  getPopularProductsForCheckoutAction,
} from "@/server/actions/orderActions";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Minus,
  Percent,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface PopularProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  images: { url: string }[];
}

// Common pincode offline fallback dictionary for instant response
const PINCODE_MAP: Record<string, { city: string; state: string }> = {
  "474012": { city: "Gwalior", state: "Madhya Pradesh" },
  "474001": { city: "Gwalior", state: "Madhya Pradesh" },
  "400050": { city: "Mumbai", state: "Maharashtra" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "110001": { city: "New Delhi", state: "Delhi" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "395003": { city: "Surat", state: "Gujarat" },
  "243001": { city: "Bareilly", state: "Uttar Pradesh" },
  "208001": { city: "Kanpur", state: "Uttar Pradesh" },
  "226001": { city: "Lucknow", state: "Uttar Pradesh" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "500001": { city: "Hyderabad", state: "Telangana" },
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, setIsAuthModalOpen, setAuthMode } = useAuth();
  const { cart, refreshCart, updateQuantity, removeItem, addItem } = useCart();

  // Active step: 1 = CART, 2 = ADDRESS, 3 = PAYMENT
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isStepNavigating, setIsStepNavigating] = useState(false);

  // Address Form States
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [street, setStreet] = useState("");
  const [locality, setLocality] = useState("");
  const [landmark, setLandmark] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Pincode auto-fetch loading state
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Popular products for Step 1
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [addingPopularId, setAddingPopularId] = useState<string | null>(null);

  // Processing & global error
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Order placed success modal state
  const [orderSuccessData, setOrderSuccessData] = useState<{
    orderId: string;
    orderNumber: string;
    total: number;
  } | null>(null);

  // Fetch popular products for Step 1 with skeleton loader
  useEffect(() => {
    async function loadPopular() {
      setIsLoadingPopular(true);
      const res = await getPopularProductsForCheckoutAction();
      if (res.success && res.products) {
        setPopularProducts(res.products as any);
      }
      setIsLoadingPopular(false);
    }
    loadPopular();
  }, []);

  // Update user name and email when auth user changes
  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  // Handle Dynamic Pincode Lookup (fetches city and state on 6 digits)
  const handlePincodeChange = async (val: string) => {
    const cleanPin = val.replace(/\D/g, "").slice(0, 6);
    setPostalCode(cleanPin);

    if (errors.postalCode) {
      setErrors((prev) => ({ ...prev, postalCode: "" }));
    }

    if (cleanPin.length === 6) {
      setIsFetchingPincode(true);

      // 1. Check local fast dictionary
      if (PINCODE_MAP[cleanPin]) {
        setCity(PINCODE_MAP[cleanPin].city);
        setState(PINCODE_MAP[cleanPin].state);
        setErrors((prev) => ({ ...prev, city: "", state: "" }));
        setIsFetchingPincode(false);
        return;
      }

      // 2. Fetch from Postal PIN Code API
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          const fetchedCity = po.District || po.Block || po.Circle || "";
          const fetchedState = po.State || "";
          if (fetchedCity) setCity(fetchedCity);
          if (fetchedState) setState(fetchedState);
          setErrors((prev) => ({ ...prev, city: "", state: "" }));
        }
      } catch {
        // Silently allow manual entry if network lookup fails
      } finally {
        setIsFetchingPincode(false);
      }
    }
  };

  // Calculate estimated compareAt total for savings banner
  const compareAtTotal = cart.items.reduce((acc, item) => {
    const defaultOriginal = item.price * 1.5;
    return acc + defaultOriginal * item.quantity;
  }, 0);

  const totalSaved = Math.max(
    0,
    compareAtTotal - cart.subtotal + (cart.discount || 0)
  );
  const savedPercent =
    compareAtTotal > 0
      ? Math.round((totalSaved / compareAtTotal) * 100)
      : 33;

  // Handle coupon apply
  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError(null);
    try {
      await refreshCart(couponInput.trim().toUpperCase());
      setShowCouponInput(false);
    } catch (err: any) {
      setCouponError(err.message || "Invalid coupon code");
    }
  };

  // Add popular product to cart
  const handleAddPopular = async (prodId: string) => {
    setAddingPopularId(prodId);
    await addItem(prodId, null, 1);
    setAddingPopularId(null);
  };

  // Validate Address Step
  const validateAddressStep = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!phone.trim()) {
      newErrors.phone = "Mobile number is required";
    } else if (phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Please enter a valid 10-digit mobile number";
    }
    if (!street.trim()) newErrors.street = "Address is required";
    if (!postalCode.trim()) newErrors.postalCode = "Pin code is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!state.trim()) newErrors.state = "State is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Smooth step transition handler
  const goToStep = (targetStep: 1 | 2 | 3) => {
    setIsStepNavigating(true);
    setTimeout(() => {
      setCurrentStep(targetStep);
      setIsStepNavigating(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 200);
  };

  // Step 2 -> Step 3
  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddressStep()) {
      goToStep(3);
    }
  };

  // Step 3 -> Place Order (COD)
  const handlePlaceOrder = async () => {
    if (!validateAddressStep()) {
      goToStep(2);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const fullAddress = [
        street,
        locality ? `Locality: ${locality}` : "",
        landmark ? `Landmark: ${landmark}` : "",
      ]
        .filter(Boolean)
        .join(", ");

      const payload = {
        email: email.trim() || `${phone.replace(/\D/g, "")}@monokite.store`,
        phone: phone.trim(),
        shippingAddress: {
          name: name.trim(),
          phone: phone.trim(),
          street: fullAddress,
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: "India",
        },
        couponCode: cart.couponCode || undefined,
        paymentMethod: "COD" as const,
        items: cart.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      };

      const res = await createCheckoutOrderAction(payload);
      if (!res.success || !res.order) {
        setErrorMessage(res.error || "Failed to place order. Please try again.");
        setIsProcessing(false);
        return;
      }

      await refreshCart();

      // Show the celebration modal for a smooth delightful experience before redirecting
      setOrderSuccessData({
        orderId: res.order.id,
        orderNumber: res.order.orderNumber,
        total: res.order.total,
      });

      // Navigate after 1.8 seconds celebration
      setTimeout(() => {
        router.push(`/orders/${res.order.id}`);
      }, 1800);
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred during checkout");
      setIsProcessing(false);
    }
  };

  if (cart.items.length === 0 && !orderSuccessData) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center bg-white">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-4">
          <Truck className="h-10 w-10 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h1>
        <p className="mt-2 text-sm text-slate-500">
          Looks like you haven't added any tournament manjha or kites yet.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
        >
          <span>Explore Kite Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 relative">
      {/* ========================================================================= */}
      {/* ORDER PLACED CELEBRATION MODAL OVERLAY                                    */}
      {/* ========================================================================= */}
      {orderSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl space-y-5 animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
              <CheckCircle2 className="h-12 w-12" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                <Sparkles className="h-3.5 w-3.5" /> Order Confirmed
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Order Placed Successfully! 🎉
              </h2>
              <p className="text-xs text-slate-500">
                Order Ref:{" "}
                <strong className="font-mono text-slate-900 font-bold">
                  {orderSuccessData.orderNumber}
                </strong>
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 border border-slate-200/80 space-y-1">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-bold text-emerald-700">
                  Cash on Delivery (COD)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(orderSuccessData.total).replace(".00", "")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Dispatch:</span>
                <span className="font-bold text-blue-600">Within 24 Hours</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span>Redirecting to your order tracking...</span>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP STEP INDICATOR (Matching User Image 1) */}
      <div className="border-b border-slate-200 bg-white py-4 sticky top-0 z-20 shadow-2xs">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs font-bold uppercase tracking-wider">
            {/* Step 1: CART */}
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="flex items-center gap-2 transition cursor-pointer"
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black transition ${
                  currentStep === 1
                    ? "bg-[#0b6bcb] text-white ring-2 ring-blue-100"
                    : "bg-[#0b6bcb] text-white"
                }`}
              >
                1
              </div>
              <span
                className={`${
                  currentStep === 1 ? "text-[#0b6bcb] font-black" : "text-slate-800"
                }`}
              >
                CART
              </span>
            </button>

            {/* Separator line 1 */}
            <div className="h-0.5 w-10 sm:w-16 bg-slate-300" />

            {/* Step 2: ADDRESS */}
            <button
              type="button"
              onClick={() => {
                if (currentStep > 2 || validateAddressStep()) goToStep(2);
              }}
              className="flex items-center gap-2 transition cursor-pointer"
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black transition ${
                  currentStep >= 2
                    ? "bg-[#0b6bcb] text-white ring-2 ring-blue-100"
                    : "bg-slate-500 text-white"
                }`}
              >
                2
              </div>
              <span
                className={`${
                  currentStep === 2
                    ? "text-[#0b6bcb] font-black"
                    : currentStep > 2
                    ? "text-slate-800"
                    : "text-slate-500"
                }`}
              >
                ADDRESS
              </span>
            </button>

            {/* Separator line 2 */}
            <div className="h-0.5 w-10 sm:w-16 bg-slate-300" />

            {/* Step 3: PAYMENT */}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black transition ${
                  currentStep === 3
                    ? "bg-[#0b6bcb] text-white ring-2 ring-blue-100"
                    : "bg-slate-500 text-white"
                }`}
              >
                3
              </div>
              <span
                className={`${
                  currentStep === 3
                    ? "text-[#0b6bcb] font-black"
                    : "text-slate-500"
                }`}
              >
                PAYMENT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: ACTIVE STEP CONTENT                                         */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-8">
            {/* ----------------------------------------------------------------- */}
            {/* STEP 1: CART VIEW & POPULAR PRODUCTS                              */}
            {/* ----------------------------------------------------------------- */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h1 className="text-xl font-black text-slate-900 mb-4">
                    Items in Your Cart ({cart.items.length})
                  </h1>

                  {/* Cart Items List */}
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white p-4">
                    {cart.items.map((item) => (
                      <div
                        key={`${item.productId}-${item.variantId || "default"}`}
                        className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            <Image
                              src={
                                item.image ||
                                "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200"
                              }
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {item.name}
                            </h3>
                            <p className="text-[11px] text-slate-400">
                              {formatCurrency(item.price).replace(".00", "")} per piece
                            </p>

                            {/* Quantity Controls */}
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.variantId,
                                      Math.max(1, item.quantity - 1)
                                    )
                                  }
                                  className="p-1 text-slate-500 hover:text-slate-900 transition"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-7 text-center text-xs font-bold text-slate-800">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.variantId,
                                      item.quantity + 1
                                    )
                                  }
                                  className="p-1 text-slate-500 hover:text-slate-900 transition"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(item.productId, item.variantId)
                                }
                                className="p-1.5 text-slate-400 hover:text-red-600 transition"
                                title="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <span className="text-sm font-black text-slate-900 flex-shrink-0">
                          {formatCurrency(item.total).replace(".00", "")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other Popular Products with Skeleton Loading */}
                <div className="pt-4 space-y-4">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                    Other popular products
                  </h2>

                  {isLoadingPopular ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2.5 animate-pulse"
                        >
                          <div className="aspect-square w-full rounded-lg bg-slate-200" />
                          <div className="h-3 w-3/4 rounded bg-slate-200" />
                          <div className="h-3 w-1/2 rounded bg-slate-200" />
                          <div className="h-7 w-full rounded-lg bg-slate-200" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {popularProducts.map((p) => {
                        const isAdding = addingPopularId === p.id;
                        const disc =
                          p.compareAtPrice && p.compareAtPrice > p.price
                            ? Math.round(
                                ((p.compareAtPrice - p.price) /
                                  p.compareAtPrice) *
                                  100
                              )
                            : null;

                        return (
                          <div
                            key={p.id}
                            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-2.5 transition hover:shadow-xs"
                          >
                            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100 mb-2">
                              <Image
                                src={
                                  p.images[0]?.url ||
                                  "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400"
                                }
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                              {disc && (
                                <span className="absolute right-1 top-1 rounded-xs bg-[#ff6000] px-1 py-0.5 text-[8px] font-black text-white">
                                  {disc}% OFF
                                </span>
                              )}
                            </div>

                            <div className="space-y-1">
                              <h4
                                className="text-xs font-bold text-slate-900 truncate"
                                title={p.name}
                              >
                                {p.name}
                              </h4>
                              <div className="flex items-baseline justify-between pt-0.5">
                                <span className="text-xs font-black text-slate-900">
                                  {formatCurrency(p.price).replace(".00", "")}
                                </span>
                                {p.compareAtPrice && (
                                  <span className="text-[10px] text-slate-400 line-through">
                                    {formatCurrency(p.compareAtPrice).replace(
                                      ".00",
                                      ""
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddPopular(p.id)}
                              disabled={isAdding}
                              className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-lg border border-blue-600 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition cursor-pointer disabled:opacity-50"
                            >
                              {isAdding ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                              ) : (
                                <>
                                  <Plus className="h-3.5 w-3.5" />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* STEP 2: SHIPPING ADDRESS (Matching User Image 2)                  */}
            {/* ----------------------------------------------------------------- */}
            {currentStep === 2 && (
              <form onSubmit={handleContinueToPayment} className="space-y-6 animate-in fade-in duration-200">
                {/* Header with Already a user? Sign in */}
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-bold text-slate-900">
                    Shipping address
                  </h1>

                  {!user && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        setIsAuthModalOpen(true);
                      }}
                      className="rounded-lg border border-[#0b6bcb] px-3 py-1 text-xs font-bold text-[#0b6bcb] hover:bg-blue-50 transition cursor-pointer"
                    >
                      Already a user? Sign In
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Name * */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      placeholder="Enter name"
                      className={`w-full rounded-lg border p-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none transition ${
                        errors.name
                          ? "border-red-500 focus:border-red-600"
                          : "border-slate-300 focus:border-[#0b6bcb]"
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-[11px] font-medium text-red-500">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* 2-Column Row: Mobile Number * and Email Address (optional) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div
                        className={`flex items-center rounded-lg border overflow-hidden transition ${
                          errors.phone
                            ? "border-red-500 focus-within:border-red-600"
                            : "border-slate-300 focus-within:border-[#0b6bcb]"
                        }`}
                      >
                        <span className="bg-slate-50 px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 border-r border-slate-200">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (errors.phone) setErrors({ ...errors, phone: "" });
                          }}
                          placeholder="Enter mobile number"
                          className="w-full p-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-[11px] font-medium text-red-500">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address (optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0b6bcb] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Address * */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => {
                        setStreet(e.target.value);
                        if (errors.street) setErrors({ ...errors, street: "" });
                      }}
                      placeholder="Flat / House No, Building, Colony"
                      className={`w-full rounded-lg border p-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none transition ${
                        errors.street
                          ? "border-red-500 focus:border-red-600"
                          : "border-slate-300 focus:border-[#0b6bcb]"
                      }`}
                    />
                    {errors.street && (
                      <p className="mt-1 text-[11px] font-medium text-red-500">
                        {errors.street}
                      </p>
                    )}
                  </div>

                  {/* 2-Column Row: Locality / Area and Landmark */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Locality / Area (optional)
                      </label>
                      <input
                        type="text"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        placeholder="E.g. MG Road, Gandhi Nagar"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0b6bcb] focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Landmark (optional)
                      </label>
                      <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        placeholder="E.g. Near Bank, Chowk, etc."
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-[#0b6bcb] focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* 2-Column Row: Pin Code * and City * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Pin Code <span className="text-red-500">*</span>
                        </label>
                        {isFetchingPincode && (
                          <span className="flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                            <Loader2 className="h-3 w-3 animate-spin" /> Fetching location...
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={6}
                          value={postalCode}
                          onChange={(e) => handlePincodeChange(e.target.value)}
                          placeholder="Pincode"
                          className={`w-full rounded-lg border p-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none transition ${
                            errors.postalCode
                              ? "border-red-500 focus:border-red-600"
                              : "border-slate-300 focus:border-[#0b6bcb]"
                          }`}
                        />
                      </div>
                      {errors.postalCode && (
                        <p className="mt-1 text-[11px] font-medium text-red-500">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          if (errors.city) setErrors({ ...errors, city: "" });
                        }}
                        placeholder="City"
                        className={`w-full rounded-lg border p-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none transition ${
                          errors.city
                            ? "border-red-500 focus:border-red-600"
                            : "border-slate-300 focus:border-[#0b6bcb]"
                        }`}
                      />
                      {errors.city && (
                        <p className="mt-1 text-[11px] font-medium text-red-500">
                          {errors.city}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* State * */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        if (errors.state) setErrors({ ...errors, state: "" });
                      }}
                      placeholder="State"
                      className={`w-full rounded-lg border p-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none transition ${
                        errors.state
                          ? "border-red-500 focus:border-red-600"
                          : "border-slate-300 focus:border-[#0b6bcb]"
                      }`}
                    />
                    {errors.state && (
                      <p className="mt-1 text-[11px] font-medium text-red-500">
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Cart</span>
                  </button>
                </div>
              </form>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* STEP 3: PAYMENT METHOD                                            */}
            {/* ----------------------------------------------------------------- */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-bold text-slate-900">
                    Payment method
                  </h1>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                    Doorstep Delivery Available
                  </span>
                </div>

                {/* Cash on Delivery Card (Active) */}
                <div className="rounded-2xl border-2 border-[#0b6bcb] bg-blue-50/30 p-5 shadow-xs transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#0b6bcb] text-white font-black text-lg shadow-xs">
                        ₹
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            Cash on delivery
                          </h3>
                          <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                            Active
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700">
                          Pay on delivery (Cash/Card/UPI)
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Pay in cash or pay in person at the time of delivery with GPay/PayTM/PhonePe.
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-[#0b6bcb] flex-shrink-0 mt-0.5" />
                  </div>
                </div>

                {/* Online Payment Gateway (Temporarily on Hold) */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 opacity-75 cursor-not-allowed">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-500 font-bold">
                        <Lock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-600">
                            Online Payment Gateway (UPI / Cards / NetBanking)
                          </h4>
                          <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-black uppercase text-slate-950">
                            On Hold
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Currently offline for maintenance. Please proceed with Cash on Delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Address</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: STICKY ORDER SUMMARY (Matching User Image 2)                */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              {/* 1. Coupons and Offers Strip */}
              <div className="border-b border-slate-100 pb-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Percent className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Coupons and offers
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Save more with coupon and offers
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCouponInput(!showCouponInput)}
                    className="text-xs font-bold text-[#0b6bcb] hover:underline cursor-pointer"
                  >
                    {cart.couponCode ? "Change >" : "Apply >"}
                  </button>
                </div>

                {/* Coupon Code Input Dropdown */}
                {showCouponInput && (
                  <form
                    onSubmit={handleApplyCoupon}
                    className="mt-3 flex gap-2 pt-2 border-t border-slate-100"
                  >
                    <input
                      type="text"
                      placeholder="e.g. MONO2005"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs uppercase font-bold focus:border-[#0b6bcb] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-[#0b6bcb] px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="mt-1.5 text-[11px] font-medium text-red-500">
                    {couponError}
                  </p>
                )}

                {cart.couponCode && (
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800 font-bold border border-emerald-200">
                    <span>Coupon: {cart.couponCode} applied!</span>
                    <span>-{formatCurrency(cart.discount)}</span>
                  </div>
                )}
              </div>

              {/* 2. Price Breakdown */}
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between items-baseline">
                  <span>Item total</span>
                  <div className="flex items-center gap-1.5">
                    {compareAtTotal > cart.subtotal && (
                      <span className="text-[11px] text-slate-400 line-through">
                        {formatCurrency(compareAtTotal).replace(".00", "")}
                      </span>
                    )}
                    <span className="font-bold text-slate-900">
                      {formatCurrency(cart.subtotal).replace(".00", "")}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <span>Delivery fee</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 line-through">
                      ₹99
                    </span>
                    <span className="font-bold text-slate-900">
                      {cart.shippingFee === 0
                        ? "FREE"
                        : formatCurrency(cart.shippingFee).replace(".00", "")}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      Grand total
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Inclusive of all taxes
                    </span>
                  </div>
                  <span className="text-base font-black text-slate-900">
                    {formatCurrency(cart.total).replace(".00", "")}
                  </span>
                </div>
              </div>

              {/* 3. Average Delivery Time */}
              <p className="text-xs text-slate-500 pt-1">
                Average delivery time:{" "}
                <strong className="text-slate-800 font-bold">3-5 days</strong>
              </p>

              {/* 4. Green Savings Alert Banner */}
              {totalSaved > 0 && (
                <div className="rounded-xl bg-[#eafaf1] border border-[#b7ebd1] p-3 text-center text-xs font-bold text-[#147a44]">
                  You have saved total {savedPercent}% (
                  {formatCurrency(totalSaved).replace(".00", "")}) on your order!
                  Yay!
                </div>
              )}

              {/* 5. Primary Action Button with Smooth Loader */}
              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  disabled={isStepNavigating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b6bcb] py-3.5 text-xs sm:text-sm font-black text-white shadow-md hover:bg-blue-700 transition cursor-pointer disabled:opacity-75"
                >
                  {isStepNavigating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              )}

              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  disabled={isStepNavigating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b6bcb] py-3.5 text-xs sm:text-sm font-black text-white shadow-md hover:bg-blue-700 transition cursor-pointer disabled:opacity-75"
                >
                  {isStepNavigating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b6bcb] py-3.5 text-xs sm:text-sm font-black text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <span>
                      Place Order • {formatCurrency(cart.total).replace(".00", "")}
                    </span>
                  )}
                </button>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>100% Genuine Direct Dispatch & Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
