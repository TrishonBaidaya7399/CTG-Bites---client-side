import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, OrderStatus } from "@/types/order";

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

  // Order actions — all backed by real API calls via Next.js proxy routes
  placeOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
  upsertOrder: (order: Order) => void;
  patchOrder: (id: string, patch: Partial<Order>) => void;
  fetchOrders: () => Promise<void>;
  acceptOrder: (id: string, estimatedMinutes: number) => Promise<void>;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;

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
      orders: [],
      activeTableOrder: null,
      timerModalOpen: false,
      timerModalMinimized: false,
      isAdminAuthenticated: false,
      adminUser: null,
      adminAccessToken: null,

      placeOrder(order) {
        set((s) => ({ orders: [order, ...s.orders] }));
      },

      setOrders(orders) {
        set({ orders });
      },

      // Insert or replace an order matched by human order number (Order.id)
      upsertOrder(order) {
        set((s) => {
          const exists = s.orders.some((o) => o.id === order.id);
          return {
            orders: exists
              ? s.orders.map((o) => (o.id === order.id ? { ...o, ...order } : o))
              : [order, ...s.orders],
            activeTableOrder:
              s.activeTableOrder?.id === order.id ? { ...s.activeTableOrder, ...order } : s.activeTableOrder,
          };
        });
      },

      patchOrder(id, patch) {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
          activeTableOrder:
            s.activeTableOrder?.id === id ? { ...s.activeTableOrder, ...patch } : s.activeTableOrder,
        }));
      },

      async fetchOrders() {
        const token = get().adminAccessToken;
        if (!token) return;
        try {
          const res = await fetch("/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          const data = await res.json();
          if (res.ok && data.success) {
            set({ orders: data.orders ?? [] });
          }
        } catch {
          // network error — leave existing orders in place
        }
      },

      async acceptOrder(id, estimatedMinutes) {
        const token = get().adminAccessToken;
        // Optimistic update
        const acceptedAt = new Date().toISOString();
        get().patchOrder(id, { status: "accepted", estimatedMinutes, acceptedAt });

        if (!token) return;
        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(id)}/accept`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ estimatedMinutes }),
          });
          const data = await res.json();
          if (res.ok && data.success && data.order) {
            get().upsertOrder(data.order);
          }
        } catch {
          // keep optimistic state; socket event will reconcile if it arrives
        }
      },

      async updateStatus(id, status) {
        const token = get().adminAccessToken;
        get().patchOrder(id, { status });

        if (!token) return;
        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(id)}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status }),
          });
          const data = await res.json();
          if (res.ok && data.success && data.order) {
            get().upsertOrder(data.order);
          }
        } catch {
          // keep optimistic state
        }
      },

      async cancelOrder(id) {
        const token = get().adminAccessToken;
        get().patchOrder(id, { status: "cancelled" });

        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(id)}/cancel`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({}),
          });
          const data = await res.json();
          if (res.ok && data.success && data.order) {
            get().upsertOrder(data.order);
          }
        } catch {
          // keep optimistic state
        }
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
        try {
          const res = await fetch("/api/admin/login", {
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
