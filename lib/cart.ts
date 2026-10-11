import { prisma } from "./prisma";

export interface CartCalculationResult {
  items: {
    productId: string;
    variantId?: string | null;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    total: number;
    image?: string;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  total: number;
  couponCode?: string | null;
}

export async function calculateCartTotals(
  rawItems: { productId: string; variantId?: string | null; quantity: number }[],
  couponCode?: string | null
): Promise<CartCalculationResult> {
  if (!rawItems || rawItems.length === 0) {
    return {
      items: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      shippingFee: 0,
      total: 0,
      couponCode: null,
    };
  }

  const productIds = rawItems.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "ACTIVE" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const verifiedItems: CartCalculationResult["items"] = [];

  for (const raw of rawItems) {
    const product = productMap.get(raw.productId);
    if (!product) continue;

    let itemPrice = product.price;
    let itemSku = product.sku;
    let itemName = product.name;

    if (raw.variantId) {
      const variant = product.variants.find((v) => v.id === raw.variantId);
      if (variant) {
        itemPrice = product.price + variant.priceDelta;
        itemName = `${product.name} (${variant.name})`;
        if (variant.sku) itemSku = variant.sku;
      }
    }

    const qty = Math.max(1, Math.min(raw.quantity, 99));
    const itemTotal = itemPrice * qty;
    subtotal += itemTotal;

    verifiedItems.push({
      productId: product.id,
      variantId: raw.variantId || null,
      name: itemName,
      sku: itemSku,
      price: itemPrice,
      quantity: qty,
      total: itemTotal,
      image: product.images[0]?.url || "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80",
    });
  }

  let discount = 0;
  let appliedCouponCode: string | null = null;

  if (couponCode && couponCode.trim()) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.trim().toUpperCase() },
    });

    if (
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) &&
      (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
      (!coupon.minOrderValue || subtotal >= coupon.minOrderValue)
    ) {
      if (coupon.discountType === "PERCENTAGE") {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = Math.min(coupon.discountValue, subtotal);
      }
      appliedCouponCode = coupon.code;
    }
  }

  // Free shipping on orders over ₹999, else ₹99 flat rate
  const shippingFee = subtotal > 999 || subtotal === 0 ? 0 : 99;
  // 5% GST calculation included or added
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.05 * 100) / 100; // 5% GST
  const total = Math.max(0, taxableAmount + shippingFee + tax);

  return {
    items: verifiedItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shippingFee: Math.round(shippingFee * 100) / 100,
    total: Math.round(total * 100) / 100,
    couponCode: appliedCouponCode,
  };
}
