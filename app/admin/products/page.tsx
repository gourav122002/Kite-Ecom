import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Edit, Plus, Trash2, ExternalLink, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { AdminDeleteProductButton } from "@/components/admin/AdminProductActions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage product titles, SKUs, inventory, SEO metadata, and pricing.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No products added yet. Click &ldquo;Add New Product&rdquo; above.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                          <Image
                            src={
                              product.images[0]?.url ||
                              "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-xs">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {product.variants.length > 0
                              ? `${product.variants.length} options`
                              : "Standard"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-semibold text-slate-700">
                      {product.sku}
                    </td>
                    <td className="p-4 font-medium text-slate-600">
                      {product.category.name}
                    </td>
                    <td className="p-4 font-black text-slate-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          product.stock > 10
                            ? "bg-emerald-100 text-emerald-800"
                            : product.stock > 0
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          product.status === "ACTIVE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="rounded-lg p-1.5 text-slate-400 hover:text-slate-900 transition"
                          title="View on Store"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <AdminDeleteProductButton id={product.id} name={product.name} />
                      </div>
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
