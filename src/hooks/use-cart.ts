"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  price: number; // w groszach
  quantity: number;
  imageUrl: string;
  variantLabel?: string;
  slug: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItems: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
            isOpen: true,
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "rekodzielo-cart-storage",
    }
  )
);
