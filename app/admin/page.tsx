import { getAdminDashboardStats } from "@/server/actions/adminActions";
import { formatCurrency } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  Package,
  Plus,
  ShoppingBag,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import React from "react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Admin Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time performance, orders, inventory logs, and store health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/coupons"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <span>Create Coupon</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-2">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Verified Paid Orders</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Orders
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{stats.totalOrders}</p>
          <p className="text-[11px] text-slate-400 mt-2">Lifetime customer purchases</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Products
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{stats.totalProducts}</p>
          <p className="text-[11px] text-slate-400 mt-2">In stock & ready to order</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Customers
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-3">{stats.totalCustomers}</p>
          <p className="text-[11px] text-slate-400 mt-2">Registered client accounts</p>
        </div>
      </div>

      {/* Low Stock Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3 text-right">Total</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 text-slate-700">
                        {order.guestName || "Guest"}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            order.orderStatus === "CONFIRMED" || order.orderStatus === "PROCESSING"
                              ? "bg-blue-100 text-blue-800"
                              : order.orderStatus === "SHIPPED"
                              ? "bg-purple-100 text-purple-800"
                              : order.orderStatus === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            order.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-slate-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts & Fast Restock */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-600 border-b border-slate-100 pb-4">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-base font-bold text-slate-900">Low Stock Inventory</h2>
          </div>

          <div className="space-y-3">
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                All products have healthy inventory levels.
              </p>
            ) : (
              stats.lowStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:border-amber-200 transition"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">SKU: {prod.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-black text-red-700">
                      {prod.stock} left
                    </span>
                    <Link
                      href="/admin/inventory"
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      + Stock
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 pt-3">
            <Link
              href="/admin/inventory"
              className="block text-center text-xs font-bold text-blue-600 hover:underline"
            >
              Open Full Inventory Manager →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
