import { prisma } from "@/lib/prisma";
import { CouponManager } from "@/components/admin/CouponManager";
import React from "react";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <CouponManager coupons={coupons} />;
}
