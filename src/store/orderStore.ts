import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, OrderStatus } from "@/types/order";
import { mockOrders } from "@/lib/mock-orders";

interface OrderState {
  orders: Order[];
  activeTableOrder: Order | null;
  timerModalOpen: boolean;
  timerModalMinimized: boolean;
  isAdminAuthenticated: boolean;

  // Order actions
  placeOrder: (order: Order) => void;
  acceptOrder: (id: string, estimatedMinutes: number) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
  cancelOrder: (id: string) => void;

  // Timer modal
  setActiveTableOrder: (order: Order | null) => void;
  openTimerModal: () => void;
  closeTimerModal: () => void;
  minimizeTimerModal: () => void;
  maximizeTimerModal: () => void;

  // Admin auth
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: mockOrders,
      activeTableOrder: null,
      timerModalOpen: false,
      timerModalMinimized: false,
      isAdminAuthenticated: false,

      placeOrder(order) {
        set((s) => ({ orders: [order, ...s.orders] }));
      },

      acceptOrder(id, estimatedMinutes) {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? { ...o, status: "accepted", estimatedMinutes, acceptedAt: new Date().toISOString() }
              : o
          ),
          activeTableOrder:
            s.activeTableOrder?.id === id
              ? { ...s.activeTableOrder, status: "accepted", estimatedMinutes, acceptedAt: new Date().toISOString() }
              : s.activeTableOrder,
        }));
      },

      updateStatus(id, status) {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
          activeTableOrder:
            s.activeTableOrder?.id === id
              ? { ...s.activeTableOrder, status }
              : s.activeTableOrder,
        }));
      },

      cancelOrder(id) {
        get().updateStatus(id, "cancelled");
      },

      setActiveTableOrder(order) {
        set({ activeTableOrder: order });
      },

      openTimerModal() {
        set({ timerModalOpen: true, timerModalMinimized: false });
      },

      closeTimerModal() {
        set({ timerModalOpen: false });
      },

      minimizeTimerModal() {
        set({ timerModalMinimized: true });
      },

      maximizeTimerModal() {
        set({ timerModalMinimized: false, timerModalOpen: true });
      },

      adminLogin(email, password) {
        // Imported inline to avoid circular dep — validated here
        if (email === "admin@ctgbites.com" && password === "ctgbites2026") {
          set({ isAdminAuthenticated: true });
          return true;
        }
        return false;
      },

      adminLogout() {
        set({ isAdminAuthenticated: false });
      },
    }),
    {
      name: "ctg-bites-orders",
      // Don't persist mock orders on first load if localStorage already has data
      partialize: (s) => ({
        orders: s.orders,
        activeTableOrder: s.activeTableOrder,
        timerModalOpen: s.timerModalOpen,
        timerModalMinimized: s.timerModalMinimized,
        isAdminAuthenticated: s.isAdminAuthenticated,
      }),
    }
  )
);
