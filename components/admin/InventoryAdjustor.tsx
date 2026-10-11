"use client";

import { adjustInventoryAction } from "@/server/actions/adminActions";
import { Plus, Minus, Warehouse, History } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export function InventoryAdjustor({
  products,
  logs,
}: {
  products: any[];
  logs: any[];
}) {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState(
    products.length > 0 ? products[0].id : ""
  );
  const [changeAmount, setChangeAmount] = useState("10");
  const [reason, setReason] = useState("RESTOCK");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !changeAmount) return;

    setLoading(true);
    setSuccess(false);

    const change = Number(changeAmount);
    await adjustInventoryAction({
      productId: selectedProductId,
      change,
      reason,
    });

    setLoading(false);
    setSuccess(true);
    router.refresh();
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Inventory & Stock Logs</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor real-time warehouse inventory, restock spools, and review audit history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Adjust Box (1 col) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-xs h-fit">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Warehouse className="h-4 w-4 text-blue-600" />
            <span>Stock Adjustment Tool</span>
          </h2>

          {success && (
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800 font-bold border border-emerald-200">
              Stock level updated successfully!
            </div>
          )}

          <form onSubmit={handleAdjust} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Product *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantity Change (+ to Add, - to Deduct) *
              </label>
              <input
                type="number"
                required
                value={changeAmount}
                onChange={(e) => setChangeAmount(e.target.value)}
                placeholder="+10 or -5"
                className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Adjustment Reason *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-600 focus:outline-none"
              >
                <option value="RESTOCK">RESTOCK (Batch Received)</option>
                <option value="CORRECTION">CORRECTION (Inventory Count)</option>
                <option value="DAMAGE">DAMAGE (Transit/Warehouse)</option>
                <option value="RETURN">RETURN (Restocked Return)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Adjusting..." : "Apply Stock Change"}
            </button>
          </form>
        </div>

        {/* Current Stock Table & Logs (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Stock Levels */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Current Catalog Stock</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-slate-400 font-mono">SKU: {p.sku}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        p.stock > 10
                          ? "bg-emerald-100 text-emerald-800"
                          : p.stock > 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {p.stock} units
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="h-4 w-4 text-slate-500" />
              <span>Recent Inventory Movement Logs</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Change</th>
                    <th className="pb-2">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">
                        No movement logs found.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 text-slate-500">
                          {new Date(log.createdAt).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 font-semibold text-slate-900">
                          {log.product?.name || "Unknown Product"}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`font-mono font-bold ${
                              log.change > 0 ? "text-emerald-600" : "text-red-600"
                            }`}
                          >
                            {log.change > 0 ? `+${log.change}` : log.change}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-700">
                            {log.reason}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
