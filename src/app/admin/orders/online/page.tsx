"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const FILTERS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All",       value: "all" },
  { label: "Pending",   value: "pending" },
  { label: "Accepted",  value: "accepted" },
  { label: "Preparing", value: "preparing" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

function timeSince(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function OnlineOrdersPage() {
  const { orders, ordersLoading, ordersError, updateStatus, cancelOrder, acceptOrder } = useOrderStore();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acceptId, setAcceptId] = useState<string | null>(null);
  const [mins, setMins] = useState(10);

  const filtered = orders.filter((o) => o.mode === "online" && (filter === "all" || o.status === filter));

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              "px-4 py-2 rounded-full font-sans text-sm font-semibold whitespace-nowrap transition-colors shrink-0",
              filter === value ? "bg-brand-orange text-white" : "bg-white border border-brand-warm-gray text-brand-brown-mid hover:border-brand-orange/50"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Accept modal */}
      <AnimatePresence>
        {acceptId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs space-y-4">
              <p className="font-serif font-bold text-brand-brown">Accept Order — Set Time</p>
              <p className="font-sans text-xs text-brand-brown-mid">
                {`Customer's tracker starts the moment you confirm. Default is 10 min.`}
              </p>
              {/* Quick picks */}
              <div className="grid grid-cols-5 gap-1.5">
                {[5, 10, 15, 20, 30].map((m) => (
                  <button key={m} onClick={() => setMins(m)}
                    className={cn("py-2 rounded-xl font-sans font-bold text-sm border-2 transition-colors",
                      mins === m ? "border-brand-orange bg-brand-orange text-white" : "border-brand-warm-gray text-brand-brown-mid hover:border-brand-orange/50")}>
                    {m}
                  </button>
                ))}
              </div>
              <input type="number" min={1} max={120} value={mins}
                onChange={(e) => setMins(Math.max(1, Number(e.target.value)))}
                className="w-full font-sans text-xl font-bold text-center bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-3 outline-none focus:border-brand-orange transition-colors" />
              <div className="flex gap-2">
                <Button onClick={() => setAcceptId(null)} variant="outline" className="flex-1 rounded-full text-sm">Cancel</Button>
                <Button onClick={() => { acceptOrder(acceptId, mins); setAcceptId(null); }}
                  className="flex-1 bg-brand-orange text-white rounded-full text-sm">Accept · {mins} min</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {ordersError && (
        <p className="text-sm text-red-500 font-sans bg-red-50 border border-red-200 rounded-xl px-4 py-2">{ordersError}</p>
      )}

      {/* Order rows */}
      <div className="space-y-2">
        {ordersLoading && orders.length === 0 && (
          <p className="font-sans text-sm text-brand-brown-mid text-center py-12">Loading orders…</p>
        )}
        {!ordersLoading && filtered.length === 0 && (
          <p className="font-sans text-sm text-brand-brown-mid text-center py-12">No orders found.</p>
        )}
        {filtered.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-brand-warm-gray shadow-sm overflow-hidden">
            {/* Row */}
            <button
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              className="w-full flex items-center gap-4 p-4 text-left"
            >
              <span className="font-sans font-bold text-brand-brown text-sm shrink-0">{order.id}</span>
              <span className="font-sans text-xs text-brand-brown-mid shrink-0">{timeSince(order.createdAt)}</span>
              <span className="font-sans text-sm text-brand-brown truncate flex-1">{order.customerName}</span>
              <span className="font-sans font-bold text-brand-orange text-sm shrink-0">৳{order.total}</span>
              <OrderStatusBadge status={order.status} />
              {expanded === order.id ? <ChevronUp className="w-4 h-4 text-brand-brown-mid shrink-0" /> : <ChevronDown className="w-4 h-4 text-brand-brown-mid shrink-0" />}
            </button>

            {/* Expanded detail */}
            <AnimatePresence>
              {expanded === order.id && (
                <motion.div
                  initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                  className="overflow-hidden border-t border-brand-warm-gray"
                >
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm font-sans">
                      <div><span className="text-brand-brown-mid">Phone:</span> <span className="text-brand-brown font-medium">{order.customerPhone ?? "—"}</span></div>
                      <div><span className="text-brand-brown-mid">Address:</span> <span className="text-brand-brown font-medium">{order.customerAddress ?? "—"}</span></div>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.menuItemId} className="space-y-1">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-brand-warm-gray shrink-0">
                              <Image src={item.image} alt={item.name} width={32} height={32} className="w-full h-full object-cover" />
                            </div>
                            <span className="flex-1 font-sans text-sm text-brand-brown">{item.name} ×{item.quantity}</span>
                            <span className="font-sans text-sm font-bold text-brand-orange">৳{item.price * item.quantity}</span>
                          </div>
                          {item.appetizers && item.appetizers.length > 0 && (
                            <div className="pl-11 space-y-0.5">
                              {item.appetizers.map((a) => (
                                <div key={a.appetizerId || a.name} className="flex items-center gap-3">
                                  <span className="flex-1 font-sans text-xs text-brand-brown-mid">+ {a.name} ×{a.quantity}</span>
                                  <span className="font-sans text-xs text-brand-brown-mid">৳{a.price * a.quantity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {order.note && <p className="font-sans text-xs text-brand-brown-mid italic">📝 {order.note}</p>}
                    <div className="flex gap-2 flex-wrap">
                      {order.status === "pending" && (
                        <>
                          <Button onClick={() => { setAcceptId(order.id); setMins(10); }} size="sm" className="bg-brand-orange text-white rounded-xl text-xs">Accept</Button>
                          <Button onClick={() => cancelOrder(order.id)} size="sm" variant="outline" className="border-red-300 text-red-500 rounded-xl text-xs">Cancel</Button>
                        </>
                      )}
                      {order.status === "accepted" && <Button onClick={() => updateStatus(order.id, "preparing")} size="sm" className="bg-blue-500 text-white rounded-xl text-xs">Start Preparing</Button>}
                      {order.status === "preparing" && <Button onClick={() => updateStatus(order.id, "ready")} size="sm" className="bg-brand-green-herb text-white rounded-xl text-xs">Mark Ready</Button>}
                      {order.status === "ready" && <Button onClick={() => updateStatus(order.id, "delivered")} size="sm" className="bg-teal-500 text-white rounded-xl text-xs">Mark Delivered</Button>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
