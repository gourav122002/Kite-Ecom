"use server";

import { getCurrentUser } from "@/lib/auth";
import { calculateCartTotals } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCartAction(guestId?: string, couponCode?: string) {
  try {
    const user = await getCurrentUser();

    let cart = null;
    if (user) {
      cart = await prisma.cart.findUnique({
        where: { userId: user.id },
        include: { items: true },
      });
    } else if (guestId) {
      cart = await prisma.cart.findUnique({
        where: { guestId },
        include: { items: true },
      });
    }

    const items =
      cart?.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })) || [];

    const calculated = await calculateCartTotals(items, couponCode);
    return { success: true, cart: calculated, cartId: cart?.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addToCartAction({
  productId,
  variantId,
  quantity = 1,
  guestId,
}: {
  productId: string;
  variantId?: string | null;
  quantity?: number;
  guestId?: string;
}) {
  try {
    const user = await getCurrentUser();

    // Verify product & stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || product.status !== "ACTIVE") {
      return { success: false, error: "Product not available" };
    }

    let cart;
    if (user) {
      cart = await prisma.cart.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      });
    } else if (guestId) {
      cart = await prisma.cart.upsert({
        where: { guestId },
        create: { guestId },
        update: {},
      });
    } else {
      return { success: false, error: "Session or Guest ID missing" };
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
        },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCartItemQuantityAction({
  productId,
  variantId,
  quantity,
  guestId,
}: {
  productId: string;
  variantId?: string | null;
  quantity: number;
  guestId?: string;
}) {
  try {
    const user = await getCurrentUser();
    let cart;
    if (user) {
      cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    } else if (guestId) {
      cart = await prisma.cart.findUnique({ where: { guestId } });
    }

    if (!cart) return { success: false, error: "Cart not found" };

    const item = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (!item) return { success: false, error: "Item not found in cart" };

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function validateCouponAction(code: string, subtotal: number) {
  try {
    if (!code) return { success: false, error: "Please enter a coupon code" };
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return { success: false, error: "Invalid or expired coupon code" };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { success: false, error: "Coupon code has expired" };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { success: false, error: "Coupon usage limit reached" };
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return {
        success: false,
        error: `Minimum order value for this coupon is ₹${coupon.minOrderValue}`,
      };
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }

    return {
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount: Math.round(discount * 100) / 100,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
