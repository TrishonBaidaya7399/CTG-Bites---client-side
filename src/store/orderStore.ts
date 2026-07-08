import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, OrderStatus } from "@/types/order";
import { mockOrders } from "@/lib/mock-orders";

const STAFF_ROLES = ["owner", "manager", "staff", "rider"];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface OrderState {
  orders: Order[];
  activeTableOrder: Order | null;
  timerModalOpen: boolean;
  timerModalMinimized: boolean;
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  adminAccessToken: string | null;

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
  adminLogin: (email: string, password: string) => Promise<boolean>;
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
      adminUser: null,
      adminAccessToken: null,

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

      async adminLogin(email, password) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

        try {
          const res = await fetch(`${apiUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();

          if (!res.ok || !STAFF_ROLES.includes(data.user?.role)) {
            return false;
          }

          set({
            isAdminAuthenticated: true,
            adminUser: data.user,
            adminAccessToken: data.accessToken,
          });
          return true;
        } catch {
          return false;
        }
      },

      adminLogout() {
        set({ isAdminAuthenticated: false, adminUser: null, adminAccessToken: null });
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
        adminUser: s.adminUser,
        adminAccessToken: s.adminAccessToken,
      }),
    }
  )
);
