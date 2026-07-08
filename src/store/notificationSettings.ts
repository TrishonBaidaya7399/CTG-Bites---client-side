import { create } from "zustand";
import { persist } from "zustand/middleware";

export const AVAILABLE_SOUNDS = [
  { id: "new-order", label: "New Order", file: "/sounds/new-order.mp3" },
  { id: "order-ready", label: "Order Ready", file: "/sounds/order-ready.mp3" },
  { id: "timer-warning", label: "Timer Warning", file: "/sounds/timer-warning.mp3" },
] as const;

export type SoundId = (typeof AVAILABLE_SOUNDS)[number]["id"];

export type NotificationEvent =
  | "newOrder"
  | "orderAccepted"
  | "orderPreparing"
  | "orderReady"
  | "orderDelivered"
  | "orderCancelled"
  | "lowStock"
  | "outOfStock";

interface EventSetting {
  enabled: boolean;
  soundEnabled: boolean;
  sound: SoundId;
}

type EventSettings = Record<NotificationEvent, EventSetting>;

const DEFAULT_SETTINGS: EventSettings = {
  newOrder: { enabled: true, soundEnabled: true, sound: "new-order" },
  orderAccepted: { enabled: true, soundEnabled: false, sound: "new-order" },
  orderPreparing: { enabled: true, soundEnabled: false, sound: "new-order" },
  orderReady: { enabled: true, soundEnabled: true, sound: "order-ready" },
  orderDelivered: { enabled: true, soundEnabled: false, sound: "order-ready" },
  orderCancelled: { enabled: true, soundEnabled: true, sound: "timer-warning" },
  lowStock: { enabled: true, soundEnabled: false, sound: "timer-warning" },
  outOfStock: { enabled: true, soundEnabled: true, sound: "timer-warning" },
};

export const EVENT_LABELS: Record<NotificationEvent, string> = {
  newOrder: "New order placed",
  orderAccepted: "Order accepted",
  orderPreparing: "Order preparing",
  orderReady: "Order ready",
  orderDelivered: "Order delivered",
  orderCancelled: "Order cancelled",
  lowStock: "Low stock warning",
  outOfStock: "Item out of stock",
};

interface NotificationSettingsState {
  settings: EventSettings;
  setEventEnabled: (event: NotificationEvent, enabled: boolean) => void;
  setEventSoundEnabled: (event: NotificationEvent, soundEnabled: boolean) => void;
  setEventSound: (event: NotificationEvent, sound: SoundId) => void;
  resetToDefaults: () => void;
}

export const useNotificationSettings = create<NotificationSettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      setEventEnabled(event, enabled) {
        set((s) => ({ settings: { ...s.settings, [event]: { ...s.settings[event], enabled } } }));
      },

      setEventSoundEnabled(event, soundEnabled) {
        set((s) => ({ settings: { ...s.settings, [event]: { ...s.settings[event], soundEnabled } } }));
      },

      setEventSound(event, sound) {
        set((s) => ({ settings: { ...s.settings, [event]: { ...s.settings[event], sound } } }));
      },

      resetToDefaults() {
        set({ settings: DEFAULT_SETTINGS });
      },
    }),
    { name: "ctg-bites-notification-settings" }
  )
);

export function getSoundFile(id: SoundId): string {
  return AVAILABLE_SOUNDS.find((s) => s.id === id)?.file ?? AVAILABLE_SOUNDS[0].file;
}
