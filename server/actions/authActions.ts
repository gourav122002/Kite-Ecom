"use server";

import { hashPassword, setAuthCookie, clearAuthCookie, verifyPassword, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/validations";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: FormData) {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };
    const parsed = loginSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password" };
    }

    await setAuthCookie({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    revalidatePath("/", "layout");
    return {
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to login" };
  }
}

export async function registerAction(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      phone: formData.get("phone") || undefined,
    };
    const parsed = registerSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (existing) {
      return { success: false, error: "An account with this email already exists" };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        phone: parsed.data.phone,
        role: "CUSTOMER",
      },
    });

    await setAuthCookie({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    revalidatePath("/", "layout");
    return {
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to register" };
  }
}

export async function logoutAction() {
  await clearAuthCookie();
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getSessionUser() {
  return await getCurrentUser();
}
