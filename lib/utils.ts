import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "INR"
): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  const num = Math.round(amount);
  return `₹${num.toLocaleString("en-IN")}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function generateOrderNumber(): string {
  const prefix = "ORD";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
}

export function truncate(str: string, length: number = 60): string {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
}
