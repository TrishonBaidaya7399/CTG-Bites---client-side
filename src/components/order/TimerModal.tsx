"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Minus } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { CountdownTimer } from "./CountdownTimer";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { ReviewModal } from "./ReviewModal";

const LINGER_AFTER_TIMEOUT_SECS = 5 * 60;

// Status labels shown to the client in plain language
const STATUS_MESSAGES: Record<string, { emoji: string; text: string; sub: string }> = {
  pending:   { emoji: "⏳", text: "Waiting for kitchen…",    sub: "Your order is being reviewed." },
  accepted:  { emoji: "✅", text: "Order accepted!",          sub: "Kitchen is preparing your food." },
  preparing: { emoji: "👨‍🍳", text: "Being prepared…",         sub: "Your food is on the stove!" },
  ready:     { emoji: "🎉", text: "Your food is ready!",      sub: "Please collect from the counter." },
  delivered: { emoji: "🛵", text: "Delivered!",               sub: "Enjoy your meal!" },
  cancelled: { emoji: "❌", text: "Order cancelled",          sub: "Contact staff if this is a mistake." },
};

export function TimerModal() {
  const {
    activeTableOrder,
    timerModalOpen,
    timerModalMinimized,
    closeTimerModal,
    minimizeTimerModal,
    maximizeTimerModal,
    cancelOrder,
    setActiveTableOrder,
    orders,
  } = useOrderStore();

  // Always read the freshest version of the order from the store
  const liveOrder = activeTableOrder
    ? orders.find((o) => o.id === activeTableOrder.id) ?? activeTableOrder
    : null;

  // ── Countdown ────────────────────────────────────────────────────────────
  const calcRemaining = (acceptedAt: string, estimatedMinutes: number) => {
    const elapsed = Math.floor((Date.now() - new Date(acceptedAt).getTime()) / 1000);
    return Math.max(0, estimatedMinutes * 60 - elapsed);
  };

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    liveOrder?.acceptedAt ? calcRemaining(liveOrder.acceptedAt, liveOrder.estimatedMinutes) : 0
  );
  const lingerRef = useRef(0);

  useEffect(() => {
    if (!liveOrder?.acceptedAt) return;
    setRemainingSeconds(calcRemaining(liveOrder.acceptedAt, liveOrder.estimatedMinutes));
    const id = setInterval(() => {
      const rem = calcRemaining(liveOrder.acceptedAt!, liveOrder.estimatedMinutes);
      setRemainingSeconds(rem);
      if (rem === 0) {
        lingerRef.current += 1;
        if (lingerRef.current >= LINGER_AFTER_TIMEOUT_SECS) {
          closeTimerModal();
          setActiveTableOrder(null);
        }
      } else {
        lingerRef.current = 0;
      }
    }, 1000);
    return () => clearInterval(id);
  }, [liveOrder?.acceptedAt, liveOrder?.estimatedMinutes]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Status transition tracking ────────────────────────────────────────────
  const prevStatusRef = useRef<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const readyAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    readyAudioRef.current = new Audio("/sounds/order-ready.mp3");
    readyAudioRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    const prev = prevStatusRef.current;
    const curr = liveOrder?.status ?? null;

    if (prev !== null && prev !== curr) {
      // Transition into "ready" — play sound + show celebration
      if (curr === "ready") {
        readyAudioRef.current?.play().catch(() => {});
        setShowCelebration(true);
        // Auto-dismiss celebration overlay after 4 s
        setTimeout(() => setShowCelebration(false), 4000);
        // Also make sure modal is visible (not minimized)
        maximizeTimerModal();
      }

      // Auto-vanish on cancel
      if (curr === "cancelled") {
        setTimeout(() => {
          closeTimerModal();
          setActiveTableOrder(null);
        }, 2500);
      }

      // Once delivered, give the customer a moment to see the "Delivered!" state,
      // then swap the tracker for a review prompt instead of just vanishing.
      if (curr === "delivered") {
        setTimeout(() => setShowReview(true), 2200);
      }
    }

    prevStatusRef.current = curr;
  }, [liveOrder?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const [cancelConfirm, setCancelConfirm] = useState(false);

  function dismissReview() {
    setShowReview(false);
    closeTimerModal();
    setActiveTableOrder(null);
  }

  if (showReview && liveOrder) {
    return <ReviewModal order={liveOrder} onClose={dismissReview} />;
  }

  if (!liveOrder || !timerModalOpen) return null;

  const status = liveOrder.status;
  const isAccepted = status === "accepted" || status === "preparing";
  const isReady = status === "ready";
  const isPending = status === "pending";
  const isCancelled = status === "cancelled";
  const totalSeconds = liveOrder.estimatedMinutes * 60;
  const msg = STATUS_MESSAGES[status] ?? STATUS_MESSAGES.pending;

  return (
    <>
      {/* ── Full-screen celebration overlay ── */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            key="celebration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-80 flex flex-col items-center justify-center bg-brand-brown/80 backdrop-blur-sm"
            onClick={() => setShowCelebration(false)}
          >
            {/* Burst rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3 + i * 1.5, opacity: 0 }}
                transition={{ duration: 1.2 + i * 0.3, ease: "easeOut", delay: i * 0.15 }}
                className="absolute w-40 h-40 rounded-full border-4 border-brand-orange"
              />
            ))}

            {/* Central card */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative z-10 bg-white rounded-3xl px-10 py-10 flex flex-col items-center gap-4 shadow-2xl max-w-xs w-full mx-4"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -8, 8, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-6xl"
              >
                🎉
              </motion.div>
              <p className="font-serif text-2xl font-bold text-brand-brown text-center">
                Your food is ready!
              </p>
              <p className="font-sans text-sm text-brand-brown-mid text-center">
                Please collect from the counter.
              </p>
              <p className="font-sans text-xs text-brand-brown-mid opacity-60 mt-2">
                Tap anywhere to dismiss
              </p>
            </motion.div>

            {/* Confetti dots */}
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div
                key={`dot-${i}`}
                initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
                animate={{
                  y: [0, -(120 + Math.random() * 200)],
                  x: [(Math.random() - 0.5) * 300],
                  opacity: [1, 0],
                  scale: [1, 0.3],
                }}
                transition={{ duration: 1.2 + Math.random() * 0.8, ease: "easeOut", delay: Math.random() * 0.4 }}
                className="absolute rounded-full"
                style={{
                  width: 8 + Math.random() * 8,
                  height: 8 + Math.random() * 8,
                  background: ["#E8622A", "#F07B45", "#4A7C59", "#2C1A0E", "#F5F0E8"][i % 5],
                  top: "55%",
                  left: `${20 + Math.random() * 60}%`,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {timerModalMinimized ? (
          // ── Minimized pill ──
          <motion.button
            key="pill"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={maximizeTimerModal}
            className="fixed bottom-24 right-4 z-60 bg-brand-brown text-white rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl"
          >
            <span className="text-base">{msg.emoji}</span>
            {isReady ? (
              <span className="font-sans text-xs font-bold text-green-400">Ready!</span>
            ) : isAccepted ? (
              <span className="font-sans text-xs font-bold tabular-nums">
                {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, "0")}
              </span>
            ) : isCancelled ? (
              <span className="font-sans text-xs font-bold text-red-400">Cancelled</span>
            ) : (
              <span className="font-sans text-xs font-bold text-brand-orange">Wait…</span>
            )}
          </motion.button>
        ) : (
          // ── Full card ──
          <motion.div
            key="card"
            drag
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88 }}
            className="fixed bottom-24 right-4 z-60 w-80 bg-white rounded-3xl shadow-2xl border border-brand-warm-gray overflow-hidden cursor-grab active:cursor-grabbing"
          >
            {/* Header — colour shifts by status */}
            <div className={`flex items-center justify-between px-4 py-3 text-white transition-colors duration-700 ${
              isReady ? "bg-brand-green-herb" : isCancelled ? "bg-red-500" : "bg-brand-brown"
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{msg.emoji}</span>
                <span className="font-serif text-sm font-bold">Your Order</span>
                {liveOrder.tableNumber && (
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {liveOrder.tableNumber}
                  </span>
                )}
              </div>
              <button
                onClick={minimizeTimerModal}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Minimize"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Real-time status message */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <OrderStatusBadge status={liveOrder.status} size="md" />
                    <p className="font-sans text-xs text-brand-brown-mid mt-1">{msg.sub}</p>
                  </div>
                  {isAccepted && (
                    <CountdownTimer
                      totalSeconds={totalSeconds}
                      remainingSeconds={remainingSeconds}
                      size={72}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Food image + items */}
              <div className="flex gap-3 items-start">
                {liveOrder.items[0]?.image && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-brand-warm-gray">
                    <Image
                      src={liveOrder.items[0].image}
                      alt={liveOrder.items[0].name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  {liveOrder.items.map((item) => (
                    <div key={item.menuItemId}>
                      <p className="font-sans text-xs text-brand-brown truncate">
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-brand-brown-mid"> ×{item.quantity}</span>
                      </p>
                      {item.appetizers && item.appetizers.length > 0 && (
                        <p className="font-sans text-xs text-brand-brown-mid truncate pl-2">
                          + {item.appetizers.map((a) => a.name).join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between font-sans text-sm border-t border-brand-warm-gray pt-3">
                <span className="text-brand-brown-mid">Total</span>
                <span className="font-bold text-brand-orange">৳{liveOrder.total}</span>
              </div>

              {/* Cancel — only while pending */}
              {isPending && (
                <AnimatePresence mode="wait">
                  {cancelConfirm ? (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2"
                    >
                      <button
                        onClick={() => setCancelConfirm(false)}
                        className="flex-1 py-2 rounded-xl border border-brand-warm-gray font-sans text-xs font-semibold text-brand-brown-mid hover:border-brand-brown transition-colors"
                      >
                        Keep Order
                      </button>
                      <button
                        onClick={() => { cancelOrder(liveOrder.id); setCancelConfirm(false); }}
                        className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 font-sans text-xs font-semibold text-white transition-colors"
                      >
                        Yes, Cancel
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="ask"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setCancelConfirm(true)}
                      className="w-full py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 font-sans text-xs font-semibold transition-colors"
                    >
                      Cancel Order
                    </motion.button>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
