import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { OrderSuccessConfetti } from "@/components/store/OrderSuccessConfetti";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Lock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface OrderPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    token?: string;
  }>;
}

export default async function OrderDetailPage({ params, searchParams }: OrderPageProps) {
  const { id } = await params;
  const search = searchParams ? await searchParams : {};
  const token = search?.token;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { take: 1 } },
          },
        },
      },
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isOwner = !!(currentUser && order.userId && currentUser.id === order.userId);
  const hasValidGuestToken = !!(token && order.guestToken && token === order.guestToken);
  const isStaffOrAdmin = !!(currentUser && (currentUser.role === "ADMIN" || currentUser.role === "STAFF"));
  const isAuthorized = isOwner || hasValidGuestToken || isStaffOrAdmin;

  let addressObj: any = {};
  try {
    addressObj = JSON.parse(order.shippingAddress);
  } catch {}

  const isConfirmed = order.orderStatus !== "CANCELLED";

  // Mask sensitive info for privacy if accessed without token or login
  const displayName = isAuthorized
    ? addressObj.name || order.guestName || "Customer"
    : (order.guestName || "Customer")
        .split(" ")
        .map((part) => (part.length > 1 ? part[0] + "*".repeat(part.length - 1) : part))
        .join(" ");

  const displayPhone = isAuthorized
    ? addressObj.phone || order.guestPhone || ""
    : order.guestPhone
    ? `+91 ******${order.guestPhone.slice(-4)}`
    : "Protected";

  const displayStreet = isAuthorized
    ? addressObj.street
    : "Street address hidden for privacy";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {order.paymentStatus === "PAID" && <OrderSuccessConfetti />}

      {/* Header Banner */}
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {order.payments[0]?.provider === "COD" ? "Order Placed & Confirmed" : "Payment Confirmed & Verified"}
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              Thank You for Your Order!
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              {order.payments[0]?.provider === "COD"
                ? `Your Cash on Delivery order is confirmed and sent to dispatch.`
                : `Payment confirmed. Dispatched to ${isAuthorized ? order.guestEmail : "your contact email"}.`}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 self-stretch sm:self-auto border-t sm:border-t-0 border-emerald-200 pt-4 sm:pt-0">
          <span className="text-xs text-slate-500 font-semibold">Order Reference</span>
          <span className="font-mono text-base font-black text-slate-900 bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-xs">
            {order.orderNumber}
          </span>
        </div>
      </div>

      {!isAuthorized && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>
              Customer address and phone number are hidden for privacy.
            </span>
          </div>
          <Link
            href="/track"
            className="rounded-lg bg-amber-600 px-3 py-1 text-white font-bold hover:bg-amber-700 transition"
          >
            Verify with Mobile Number
          </Link>
        </div>
      )}

      {/* 5-Step Fulfillment Status Timeline Tracker (Amazon/Ecommerce style matching user screenshot) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#008296]" />
            <span>Fulfillment Status</span>
          </h2>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Estimated Delivery: 3-5 Business Days
          </span>
        </div>

        {/* Horizontal Progress Bar matching User Screenshot */}
        <div className="py-4">
          {/* Top Dates Row */}
          <div className="grid grid-cols-5 text-xs text-slate-600 font-bold mb-2">
            <div className="text-left pl-1 text-slate-900 font-black">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="text-center"></div>
            <div className="text-center"></div>
            <div className="text-center"></div>
            <div className="text-right pr-1 text-slate-400 font-medium">
              Expected
            </div>
          </div>

          {/* Progress Line & Nodes Container */}
          <div className="relative flex items-center justify-between my-2">
            {/* Background Grey Connecting Line */}
            <div className="absolute left-3 right-3 top-1/2 h-1.5 -translate-y-1/2 bg-[#d5d9d9] rounded-full z-0" />

            {/* Active Teal Progress Line */}
            <div
              className="absolute left-3 top-1/2 h-1.5 -translate-y-1/2 bg-[#008296] rounded-full z-0 transition-all duration-1000 ease-out"
              style={{
                width:
                  order.orderStatus === "DELIVERED"
                    ? "calc(100% - 24px)"
                    : order.orderStatus === "OUT_FOR_DELIVERY"
                    ? "75%"
                    : order.orderStatus === "SHIPPED"
                    ? "50%"
                    : order.orderStatus === "PROCESSING" || order.orderStatus === "CONFIRMED"
                    ? "25%"
                    : "0%",
              }}
            />

            {/* Step 1 Node: Placed */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#008296] text-white shadow-xs">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            {/* Step 2 Node: Shipped */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500 shadow-xs ${
                  ["CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus)
                    ? "bg-[#008296] text-white"
                    : "bg-[#d5d9d9] text-white"
                }`}
              >
                {["CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full bg-white/70" />
                )}
              </div>
            </div>

            {/* Step 3 Node: On the way */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500 shadow-xs ${
                  ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus)
                    ? "bg-[#008296] text-white"
                    : "bg-[#d5d9d9] text-white"
                }`}
              >
                {["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full bg-white/70" />
                )}
              </div>
            </div>

            {/* Step 4 Node: Out for Delivery */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500 shadow-xs ${
                  ["OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus)
                    ? "bg-[#008296] text-white"
                    : "bg-[#d5d9d9] text-white"
                }`}
              >
                {["OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full bg-white/70" />
                )}
              </div>
            </div>

            {/* Step 5 Node: Delivered */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500 shadow-xs ${
                  order.orderStatus === "DELIVERED"
                    ? "bg-[#008296] text-white"
                    : "bg-[#d5d9d9] text-white"
                }`}
              >
                {order.orderStatus === "DELIVERED" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full bg-white/70" />
                )}
              </div>
            </div>
          </div>

          {/* Status Labels Row (No numbers, matching user screenshot) */}
          <div className="grid grid-cols-5 text-center pt-1">
            <span className="text-xs font-bold text-[#007185] text-left">
              Placed
            </span>
            <span
              className={`text-xs ${
                ["CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus)
                  ? "font-bold text-[#007185]"
                  : "text-slate-500"
              }`}
            >
              Shipped
            </span>
            <span
              className={`text-xs ${
                ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus)
                  ? "font-bold text-[#007185]"
                  : "text-slate-500"
              }`}
            >
              On the way
            </span>
            <span
              className={`text-xs ${
                ["OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus)
                  ? "font-bold text-[#007185]"
                  : "text-slate-500"
              }`}
            >
              Out for Delivery
            </span>
            <span
              className={`text-xs text-right ${
                order.orderStatus === "DELIVERED"
                  ? "font-bold text-[#007185]"
                  : "text-slate-500"
              }`}
            >
              Delivered
            </span>
          </div>
        </div>

        {/* Bottom Details Section */}
        <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 bg-slate-50/70 p-4 rounded-2xl">
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">
              Courier Partner
            </span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm">
              Mono Kite Express / Delhivery
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">
              Tracking AWB / Reference
            </span>
            <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
              {order.trackingNumber || `MK-EXP-${order.orderNumber.replace(/\D/g, "").slice(0, 8)}`}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-semibold block uppercase">
              Latest Activity
            </span>
            <span className="font-bold text-emerald-700 text-xs sm:text-sm">
              Order confirmed and assigned for dispatch
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Ordered Items (2 cols) */}
        <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Purchased Items ({order.items.length})
          </h2>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4 gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                    <Image
                      src={
                        item.product?.images[0]?.url ||
                        "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200"
                      }
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">SKU: {item.sku}</p>
                    <p className="text-xs text-slate-500">
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount ({order.couponCode})</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {order.shippingFee === 0 ? "FREE" : formatCurrency(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-black text-slate-900">
              <span>{order.payments[0]?.provider === "COD" ? "Total Payable (COD)" : "Total Paid"}</span>
              <span className="text-xl text-blue-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment Meta (1 col) */}
        <div className="space-y-6">
          {/* Delivery Details */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>Shipping Address</span>
            </h3>
            <div className="text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">{displayName}</p>
              <p>{displayStreet}</p>
              <p>
                {addressObj.city || "City"}, {addressObj.state || "State"} - {addressObj.postalCode || ""}
              </p>
              <p>{addressObj.country || "India"}</p>
              <p className="pt-1 text-slate-500">Phone: {displayPhone}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              <span>Payment Details</span>
            </h3>
            <div className="text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-semibold text-slate-900">
                  {order.payments[0]?.provider === "COD" ? "Cash on Delivery (COD)" : "Razorpay Online"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status</span>
                <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                  order.paymentStatus === "PAID"
                    ? "bg-emerald-100 text-emerald-800"
                    : order.payments[0]?.provider === "COD"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-700"
                }`}>
                  {order.payments[0]?.provider === "COD" && order.paymentStatus === "PENDING"
                    ? "Pay on Delivery"
                    : order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span>{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
            </div>
          </div>

          <Link
            href="/products"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
