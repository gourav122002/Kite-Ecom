"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  blogPostSchema,
  categorySchema,
  couponSchema,
  orderStatusUpdateSchema,
  productSchema,
} from "@/validations";
import { revalidatePath } from "next/cache";

// 1. Dashboard Statistics
export async function getAdminDashboardStats() {
  await requireAuth(["ADMIN", "STAFF"]);

  const [
    totalOrders,
    totalProducts,
    totalCustomers,
    recentOrders,
    lowStockProducts,
    paidOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        items: true,
      },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 10 }, status: "ACTIVE" },
      take: 6,
      include: { category: true },
    }),
    prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      select: { total: true },
    }),
  ]);

  const totalRevenue = paidOrders.reduce((acc, curr) => acc + curr.total, 0);

  return {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    recentOrders,
    lowStockProducts,
  };
}

// 2. Product Management
export async function createProductAction(data: any) {
  const user = await requireAuth(["ADMIN", "STAFF"]);
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { images, variants, ...prodFields } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...prodFields,
      images: images
        ? {
            create: images.map((img, idx) => ({
              url: img.url,
              altText: img.altText || `${prodFields.name} ${idx + 1}`,
              sortOrder: img.sortOrder || idx,
            })),
          }
        : undefined,
      variants: variants
        ? {
            create: variants.map((v) => ({
              name: v.name,
              sku: v.sku,
              priceDelta: v.priceDelta || 0,
              stock: v.stock || 10,
            })),
          }
        : undefined,
      inventoryLogs: {
        create: {
          change: prodFields.stock,
          reason: "ADMIN_CREATE",
        },
      },
    },
  });

  await prisma.adminAuditLog.create({
    data: {
      userId: user.id,
      action: "CREATE_PRODUCT",
      entity: "Product",
      entityId: product.id,
      details: JSON.stringify({ name: product.name, sku: product.sku }),
    },
  });

  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true, product };
}

export async function updateProductAction(id: string, data: any) {
  const user = await requireAuth(["ADMIN", "STAFF"]);
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { images, variants, ...prodFields } = parsed.data;

  // Delete existing images & variants and re-create to keep sync simple
  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.productVariant.deleteMany({ where: { productId: id } });

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...prodFields,
      images: images
        ? {
            create: images.map((img, idx) => ({
              url: img.url,
              altText: img.altText || `${prodFields.name} ${idx + 1}`,
              sortOrder: img.sortOrder || idx,
            })),
          }
        : undefined,
      variants: variants
        ? {
            create: variants.map((v) => ({
              name: v.name,
              sku: v.sku,
              priceDelta: v.priceDelta || 0,
              stock: v.stock || 10,
            })),
          }
        : undefined,
    },
  });

  await prisma.adminAuditLog.create({
    data: {
      userId: user.id,
      action: "UPDATE_PRODUCT",
      entity: "Product",
      entityId: product.id,
      details: JSON.stringify({ name: product.name }),
    },
  });

  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true, product };
}

export async function deleteProductAction(id: string) {
  const user = await requireAuth(["ADMIN"]);

  // Check if product is referenced in customer orders
  const ordersCount = await prisma.orderItem.count({
    where: { productId: id },
  });

  if (ordersCount > 0) {
    // Archive product to protect past invoices & historical records
    await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED", stock: 0 },
    });

    await prisma.adminAuditLog.create({
      data: {
        userId: user.id,
        action: "ARCHIVE_PRODUCT",
        entity: "Product",
        entityId: id,
        details: JSON.stringify({ reason: "Archived because existing orders reference this product" }),
      },
    });

    revalidatePath("/products");
    revalidatePath("/admin/products");
    return { success: true, archived: true };
  }

  // Safely clean up cart items and inventory logs before hard delete
  await prisma.cartItem.deleteMany({ where: { productId: id } });
  await prisma.inventory.deleteMany({ where: { productId: id } });
  await prisma.productVariant.deleteMany({ where: { productId: id } });
  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  await prisma.adminAuditLog.create({
    data: {
      userId: user.id,
      action: "DELETE_PRODUCT",
      entity: "Product",
      entityId: id,
    },
  });

  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true };
}

// 3. Category Management
export async function createCategoryAction(data: any) {
  await requireAuth(["ADMIN", "STAFF"]);
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const category = await prisma.category.create({
    data: parsed.data,
  });

  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  return { success: true, category };
}

export async function updateCategoryAction(id: string, data: any) {
  await requireAuth(["ADMIN", "STAFF"]);
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const category = await prisma.category.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  return { success: true, category };
}

export async function deleteCategoryAction(id: string) {
  const user = await requireAuth(["ADMIN"]);

  const productCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productCount > 0) {
    return {
      success: false,
      error: `Cannot delete category: ${productCount} product(s) are assigned to it. Please reassign or delete those products first.`,
    };
  }

  await prisma.category.delete({
    where: { id },
  });

  await prisma.adminAuditLog.create({
    data: {
      userId: user.id,
      action: "DELETE_CATEGORY",
      entity: "Category",
      entityId: id,
    },
  });

  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  return { success: true };
}

// 4. Order & Status Management
export async function updateOrderStatusAction(data: {
  orderId: string;
  orderStatus: any;
  paymentStatus?: any;
  trackingNumber?: string;
}) {
  const user = await requireAuth(["ADMIN", "STAFF"]);
  const parsed = orderStatusUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const updateData: any = {
    orderStatus: parsed.data.orderStatus,
  };
  if (parsed.data.paymentStatus) {
    updateData.paymentStatus = parsed.data.paymentStatus;
  }
  if (parsed.data.trackingNumber !== undefined) {
    updateData.trackingNumber = parsed.data.trackingNumber;
  }

  const order = await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: updateData,
  });

  await prisma.adminAuditLog.create({
    data: {
      userId: user.id,
      action: "UPDATE_ORDER_STATUS",
      entity: "Order",
      entityId: order.id,
      details: JSON.stringify(updateData),
    },
  });

  revalidatePath(`/orders/${order.id}`);
  revalidatePath("/admin/orders");
  return { success: true, order };
}

// 5. Inventory Adjustments
export async function adjustInventoryAction({
  productId,
  change,
  reason,
}: {
  productId: string;
  change: number;
  reason: string;
}) {
  const user = await requireAuth(["ADMIN", "STAFF"]);

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      stock: { increment: change },
    },
  });

  await prisma.inventory.create({
    data: {
      productId,
      change,
      reason: reason || "MANUAL_ADJUSTMENT",
    },
  });

  await prisma.adminAuditLog.create({
    data: {
      userId: user.id,
      action: "ADJUST_INVENTORY",
      entity: "Product",
      entityId: productId,
      details: JSON.stringify({ change, reason }),
    },
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  return { success: true, stock: product.stock };
}

// 6. Coupon Management
export async function createCouponAction(data: any) {
  await requireAuth(["ADMIN"]);
  const parsed = couponSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const coupon = await prisma.coupon.create({
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });

  revalidatePath("/admin/coupons");
  return { success: true, coupon };
}

export async function deleteCouponAction(id: string) {
  await requireAuth(["ADMIN"]);
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  return { success: true };
}

// 7. Blog Management
export async function createBlogPostAction(data: any) {
  await requireAuth(["ADMIN", "STAFF"]);
  const parsed = blogPostSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const post = await prisma.blogPost.create({
    data: parsed.data,
  });

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { success: true, post };
}

export async function updateBlogPostAction(id: string, data: any) {
  await requireAuth(["ADMIN", "STAFF"]);
  const parsed = blogPostSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { success: true, post };
}
