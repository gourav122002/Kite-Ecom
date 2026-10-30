import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export const addressSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid 10-digit mobile number is required"),
  street: z.string().min(5, "Complete street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(4, "PIN code is required"),
  country: z.string().default("India"),
});

export const checkoutSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal(""))
    .nullable(),
  phone: z.string().min(10, "Valid 10-digit mobile number is required"),
  shippingAddress: addressSchema,
  couponCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  paymentMethod: z.enum(["COD", "RAZORPAY"]).default("COD"),
  guestId: z.string().optional().nullable(),
  idempotencyKey: z.string().optional().nullable(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required"),
  sku: z.string().min(2, "SKU is required"),
  description: z.string().min(10, "Description is required"),
  shortDescription: z.string().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  compareAtPrice: z.coerce.number().optional().nullable(),
  costPrice: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  categoryId: z.string().min(1, "Category is required"),
  brand: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  images: z
    .array(
      z.object({
        url: z.string().url("Valid image URL required"),
        altText: z.string().optional(),
        sortOrder: z.number().default(0),
      })
    )
    .optional(),
  variants: z
    .array(
      z.object({
        name: z.string().min(1),
        sku: z.string().optional(),
        priceDelta: z.number().default(0),
        stock: z.number().default(10),
      })
    )
    .optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  featured: z.boolean().default(false),
});

export const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.coerce.number().positive("Discount value must be positive"),
  minOrderValue: z.coerce.number().nonnegative().optional().nullable(),
  maxDiscount: z.coerce.number().positive().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  expiresAt: z.string().optional().nullable(),
});

export const blogPostSchema = z.object({
  title: z.string().min(3, "Title is required"),
  slug: z.string().min(3, "Slug is required"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  excerpt: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  author: z.string().default("Store Editorial"),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  published: z.boolean().default(true),
});

export const orderStatusUpdateSchema = z.object({
  orderId: z.string(),
  orderStatus: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURN_REQUESTED",
    "RETURNED",
    "REFUNDED",
  ]),
  paymentStatus: z.enum([
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
    "PARTIALLY_REFUNDED",
  ]).optional(),
  trackingNumber: z.string().optional(),
});
