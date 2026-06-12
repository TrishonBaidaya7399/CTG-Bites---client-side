"use client";
import { useOrderSync } from "@/hooks/useOrderSync";

export function OrderSyncProvider() {
  useOrderSync();
  return null;
}
