import { prisma } from "@/lib/prisma";
import { InventoryAdjustor } from "@/components/admin/InventoryAdjustor";
import React from "react";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const [products, logs] = await Promise.all([
    prisma.product.findMany({
      select: { id: true, name: true, sku: true, stock: true },
      orderBy: { stock: "asc" },
    }),
    prisma.inventory.findMany({
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return <InventoryAdjustor products={products} logs={logs} />;
}
