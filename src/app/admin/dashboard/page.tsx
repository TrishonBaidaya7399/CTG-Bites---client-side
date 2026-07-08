"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Clock, CheckCircle2, X, Bike, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/store/orderStore";
import { useSocket } from "@/hooks/useSocket";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { CountdownTimer } from "@/components/order/CountdownTimer";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/order";

function timeSince(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const QUICK_MINS = [5, 10, 15, 20, 30];

function AcceptModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const { acceptOrder } = useOrderStore();
  const [mins, setMins] = useState(10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <p className="font-serif font-bold text-brand-brown">Accept Order</p>
          <button onClick={onClose} className="text-brand-brown-mid hover:text-brand-brown transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="font-sans text-sm text-brand-brown-mid">
          Order <strong className="text-brand-brown">{order.id}</strong>
          {order.tableNumber && (
            <span className="ml-1 bg-brand-brown text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {order.tableNumber}
            </span>
          )}
          {" · "}
          <span className="font-medium text-brand-brown">{order.customerName}</span>
        </p>

        <div>
          <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-2">
            Estimated time (minutes)
          </label>
          {/* Quick picks */}
          <div className="grid grid-cols-5 gap-1.5 mb-3">
            {QUICK_MINS.map((m) => (
              <button
                key={m}
                onClick={() => setMins(m)}
                className={cn(
                  "py-2 rounded-xl font-sans font-bold text-sm border-2 transition-colors",
                  mins === m
                    ? "border-brand-orange bg-brand-orange text-white"
                    : "border-brand-warm-gray text-brand-brown-mid hover:border-brand-orange/50"
                )}
              >
                {m}
              </button>
            ))}
          </div>
          {/* Custom input */}
          <input
            type="number"
            min={1}
            max={120}
            value={mins}
            onChange={(e) => setMins(Math.max(1, Number(e.target.value)))}
            className="w-full font-sans text-xl font-bold text-center bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-3 outline-none focus:border-brand-orange transition-colors"
          />
          <p className="font-sans text-xs text-brand-brown-mid text-center mt-1.5 opacity-70">
            Default: 10 min — customer's tracker starts as soon as you confirm
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1 rounded-full text-sm">
            Cancel
          </Button>
          <Button
            onClick={() => { acceptOrder(order.id, mins); onClose(); }}
            className="flex-1 bg-brand-orange hover:bg-brand-orange-light text-white rounded-full text-sm"
          >
            Accept · {mins} min
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function calcRemaining(acceptedAt: string, estimatedMinutes: number) {
  const elapsed = Math.floor((Date.now() - new Date(acceptedAt).getTime()) / 1000);
  return Math.max(0, estimatedMinutes * 60 - elapsed);
}

function OrderCard({ order }: { order: Order }) {
  const { updateStatus, cancelOrder, orders } = useOrderStore();
  const [acceptOpen, setAcceptOpen] = useState(false);

  // Always read the latest version of this order from the store so estimatedMinutes stays current
  const liveOrder = orders.find((o) => o.id === order.id) ?? order;

  const [remainingSecs, setRemainingSecs] = useState(() =>
    liveOrder.acceptedAt ? calcRemaining(liveOrder.acceptedAt, liveOrder.estimatedMinutes) : liveOrder.estimatedMinutes * 60
  );

  useEffect(() => {
    if (!liveOrder.acceptedAt) return;
    setRemainingSecs(calcRemaining(liveOrder.acceptedAt, liveOrder.estimatedMinutes));
    const id = setInterval(() => {
      setRemainingSecs(calcRemaining(liveOrder.acceptedAt!, liveOrder.estimatedMinutes));
    }, 1000);
    return () => clearInterval(id);
  }, [liveOrder.acceptedAt, liveOrder.estimatedMinutes]);

  return (
    <>
      {acceptOpen && <AcceptModal order={liveOrder} onClose={() => setAcceptOpen(false)} />}
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: 40 }}
        className="bg-white rounded-2xl shadow-sm p-4 space-y-3 border border-brand-warm-gray"
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-sans font-bold text-brand-brown text-sm">{liveOrder.id}</span>
              {liveOrder.tableNumber && (
                <span className="bg-brand-brown text-white text-xs font-bold px-2 py-0.5 rounded-full">{liveOrder.tableNumber}</span>
              )}
              <span className="font-sans text-xs text-brand-brown-mid">{timeSince(liveOrder.createdAt)}</span>
            </div>
            <p className="font-sans text-xs text-brand-brown-mid mt-0.5">{liveOrder.customerName}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(liveOrder.status === "accepted" || liveOrder.status === "preparing") && (
              <CountdownTimer totalSeconds={liveOrder.estimatedMinutes * 60} remainingSeconds={remainingSecs} size={52} />
            )}
            <OrderStatusBadge status={liveOrder.status} />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-1.5">
          {liveOrder.items.map((item) => (
            <div key={item.menuItemId} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden bg-brand-warm-gray shrink-0">
                <Image src={item.image} alt={item.name} width={28} height={28} className="w-full h-full object-cover" />
              </div>
              <span className="font-sans text-xs text-brand-brown flex-1 truncate">{item.name} ×{item.quantity}</span>
              <span className="font-sans text-xs font-semibold text-brand-orange shrink-0">৳{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {liveOrder.note && (
          <p className="font-sans text-xs text-brand-brown-mid italic bg-brand-warm-gray/50 rounded-xl px-3 py-2">
            📝 {liveOrder.note}
          </p>
        )}

        {/* Total */}
        <div className="flex justify-between font-serif font-bold text-brand-brown border-t border-brand-warm-gray pt-2">
          <span>Total</span>
          <span className="text-brand-orange">৳{liveOrder.total}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {liveOrder.status === "pending" && (
            <>
              <Button onClick={() => setAcceptOpen(true)} size="sm"
                className="flex-1 bg-brand-orange hover:bg-brand-orange-light text-white rounded-xl text-xs">
                Accept
              </Button>
              <Button onClick={() => cancelOrder(liveOrder.id)} size="sm" variant="outline"
                className="flex-1 border-red-300 text-red-500 hover:bg-red-50 rounded-xl text-xs">
                Cancel
              </Button>
            </>
          )}
          {liveOrder.status === "accepted" && (
            <Button onClick={() => updateStatus(liveOrder.id, "preparing")} size="sm"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs">
              Start Preparing
            </Button>
          )}
          {liveOrder.status === "preparing" && (
            <Button onClick={() => updateStatus(liveOrder.id, "ready")} size="sm"
              className="flex-1 bg-brand-green-herb hover:bg-brand-green-herb/90 text-white rounded-xl text-xs">
              Mark Ready
            </Button>
          )}
          {liveOrder.status === "ready" && (
            <Button onClick={() => updateStatus(liveOrder.id, "delivered")} size="sm"
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs">
              Mark Delivered
            </Button>
          )}
        </div>
      </motion.div>
    </>
  );
}

interface DashboardReport {
  ordersToday: number;
  pending: number;
  revenueToday: number;
  activeTables: number;
}

export default function AdminDashboard() {
  const { orders, adminAccessToken } = useOrderStore();
  const [report, setReport] = useState<DashboardReport | null>(null);
  const socket = useSocket({ accessToken: adminAccessToken });

  // Live counts pushed by the server whenever an order changes — cheaper than re-fetching the report.
  useEffect(() => {
    if (!socket) return;
    function handleCounts(payload: { pendingCount: number; activeTableCount: number; onlineActiveCount: number; tableActiveCount: number }) {
      setReport((prev) => ({
        ordersToday: prev?.ordersToday ?? 0,
        revenueToday: prev?.revenueToday ?? 0,
        pending: payload.pendingCount,
        activeTables: payload.activeTableCount,
      }));
    }
    socket.on("dashboard:counts", handleCounts);
    return () => { socket.off("dashboard:counts", handleCounts); };
  }, [socket]);

  useEffect(() => {
    if (!adminAccessToken) return;
    let cancelled = false;

    async function loadReport() {
      try {
        const res = await fetch("/api/reports/dashboard", {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled && res.ok && data.success) {
          setReport({
            ordersToday: data.ordersToday ?? 0,
            pending: data.pending ?? 0,
            revenueToday: data.revenueToday ?? 0,
            activeTables: data.activeTables ?? 0,
          });
        }
      } catch {
        // fall back to client-derived stats below
      }
    }
    loadReport();
    return () => { cancelled = true; };
  }, [adminAccessToken, orders]);

  // Client-derived fallback (also used to keep counts live between report refreshes via socket events)
  const today = orders.filter((o) => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  });

  const pending = orders.filter((o) => o.status === "pending");
  const revenueToday = today.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0);
  const activeTables = new Set(orders.filter((o) => o.mode === "table" && ["pending","accepted","preparing"].includes(o.status)).map((o) => o.tableNumber)).size;

  const onlineActive = orders.filter((o) => o.mode === "online" && !["delivered","cancelled"].includes(o.status));
  const tableActive = orders.filter((o) => o.mode === "table" && !["delivered","cancelled"].includes(o.status));

  const stats = [
    { label: "Orders Today", value: report?.ordersToday ?? today.length, icon: Clock, color: "text-blue-600" },
    { label: "Pending", value: report?.pending ?? pending.length, icon: Clock, color: "text-brand-orange", pulse: true },
    { label: "Revenue Today", value: `৳${report?.revenueToday ?? revenueToday}`, icon: CheckCircle2, color: "text-brand-green-herb" },
    { label: "Active Tables", value: report?.activeTables ?? activeTables, icon: Tablet, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm p-4 border border-brand-warm-gray">
            <div className="flex items-center justify-between mb-2">
              <p className="font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider">{s.label}</p>
              {s.pulse && s.value > 0 && <span className="w-2 h-2 bg-brand-orange rounded-full animate-ping" />}
            </div>
            <p className={cn("font-serif text-2xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Live order columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Online orders */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bike className="w-4 h-4 text-brand-orange" />
            <h2 className="font-serif font-bold text-brand-brown">Online Delivery</h2>
            {onlineActive.length > 0 && (
              <span className="bg-brand-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">{onlineActive.length}</span>
            )}
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {onlineActive.length === 0 ? (
                <p className="font-sans text-sm text-brand-brown-mid text-center py-8">No active online orders</p>
              ) : (
                onlineActive.map((o) => <OrderCard key={o.id} order={o} />)
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Table orders */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tablet className="w-4 h-4 text-purple-600" />
            <h2 className="font-serif font-bold text-brand-brown">Table / Parcel</h2>
            {tableActive.length > 0 && (
              <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{tableActive.length}</span>
            )}
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {tableActive.length === 0 ? (
                <p className="font-sans text-sm text-brand-brown-mid text-center py-8">No active table orders</p>
              ) : (
                tableActive.map((o) => <OrderCard key={o.id} order={o} />)
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
