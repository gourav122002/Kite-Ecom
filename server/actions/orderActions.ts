"use server";

import { getCurrentUser } from "@/lib/auth";
import { calculateCartTotals } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/lib/razorpay";
import { generateOrderNumber } from "@/lib/utils";
import { checkoutSchema } from "@/validations";
import { revalidatePath } from "next/cache";

export async function createCheckoutOrderAction(payload: {
  email: string;
  phone: string;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  couponCode?: string;
  notes?: string;
  paymentMethod?: "COD" | "RAZORPAY";
  items: { productId: string; variantId?: string | null; quantity: number }[];
  guestId?: string;
}) {
  try {
    const validated = checkoutSchema.safeParse(payload);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: "Your cart is empty" };
    }

    const user = await getCurrentUser();
    const paymentMethod = payload.paymentMethod || "COD";

    // 1. Recalculate totals on the server from database data
    const calculation = await calculateCartTotals(
      payload.items,
      payload.couponCode
    );

    if (calculation.items.length === 0) {
      return { success: false, error: "No available products in cart" };
    }

    const orderNumber = generateOrderNumber();

    // 2. If Cash on Delivery (COD)
    if (paymentMethod === "COD") {
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: user?.id || null,
          guestEmail: payload.email,
          guestName: payload.shippingAddress.name,
          guestPhone: payload.phone,
          shippingAddress: JSON.stringify(payload.shippingAddress),
          subtotal: calculation.subtotal,
          discount: calculation.discount,
          tax: calculation.tax,
          shippingFee: calculation.shippingFee,
          total: calculation.total,
          orderStatus: "CONFIRMED",
          paymentStatus: "PENDING", // Pay on delivery
          couponCode: calculation.couponCode,
          notes: payload.notes,
          items: {
            create: calculation.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId || null,
              name: item.name,
              sku: item.sku,
              price: item.price,
              quantity: item.quantity,
              total: item.total,
            })),
          },
        },
      });

      // Create COD Payment record
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: calculation.total,
          currency: "INR",
          provider: "COD",
          status: "PENDING",
        },
      });

      // Deduct stock and record inventory logs
      for (const item of calculation.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        await prisma.inventory.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: "PURCHASE",
            referenceId: order.id,
          },
        });

        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }
      }

      // If coupon used, increment coupon usage
      if (order.couponCode) {
        await prisma.coupon.update({
          where: { code: order.couponCode },
          data: { usageCount: { increment: 1 } },
        });
        if (order.userId) {
          const coupon = await prisma.coupon.findUnique({
            where: { code: order.couponCode },
          });
          if (coupon) {
            await prisma.couponUsage.create({
              data: {
                couponId: coupon.id,
                userId: order.userId,
                orderId: order.id,
              },
            });
          }
        }
      }

      // Clear user cart if exists
      if (order.userId) {
        await prisma.cartItem.deleteMany({
          where: { cart: { userId: order.userId } },
        });
      }

      revalidatePath(`/orders/${order.id}`);
      revalidatePath("/admin/orders");

      return {
        success: true,
        isCod: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: calculation.total,
          currency: "INR",
        },
      };
    }

    // 3. Online Payment Gateway (Razorpay) - currently on hold
    return {
      success: false,
      error: "Online payment gateway is temporarily on hold. Please choose Cash on Delivery (COD).",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to initiate checkout" };
  }
}

export async function verifyAndConfirmPaymentAction({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  try {
    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return { success: false, error: "Invalid payment signature verification failed" };
    }

    // Update payment record
    await prisma.payment.updateMany({
      where: { orderId, razorpayOrderId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: "PAID",
      },
    });

    // Update Order to CONFIRMED & Payment to PAID
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: "CONFIRMED",
        paymentStatus: "PAID",
      },
      include: {
        items: true,
      },
    });

    // Deduct stock and record inventory log
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      await prisma.inventory.create({
        data: {
          productId: item.productId,
          change: -item.quantity,
          reason: "PURCHASE",
          referenceId: order.id,
        },
      });

      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }
    }

    // If coupon used, increment coupon usage
    if (order.couponCode) {
      await prisma.coupon.update({
        where: { code: order.couponCode },
        data: { usageCount: { increment: 1 } },
      });
      if (order.userId) {
        const coupon = await prisma.coupon.findUnique({
          where: { code: order.couponCode },
        });
        if (coupon) {
          await prisma.couponUsage.create({
            data: {
              couponId: coupon.id,
              userId: order.userId,
              orderId: order.id,
            },
          });
        }
      }
    }

    // Clear user cart if exists
    if (order.userId) {
      await prisma.cartItem.deleteMany({
        where: { cart: { userId: order.userId } },
      });
    }

    revalidatePath(`/orders/${order.id}`);
    revalidatePath("/admin/orders");
    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to confirm payment" };
  }
}

export async function getOrderById(orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { take: 1 },
            },
          },
        },
      },
      payments: true,
    },
  });
}

export async function getPopularProductsForCheckoutAction() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      take: 6,
      orderBy: { rating: "desc" },
    });
    return { success: true, products };
  } catch (err: any) {
    return { success: false, products: [] };
  }
}
