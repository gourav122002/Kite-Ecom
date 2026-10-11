import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (webhookSecret && !verifyWebhookSignature({ body: rawBody, signature, secret: webhookSecret })) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      // Find internal payment
      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId },
        include: { order: { include: { items: true } } },
      });

      if (payment && payment.status !== "PAID") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            razorpayPaymentId,
            rawResponse: JSON.stringify(paymentEntity),
          },
        });

        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            orderStatus: "CONFIRMED",
            paymentStatus: "PAID",
          },
        });

        // Decrement stock if not already done
        for (const item of payment.order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;

      await prisma.payment.updateMany({
        where: { razorpayOrderId },
        data: {
          status: "FAILED",
          rawResponse: JSON.stringify(paymentEntity),
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
