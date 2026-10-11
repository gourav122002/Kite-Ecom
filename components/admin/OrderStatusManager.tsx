"use client";

import { updateOrderStatusAction } from "@/server/actions/adminActions";
import { formatCurrency } from "@/lib/utils";
import { Check, Truck, CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export function OrderStatusManager({ order }: { order: any }) {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await updateOrderStatusAction({
      orderId: order.id,
      orderStatus,
      paymentStatus,
      trackingNumber: trackingNumber || undefined,
    });

    if (res.success) {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || "Failed to update order");
    }
    setLoading(false);
  };

  let addressObj: any = {};
  try {
    addressObj = JSON.parse(order.shippingAddress);
  } catch {}

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Manage Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500">
              Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {success && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200 flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Order status and tracking successfully updated!</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Order Status Form & Items */}
        <div className="md:col-span-2 space-y-6">
          {/* Status update form */}
          <form
            onSubmit={handleUpdate}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-xs"
          >
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-600" />
              <span>Update Fulfillment & Tracking</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Order Status (Workflow)
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="RETURN_REQUESTED">RETURN_REQUESTED</option>
                  <option value="RETURNED">RETURNED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="FAILED">FAILED</option>
                  <option value="REFUNDED">REFUNDED</option>
                  <option value="PARTIALLY_REFUNDED">PARTIALLY_REFUNDED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Courier Tracking AWB / Reference
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. DTDC-984214 or BlueDart-IN-8821"
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Saving Changes..." : "Save Order Changes"}
            </button>
          </form>

          {/* Items table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Purchased Line Items ({order.items.length})
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex justify-between py-3">
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-slate-400 font-mono">SKU: {item.sku}</p>
                    <p className="text-slate-500">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({order.couponCode})</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span className="text-base text-blue-600">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Customer & Shipping snapshot */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Customer Details</h3>
            <div className="text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">{addressObj.name || order.guestName}</p>
              <p className="font-mono text-slate-500">{order.guestEmail}</p>
              <p>{addressObj.phone || order.guestPhone}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Shipping Snapshot</h3>
            <div className="text-slate-600 space-y-1">
              <p>{addressObj.street}</p>
              <p>
                {addressObj.city}, {addressObj.state} - {addressObj.postalCode}
              </p>
              <p>{addressObj.country || "India"}</p>
              {order.notes && (
                <p className="pt-2 text-slate-500 italic">Notes: &ldquo;{order.notes}&rdquo;</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
