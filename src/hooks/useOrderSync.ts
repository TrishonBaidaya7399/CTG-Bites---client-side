"use client";
import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useOrderStore } from "@/store/orderStore";
import type { Order, OrderStatus } from "@/types/order";

// Real-time order sync via Socket.io. Connects anonymously (no token) for the
// public/customer shell — sufficient to receive broadcasts and events for rooms
// this client joins. Admin pages additionally pass the staff access token so the
// server auto-joins role rooms.
export function useOrderSync(accessToken?: string | null) {
  const socket = useSocket({ accessToken });
  const { patchOrder, upsertOrder, activeTableOrder } = useOrderStore();

  // Stay joined to the tracked order's room for as long as it's active, so status
  // pushes (preparing/ready/delivered) keep arriving even after the page that
  // placed the order unmounts. Re-joins on reconnect and whenever the tracked
  // order changes.
  const trackedOrderId = activeTableOrder?.id ?? null;
  useEffect(() => {
    if (!socket || !trackedOrderId) return;

    const join = () => socket.emit("join:order", { orderNumber: trackedOrderId });
    join();
    socket.on("connect", join);

    return () => {
      socket.off("connect", join);
    };
  }, [socket, trackedOrderId]);

  useEffect(() => {
    if (!socket) return;

    function handleNew(order: Order) {
      upsertOrder(order);
    }

    function handleAccepted(payload: { orderNumber: string; status: OrderStatus; estimatedMinutes: number; acceptedAt: string }) {
      patchOrder(payload.orderNumber, {
        status: payload.status,
        estimatedMinutes: payload.estimatedMinutes,
        acceptedAt: payload.acceptedAt,
      });
    }

    function handleStatusChanged(payload: { orderNumber: string; status: OrderStatus; updatedAt: string }) {
      patchOrder(payload.orderNumber, { status: payload.status });
    }

    function handleCancelled(payload: { orderNumber: string; cancelledBy?: string; reason?: string }) {
      patchOrder(payload.orderNumber, { status: "cancelled" });
    }

    socket.on("order:new", handleNew);
    socket.on("order:accepted", handleAccepted);
    socket.on("order:status-changed", handleStatusChanged);
    socket.on("order:cancelled", handleCancelled);

    return () => {
      socket.off("order:new", handleNew);
      socket.off("order:accepted", handleAccepted);
      socket.off("order:status-changed", handleStatusChanged);
      socket.off("order:cancelled", handleCancelled);
    };
  }, [socket, patchOrder, upsertOrder]);

  return socket;
}
