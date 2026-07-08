"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import {
  useNotificationSettings,
  AVAILABLE_SOUNDS,
  EVENT_LABELS,
  getSoundFile,
  type NotificationEvent,
  type SoundId,
} from "@/store/notificationSettings";
import { cn } from "@/lib/utils";

const EVENT_ORDER: NotificationEvent[] = [
  "newOrder",
  "orderAccepted",
  "orderPreparing",
  "orderReady",
  "orderDelivered",
  "orderCancelled",
  "lowStock",
  "outOfStock",
];

function SoundPreviewButton({ sound }: { sound: SoundId }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  function play() {
    if (!audioRef.current) audioRef.current = new Audio(getSoundFile(sound));
    audioRef.current.src = getSoundFile(sound);
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
    setPlaying(true);
    audioRef.current.onended = () => setPlaying(false);
  }

  return (
    <button
      onClick={play}
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center border transition-colors shrink-0",
        playing
          ? "bg-brand-orange border-brand-orange text-white"
          : "border-brand-warm-gray text-brand-brown-mid hover:border-brand-orange hover:text-brand-orange"
      )}
      aria-label="Preview sound"
    >
      <Play className="w-3.5 h-3.5" fill="currentColor" />
    </button>
  );
}

function EventRow({ event }: { event: NotificationEvent }) {
  const setting = useNotificationSettings((s) => s.settings[event]);
  const setEventEnabled = useNotificationSettings((s) => s.setEventEnabled);
  const setEventSoundEnabled = useNotificationSettings((s) => s.setEventSoundEnabled);
  const setEventSound = useNotificationSettings((s) => s.setEventSound);

  return (
    <div className="bg-white rounded-2xl border border-brand-warm-gray p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-serif font-bold text-brand-brown text-sm">{EVENT_LABELS[event]}</p>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={setting.enabled}
            onChange={(e) => setEventEnabled(event, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5.5 bg-brand-warm-gray rounded-full peer peer-checked:bg-brand-orange transition-colors" />
          <div className="absolute left-0.5 top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4.5" />
        </label>
      </div>

      {setting.enabled && (
        <div className="flex items-center gap-2 pt-2 border-t border-brand-warm-gray/60">
          <button
            onClick={() => setEventSoundEnabled(event, !setting.soundEnabled)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-sans font-semibold px-2.5 py-1.5 rounded-lg border transition-colors shrink-0",
              setting.soundEnabled
                ? "border-brand-green-herb text-brand-green-herb bg-brand-green-herb/10"
                : "border-brand-warm-gray text-brand-brown-mid"
            )}
          >
            {setting.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            Sound
          </button>

          {setting.soundEnabled && (
            <>
              <select
                value={setting.sound}
                onChange={(e) => setEventSound(event, e.target.value as SoundId)}
                className="flex-1 font-sans text-xs bg-brand-warm-gray/40 border border-brand-warm-gray rounded-lg px-2.5 py-1.5 outline-none focus:border-brand-orange transition-colors cursor-pointer"
              >
                {AVAILABLE_SOUNDS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <SoundPreviewButton sound={setting.sound} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  const resetToDefaults = useNotificationSettings((s) => s.resetToDefaults);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold text-brand-brown">Notification Settings</h1>
          <p className="font-sans text-sm text-brand-brown-mid mt-1">
            Choose which events notify you and which sound plays for each. Saved to this browser.
          </p>
        </div>
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-1.5 text-xs font-sans font-semibold text-brand-brown-mid border border-brand-warm-gray rounded-full px-3 py-2 hover:border-brand-orange hover:text-brand-orange transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to defaults
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {EVENT_ORDER.map((event) => (
          <EventRow key={event} event={event} />
        ))}
      </motion.div>
    </div>
  );
}
