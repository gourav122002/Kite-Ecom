import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Users, Mail, Phone, ShoppingBag } from "lucide-react";
import React from "react";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: {
        select: { id: true, total: true, paymentStatus: true, createdAt: true },
      },
      addresses: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Customer Accounts</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review registered customer profiles, lifetime order spend, and shipping addresses.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Registered Date</th>
                <th className="p-4">Orders Count</th>
                <th className="p-4 text-right">Lifetime Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No customers registered yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const paidOrders = c.orders.filter((o) => o.paymentStatus === "PAID");
                  const totalSpend = paidOrders.reduce((acc, curr) => acc + curr.total, 0);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-xs">
                            {c.name ? c.name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{c.name || "Customer"}</p>
                            <p className="text-[11px] text-slate-400 font-mono">ID: {c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-mono text-slate-700">{c.email}</p>
                        <p className="text-[11px] text-slate-400">{c.phone || "No phone"}</p>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                          {c.orders.length} {c.orders.length === 1 ? "order" : "orders"}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-slate-900">
                        {formatCurrency(totalSpend)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
