"use server";

import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { calculateCartTotals } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/lib/razorpay";
import { generateOrderNumber } from "@/lib/utils";
import { checkoutSchema } from "@/validations";
import { revalidatePath } from "next/cache";

export async function createCheckoutOrderAction(payload: {
  email?: string | null;
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
  couponCode?: string | null;
  notes?: string | null;
  paymentMethod?: "COD" | "RAZORPAY";
  items: { productId: string; variantId?: string | null; quantity: number }[];
  guestId?: string | null;
  idempotencyKey?: string | null;
}) {
  try {
    const validated = checkoutSchema.safeParse(payload);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: "Your cart is empty. Please add items to checkout." };
    }

    const cleanPhone = payload.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return { success: false, error: "Please enter a valid 10-digit mobile number." };
    }

    const user = await getCurrentUser();
    const paymentMethod = payload.paymentMethod || "COD";

    // 1. Recalculate totals on server from live product data (never trust client)
    const calculation = await calculateCartTotals(
      payload.items,
      payload.couponCode || undefined
    );

    if (calculation.items.length === 0) {
      return { success: false, error: "No available products in cart." };
    }

    // 2. Execute order creation in an atomic database transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Step A: Stock & availability verification
      for (const item of calculation.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, stock: true, status: true },
        });

        if (!product || product.status !== "ACTIVE") {
          throw new Error(`Product "${item.name}" is currently not available.`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Only ${product.stock} unit(s) available.`
          );
        }

        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { id: true, name: true, stock: true },
          });

          if (!variant || variant.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for "${item.name}". Only ${variant?.stock ?? 0} unit(s) available.`
            );
          }
        }
      }

      // Step B: Prevent duplicate orders caused by repeated button clicks
      const fifteenSecondsAgo = new Date(Date.now() - 15 * 1000);
      const recentOrder = await tx.order.findFirst({
        where: {
          guestPhone: cleanPhone,
          total: calculation.total,
          createdAt: { gte: fifteenSecondsAgo },
        },
        select: {
          id: true,
          orderNumber: true,
          guestToken: true,
          total: true,
        },
      });

      if (recentOrder) {
        return {
          order: recentOrder,
          isDuplicate: true,
          isCod: paymentMethod === "COD",
        };
      }

      // Step C: Generate unique order number and cryptographically secure guestToken
      const orderNumber = generateOrderNumber();
      const guestToken = crypto.randomBytes(24).toString("hex");

      // Normalize optional email (generate fallback if guest provided none)
      const customerEmail =
        payload.email?.trim() || `${cleanPhone}@monokite.store`;

      // Step D: Create the Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id || null,
          guestToken,
          guestEmail: customerEmail,
          guestName: payload.shippingAddress.name.trim(),
          guestPhone: cleanPhone,
          shippingAddress: JSON.stringify(payload.shippingAddress),
          subtotal: calculation.subtotal,
          discount: calculation.discount,
          tax: calculation.tax,
          shippingFee: calculation.shippingFee,
          total: calculation.total,
          orderStatus: "CONFIRMED",
          paymentStatus: "PENDING",
          couponCode: calculation.couponCode,
          notes: payload.notes || null,
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

      // Step E: Create Payment & handle stock for COD or Razorpay
      if (paymentMethod === "COD") {
        await tx.payment.create({
          data: {
            orderId: order.id,
            amount: calculation.total,
            currency: "INR",
            provider: "COD",
            status: "PENDING",
          },
        });

        // Deduct inventory stock
        for (const item of calculation.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });

          await tx.inventory.create({
            data: {
              productId: item.productId,
              change: -item.quantity,
              reason: "PURCHASE",
              referenceId: order.id,
            },
          });

          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }

        // Increment coupon count if applied
        if (order.couponCode) {
          await tx.coupon.update({
            where: { code: order.couponCode },
            data: { usageCount: { increment: 1 } },
          });

          if (order.userId) {
            const coupon = await tx.coupon.findUnique({
              where: { code: order.couponCode },
            });
            if (coupon) {
              await tx.couponUsage.create({
                data: {
                  couponId: coupon.id,
                  userId: order.userId,
                  orderId: order.id,
                },
              });
            }
          }
        }

        // Clear user cart or guest cart ONLY on successful order creation
        if (order.userId) {
          await tx.cartItem.deleteMany({
            where: { cart: { userId: order.userId } },
          });
        }
        if (payload.guestId) {
          await tx.cartItem.deleteMany({
            where: { cart: { guestId: payload.guestId } },
          });
        }

        return {
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            total: calculation.total,
            guestToken: order.guestToken,
          },
          isDuplicate: false,
          isCod: true,
        };
      } else {
        // Step F: Online Payment Gateway (Razorpay)
        const rzpOrder = await createRazorpayOrder({
          amount: calculation.total,
          currency: "INR",
          receipt: order.orderNumber,
          notes: {
            orderId: order.id,
            phone: cleanPhone,
          },
        });

        await tx.payment.create({
          data: {
            orderId: order.id,
            amount: calculation.total,
            currency: "INR",
            provider: "RAZORPAY",
            razorpayOrderId: rzpOrder.id,
            status: "PENDING",
          },
        });

        return {
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            total: calculation.total,
            guestToken: order.guestToken,
          },
          isDuplicate: false,
          isCod: false,
          razorpayOrder: rzpOrder,
        };
      }
    });

    try {
      revalidatePath(`/orders/${transactionResult.order.id}`);
      revalidatePath("/admin/orders");
    } catch {}

    return {
      success: true,
      isCod: transactionResult.isCod,
      order: transactionResult.order,
      razorpayOrder: (transactionResult as any).razorpayOrder || null,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to place order. Please try again.",
    };
  }
}

