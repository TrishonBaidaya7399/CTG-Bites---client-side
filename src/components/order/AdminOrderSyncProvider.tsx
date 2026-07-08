"use client";
import { useEffect } from "react";
import { useOrderSync } from "@/hooks/useOrderSync";
import { useOrderStore } from "@/store/orderStore";

// Mounted only inside the authenticated admin shell. Connects the socket with
// the staff access token (server auto-joins role rooms) and does an initial
// REST fetch of existing orders so the dashboard/order pages aren't empty
// before the first real-time event arrives.
export function AdminOrderSyncProvider() {
  const adminAccessToken = useOrderStore((s) => s.adminAccessToken);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);

  useOrderSync(adminAccessToken);

  useEffect(() => {
    if (adminAccessToken) fetchOrders();
  }, [adminAccessToken, fetchOrders]);

  return null;
}
