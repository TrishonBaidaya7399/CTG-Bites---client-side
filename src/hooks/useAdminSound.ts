"use client";
import { useEffect, useRef } from "react";
import { useOrderStore } from "@/store/orderStore";

export function useAdminSound() {
  const orders = useOrderStore((s) => s.orders);

  // Refs to the two Audio instances — created once, reused
  const newOrderAudioRef  = useRef<HTMLAudioElement | null>(null);
  const timerWarnAudioRef = useRef<HTMLAudioElement | null>(null);

  // Track which order IDs we've already started ringing for, to avoid re-triggering
  const ringingOrdersRef   = useRef<Set<string>>(new Set());
  const warnedOrdersRef    = useRef<Set<string>>(new Set());

  // Whether the new-order ring is currently looping
  const newOrderLoopRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    newOrderAudioRef.current  = new Audio("/sounds/new-order.wav");
    timerWarnAudioRef.current = new Audio("/sounds/timer-warning.wav");
    newOrderAudioRef.current.preload  = "auto";
    timerWarnAudioRef.current.preload = "auto";
  }, []);

  // ── New-order ring ────────────────────────────────────────────────────────
  // Ring while any order is pending. Stop when all pending orders are accepted/cancelled.
  useEffect(() => {
    const pendingOrders = orders.filter((o) => o.status === "pending");
    const newPending    = pendingOrders.filter((o) => !ringingOrdersRef.current.has(o.id));

    if (newPending.length > 0) {
      newPending.forEach((o) => ringingOrdersRef.current.add(o.id));

      // Start looping ring if not already going
      if (!newOrderLoopRef.current) {
        const playRing = () => {
          if (!newOrderAudioRef.current) return;
          newOrderAudioRef.current.currentTime = 0;
          newOrderAudioRef.current.play().catch(() => {});
        };
        playRing();
        // Repeat every 3 s — user will replace the placeholder with a real short tone
        newOrderLoopRef.current = setInterval(playRing, 3000);
      }
    }

    // Stop ringing when no pending orders remain
    const stillPending = orders.some((o) => o.status === "pending");
    if (!stillPending && newOrderLoopRef.current) {
      clearInterval(newOrderLoopRef.current);
      newOrderLoopRef.current = null;
    }

    return () => {};
  }, [orders]);

  // ── 1-minute warning tone ─────────────────────────────────────────────────
  // Polls every 5 s. Starts looping when any active order enters the last minute.
  // Stops automatically when no orders are in the warning zone any more.
  useEffect(() => {
    const ONE_MIN = 60;

    function checkWarning() {
      const currentOrders = useOrderStore.getState().orders;

      // Trigger for newly-entered orders
      const toWarn = currentOrders.filter(
        (o) =>
          (o.status === "accepted" || o.status === "preparing") &&
          o.acceptedAt &&
          !warnedOrdersRef.current.has(o.id) &&
          (() => {
            const elapsed = Math.floor((Date.now() - new Date(o.acceptedAt!).getTime()) / 1000);
            const rem     = o.estimatedMinutes * 60 - elapsed;
            return rem <= ONE_MIN && rem > 0;
          })()
      );

      if (toWarn.length > 0) {
        toWarn.forEach((o) => warnedOrdersRef.current.add(o.id));
        if (timerWarnAudioRef.current) {
          timerWarnAudioRef.current.loop = true;
          timerWarnAudioRef.current.currentTime = 0;
          timerWarnAudioRef.current.play().catch(() => {});
        }
      }

      // Stop if nothing is in warning zone
      const anyInWarning = currentOrders.some((o) => {
        if (!o.acceptedAt) return false;
        if (o.status !== "accepted" && o.status !== "preparing") return false;
        const elapsed   = Math.floor((Date.now() - new Date(o.acceptedAt).getTime()) / 1000);
        const remaining = o.estimatedMinutes * 60 - elapsed;
        return remaining <= ONE_MIN && remaining > 0;
      });

      if (!anyInWarning && timerWarnAudioRef.current && !timerWarnAudioRef.current.paused) {
        timerWarnAudioRef.current.pause();
        timerWarnAudioRef.current.currentTime = 0;
      }
    }

    checkWarning(); // run immediately on mount / orders change
    const id = setInterval(checkWarning, 5000);
    return () => clearInterval(id);
  }, [orders]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (newOrderLoopRef.current) clearInterval(newOrderLoopRef.current);
      newOrderAudioRef.current?.pause();
      timerWarnAudioRef.current?.pause();
    };
  }, []);
}
