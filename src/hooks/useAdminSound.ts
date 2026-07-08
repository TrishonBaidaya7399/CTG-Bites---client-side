"use client";
import { useEffect, useRef } from "react";
import { useOrderStore } from "@/store/orderStore";
import { useNotificationSettings, getSoundFile } from "@/store/notificationSettings";

export function useAdminSound() {
  const orders = useOrderStore((s) => s.orders);
  const settings = useNotificationSettings((s) => s.settings);

  const newOrderAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerWarnAudioRef = useRef<HTMLAudioElement | null>(null);

  const ringingOrdersRef = useRef<Set<string>>(new Set());
  const warnedOrdersRef = useRef<Set<string>>(new Set());
  const newOrderLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    newOrderAudioRef.current = new Audio();
    timerWarnAudioRef.current = new Audio();
    newOrderAudioRef.current.preload = "auto";
    timerWarnAudioRef.current.preload = "auto";
  }, []);

  // New-order ring — loops while any order is pending, respects the newOrder event setting
  useEffect(() => {
    const newOrderSetting = settingsRef.current.newOrder;
    const pendingOrders = orders.filter((o) => o.status === "pending");
    const newPending = pendingOrders.filter((o) => !ringingOrdersRef.current.has(o.id));

    if (newPending.length > 0) {
      newPending.forEach((o) => ringingOrdersRef.current.add(o.id));

      if (newOrderSetting.enabled && newOrderSetting.soundEnabled && !newOrderLoopRef.current) {
        const playRing = () => {
          if (!newOrderAudioRef.current) return;
          newOrderAudioRef.current.src = getSoundFile(newOrderSetting.sound);
          newOrderAudioRef.current.currentTime = 0;
          newOrderAudioRef.current.play().catch(() => {});
        };
        playRing();
        newOrderLoopRef.current = setInterval(playRing, 3000);
      }
    }

    const stillPending = orders.some((o) => o.status === "pending");
    if (!stillPending && newOrderLoopRef.current) {
      clearInterval(newOrderLoopRef.current);
      newOrderLoopRef.current = null;
    }
  }, [orders]);

  // 1-minute warning tone — polls every 5s, respects the timer-warning-adjacent event settings
  useEffect(() => {
    const ONE_MIN = 60;

    function checkWarning() {
      const currentOrders = useOrderStore.getState().orders;
      const setting = settingsRef.current.orderReady;

      const toWarn = currentOrders.filter(
        (o) =>
          (o.status === "accepted" || o.status === "preparing") &&
          o.acceptedAt &&
          !warnedOrdersRef.current.has(o.id) &&
          (() => {
            const elapsed = Math.floor((Date.now() - new Date(o.acceptedAt!).getTime()) / 1000);
            const rem = o.estimatedMinutes * 60 - elapsed;
            return rem <= ONE_MIN && rem > 0;
          })()
      );

      if (toWarn.length > 0) {
        toWarn.forEach((o) => warnedOrdersRef.current.add(o.id));
        if (setting.enabled && setting.soundEnabled && timerWarnAudioRef.current) {
          timerWarnAudioRef.current.src = getSoundFile(setting.sound);
          timerWarnAudioRef.current.loop = true;
          timerWarnAudioRef.current.currentTime = 0;
          timerWarnAudioRef.current.play().catch(() => {});
        }
      }

      const anyInWarning = currentOrders.some((o) => {
        if (!o.acceptedAt) return false;
        if (o.status !== "accepted" && o.status !== "preparing") return false;
        const elapsed = Math.floor((Date.now() - new Date(o.acceptedAt).getTime()) / 1000);
        const remaining = o.estimatedMinutes * 60 - elapsed;
        return remaining <= ONE_MIN && remaining > 0;
      });

      if (!anyInWarning && timerWarnAudioRef.current && !timerWarnAudioRef.current.paused) {
        timerWarnAudioRef.current.pause();
        timerWarnAudioRef.current.currentTime = 0;
      }
    }

    checkWarning();
    const id = setInterval(checkWarning, 5000);
    return () => clearInterval(id);
  }, [orders]);

  useEffect(() => {
    return () => {
      if (newOrderLoopRef.current) clearInterval(newOrderLoopRef.current);
      newOrderAudioRef.current?.pause();
      timerWarnAudioRef.current?.pause();
    };
  }, []);
}
