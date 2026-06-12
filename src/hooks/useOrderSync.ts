"use client";
import { useEffect } from "react";
import { useOrderStore } from "@/store/orderStore";

// Simulates real-time: pending orders auto-accept after 30s for demo purposes
export function useOrderSync() {
  const { orders, acceptOrder } = useOrderStore();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      orders.forEach((order) => {
        if (order.status === "pending") {
          const age = now - new Date(order.createdAt).getTime();
          if (age > 30_000) {
            acceptOrder(order.id, 10);
          }
        }
      });
    }, 5_000);

    return () => clearInterval(interval);
  }, [orders, acceptOrder]);
}
