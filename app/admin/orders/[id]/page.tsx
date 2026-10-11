import { prisma } from "@/lib/prisma";
import { OrderStatusManager } from "@/components/admin/OrderStatusManager";
import { notFound } from "next/navigation";
import React from "react";

interface AdminOrderDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailsPage({ params }: AdminOrderDetailsProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

  return <OrderStatusManager order={order} />;
}