export async function verifyAndConfirmPaymentAction({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  guestId,
}: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  guestId?: string | null;
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

    // Process payment confirmation in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { orderId, razorpayOrderId },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: "PAID",
        },
      });

      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          orderStatus: "CONFIRMED",
          paymentStatus: "PAID",
        },
        include: { items: true },
      });

      // Deduct stock and log inventory
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.inventory.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: "PURCHASE",
            referenceId: order.id,
          },
        });

        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Handle coupon count
      if (order.couponCode) {
        await tx.coupon.update({
          where: { code: order.couponCode },
          data: { usageCount: { increment: 1 } },
        });
        if (order.userId) {
          const coupon = await tx.coupon.findUnique({
            where: { code: order.couponCode },
          });
          if (coupon) {
            await tx.couponUsage.create({
              data: {
                couponId: coupon.id,
                userId: order.userId,
                orderId: order.id,
              },
            });
          }
        }
      }

      // Clear user or guest cart
      if (order.userId) {
        await tx.cartItem.deleteMany({
          where: { cart: { userId: order.userId } },
        });
      }
      if (guestId) {
        await tx.cartItem.deleteMany({
          where: { cart: { guestId } },
        });
      }

      return order;
    });

    try {
      revalidatePath(`/orders/${updatedOrder.id}`);
      revalidatePath("/admin/orders");
    } catch {}

    return {
      success: true,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      guestToken: updatedOrder.guestToken,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to confirm payment" };
  }
}

export async function trackOrderAction({
  orderNumber,
  phone,
}: {
  orderNumber: string;
  phone: string;
}) {
  try {
    const cleanNum = orderNumber.trim();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanNum) {
      return { success: false, error: "Please enter your Order Reference Number." };
    }
    if (cleanPhone.length < 10) {
      return { success: false, error: "Please enter your 10-digit mobile number." };
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: { equals: cleanNum } },
          { id: { equals: cleanNum } },
        ],
        guestPhone: { contains: cleanPhone.slice(-10) },
      },
      select: {
        id: true,
        orderNumber: true,
        guestToken: true,
        orderStatus: true,
        paymentStatus: true,
        total: true,
        createdAt: true,
        items: {
          select: {
            name: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        error: "No matching order found for this Order Number and Mobile Number. Please check and try again.",
      };
    }

    return {
      success: true,
      orderId: order.id,
      guestToken: order.guestToken,
      order,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to search order." };
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
