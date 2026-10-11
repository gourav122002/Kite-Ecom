"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  addToCartAction,
  getCartAction,
  updateCartItemQuantityAction,
} from "@/server/actions/storeActions";

export interface CartItemType {
  productId: string;
  variantId?: string | null;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
}

export interface CartData {
  items: CartItemType[];
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  total: number;
  couponCode?: string | null;
}

interface CartContextType {
  cart: CartData;
  isLoading: boolean;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addItem: (productId: string, variantId?: string | null, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => Promise<void>;
  removeItem: (productId: string, variantId?: string | null) => Promise<void>;
  refreshCart: (couponCode?: string) => Promise<void>;
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_ID_KEY = "ecom_guest_id";

function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "guest_temp";
  let gid = localStorage.getItem(GUEST_ID_KEY);
  if (!gid) {
    gid = "guest_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem(GUEST_ID_KEY, gid);
  }
  return gid;
}

const emptyCart: CartData = {
  items: [],
  subtotal: 0,
  discount: 0,
  tax: 0,
  shippingFee: 0,
  total: 0,
  couponCode: null,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartData>(emptyCart);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  const refreshCart = async (couponCode?: string) => {
    try {
      const guestId = getOrCreateGuestId();
      const res = await getCartAction(guestId, couponCode || cart.couponCode || undefined);
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addItem = async (
    productId: string,
    variantId?: string | null,
    quantity: number = 1
  ) => {
    const guestId = getOrCreateGuestId();
    await addToCartAction({
      productId,
      variantId,
      quantity,
      guestId,
    });
    await refreshCart();
    setIsCartDrawerOpen(true);
  };

  const updateQuantity = async (
    productId: string,
    variantId: string | null | undefined,
    quantity: number
  ) => {
    const guestId = getOrCreateGuestId();
    await updateCartItemQuantityAction({
      productId,
      variantId,
      quantity,
      guestId,
    });
    await refreshCart();
  };

  const removeItem = async (productId: string, variantId?: string | null) => {
    await updateQuantity(productId, variantId, 0);
  };

  const totalItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addItem,
        updateQuantity,
        removeItem,
        refreshCart,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
