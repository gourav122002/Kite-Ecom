import crypto from "crypto";
import Razorpay from "razorpay";

const KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_sampleKeyId123";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "sampleSecretKey456";

export const razorpayClient =
  process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes("sample")
    ? new Razorpay({
        key_id: KEY_ID,
        key_secret: KEY_SECRET,
      })
    : null;

export interface CreateOrderParams {
  amount: number; // in INR
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
  notes = {},
}: CreateOrderParams) {
  const amountInPaise = Math.round(amount * 100);

  if (razorpayClient) {
    try {
      const order = await razorpayClient.orders.create({
        amount: amountInPaise,
        currency,
        receipt,
        notes,
      });
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        mock: false,
      };
    } catch (error) {
      console.warn("Razorpay API call failed, using mock order for dev:", error);
    }
  }

  // Demo / Dev Fallback Order
  const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  return {
    id: mockOrderId,
    amount: amountInPaise,
    currency,
    mock: true,
  };
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (orderId.startsWith("order_mock_")) {
    return true; // Auto-verify simulated dev payments
  }

  if (!KEY_SECRET) return false;

  const generatedSignature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

export function verifyWebhookSignature({
  body,
  signature,
  secret,
}: {
  body: string;
  signature: string;
  secret: string;
}): boolean {
  if (!secret || !signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}
