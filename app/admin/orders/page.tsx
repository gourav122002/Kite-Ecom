import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Eye, Calendar, User, Truck } from "lucide-react";
import Link from "next/link";
import React from "react";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Orders Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track fulfillment lifecycle, courier tracking numbers, and Razorpay settlements.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-4">Order Number</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No orders in database.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">
                        {order.guestName || "Guest"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {order.guestEmail}
                      </p>
                    </td>
                    <td className="p-4 text-slate-600">
                      {order.items.reduce((acc, curr) => acc + curr.quantity, 0)} items
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          order.orderStatus === "CONFIRMED" || order.orderStatus === "PROCESSING"
                            ? "bg-blue-100 text-blue-800"
                            : order.orderStatus === "SHIPPED"
                            ? "bg-purple-100 text-purple-800"
                            : order.orderStatus === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.orderStatus === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-slate-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 font-bold text-blue-700 hover:bg-blue-100 transition inline-flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
