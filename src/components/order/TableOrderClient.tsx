"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, X, Clock, CheckCircle2, Flame, Leaf, Tag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuCategories, menuItems } from "@/lib/mock-data";
import { useOrderStore } from "@/store/orderStore";
import { COUPONS } from "@/store/cart";
import { cn } from "@/lib/utils";
import type { OrderType } from "@/types/order";

type LocalItem = { id: string; name: string; price: number; image: string; qty: number };

const TABLE_NUMBERS = ["T1","T2","T3","T4","T5","T6","T7","T8"];

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-sans text-sm font-semibold text-brand-brown-mid tabular-nums">{time}</span>;
}

export function TableOrderClient() {
  const { placeOrder, setActiveTableOrder, openTimerModal, maximizeTimerModal, cancelOrder, orders } = useOrderStore();

  // The order this specific device placed (tracked by ID in local state)
  const [myOrderId, setMyOrderId] = useState<string | null>(null);
  // Ref so the poll effect can always see the latest value without re-subscribing
  const myOrderIdRef = useRef<string | null>(null);
  myOrderIdRef.current = myOrderId;

  // Poll the store every 3s: if this device's order just got accepted, pop the modal
  useEffect(() => {
    const interval = setInterval(() => {
      const id = myOrderIdRef.current;
      if (!id) return;
      const order = useOrderStore.getState().orders.find((o) => o.id === id);
      if (order && (order.status === "accepted" || order.status === "preparing" || order.status === "ready")) {
        setActiveTableOrder(order);
        openTimerModal();
        // Stop polling — modal is open
        setMyOrderId(null);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [localItems, setLocalItems] = useState<LocalItem[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("table-food");
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0); // percentage
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // The live order for the active modal (derived from store)
  const activeStoreOrder = myOrderId
    ? orders.find((o) => o.id === myOrderId) ?? null
    : useOrderStore.getState().activeTableOrder;

  const filtered =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((i) => i.category === activeCategory);

  const totalQty = localItems.reduce((s, i) => s + i.qty, 0);
  const subtotal = localItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmount = Math.round((subtotal * couponDiscount) / 100);
  const totalPrice = subtotal - discountAmount;

  function applyCoupon() {
    const upper = couponInput.trim().toUpperCase();
    const pct = COUPONS[upper];
    if (pct === undefined) {
      setCouponMsg({ ok: false, text: "Invalid coupon code." });
      return;
    }
    setCouponCode(upper);
    setCouponDiscount(pct);
    setCouponMsg({ ok: true, text: `${pct}% discount applied!` });
    setCouponInput("");
  }

  function removeCoupon() {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponInput("");
    setCouponMsg(null);
  }

  function adjustQty(item: typeof menuItems[0], delta: number) {
    setLocalItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (!existing) {
        if (delta < 1) return prev;
        return [...prev, { id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 }];
      }
      const newQty = existing.qty + delta;
      if (newQty < 1) return prev.filter((i) => i.id !== item.id);
      return prev.map((i) => i.id === item.id ? { ...i, qty: newQty } : i);
    });
  }

  function getQty(id: string) {
    return localItems.find((i) => i.id === id)?.qty ?? 0;
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!tableNumber) e.tableNumber = "Please select your table number.";
    if (localItems.length === 0) e.items = "Add at least one item.";
    if (orderType === "parcel") {
      if (!customerName.trim()) e.customerName = "Name required for parcel orders.";
      if (!/^01[3-9]\d{8}$/.test(customerPhone.replace(/\s/g, "")))
        e.customerPhone = "Valid Bangladesh mobile number required.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handlePlaceOrder() {
    if (!validate()) return;

    const orderId = "TBL-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const order = {
      id: orderId,
      mode: "table" as const,
      type: orderType,
      status: "pending" as const,
      tableNumber,
      customerName: customerName.trim() || `${tableNumber} Guest`,
      customerPhone: customerPhone || undefined,
      items: localItems.map((i) => ({
        menuItemId: i.id, name: i.name, price: i.price, quantity: i.qty, image: i.image,
      })),
      note: note.trim() || undefined,
      total: totalPrice,
      estimatedMinutes: 10,
      createdAt: new Date().toISOString(),
    };

    placeOrder(order);
    // Track this device's order — modal opens when admin accepts it
    setMyOrderId(orderId);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setSheetOpen(false);
      setLocalItems([]);
      setTableNumber("");
      setCustomerName("");
      setCustomerPhone("");
      setNote("");
      setCouponInput("");
      setCouponCode("");
      setCouponDiscount(0);
      setCouponMsg(null);
    }, 2200);
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col pt-16 md:pt-20">
      {/* Top bar — sits below the site Navbar */}
      <div className="sticky top-16 md:top-20 z-20 bg-white border-b border-brand-warm-gray px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/images/logo-icon.png" alt="CTG Bites" width={36} height={36} />
          <span className="font-serif font-bold text-brand-brown text-lg hidden sm:block">CTG Bites</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-brand-brown-mid" />
          <LiveClock />
          {myOrderId && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                Waiting for kitchen…
              </div>
              <button
                onClick={() => {
                  cancelOrder(myOrderId);
                  setMyOrderId(null);
                }}
                className="text-xs font-semibold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
          {activeStoreOrder && !myOrderId && (
            <button
              onClick={maximizeTimerModal}
              className="bg-brand-orange/10 border border-brand-orange/30 text-brand-orange text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
            >
              <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
              Track Order
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-brand-warm-gray px-4 overflow-x-auto">
        <div className="flex gap-1 py-3 min-w-max">
          {menuCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full font-sans text-sm font-semibold transition-colors whitespace-nowrap",
                activeCategory === cat
                  ? "bg-brand-orange text-white"
                  : "bg-brand-warm-gray text-brand-brown-mid"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((item) => {
            const qty = getQty(item.id);
            return (
              <motion.div key={item.id} layout className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="relative h-32 sm:h-40 bg-brand-warm-gray">
                  <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {item.isVeg && <span className="bg-brand-green-herb text-white rounded-full p-1"><Leaf className="w-2.5 h-2.5" /></span>}
                    {item.isSpicy && <span className="bg-red-500 text-white rounded-full p-1"><Flame className="w-2.5 h-2.5" /></span>}
                  </div>
                </div>
                <div className="p-3 flex flex-col flex-1 gap-2">
                  <p className="font-serif text-sm font-bold text-brand-brown leading-tight line-clamp-2">{item.name}</p>
                  <p className="font-sans font-bold text-brand-orange text-sm mt-auto">৳{item.price}</p>
                  <div className="mt-1">
                    {qty === 0 ? (
                      <button
                        onClick={() => adjustQty(item, 1)}
                        className="w-full bg-brand-orange text-white rounded-xl py-2 font-sans text-sm font-semibold active:scale-95 transition-transform"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 w-full justify-between">
                        <button onClick={() => adjustQty(item, -1)}
                          className="w-9 h-9 rounded-xl border-2 border-brand-orange text-brand-orange flex items-center justify-center active:bg-brand-orange/10">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-sans font-bold text-brand-brown text-base">{qty}</span>
                        <button onClick={() => adjustQty(item, 1)}
                          className="w-9 h-9 rounded-xl bg-brand-orange text-white flex items-center justify-center active:opacity-80">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating cart button */}
      <AnimatePresence>
        {totalQty > 0 && (
          <motion.button
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={() => setSheetOpen(true)}
            className="fixed bottom-6 right-4 z-30 bg-brand-orange text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-3"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="font-sans font-bold text-sm">{totalQty} items</span>
            <span className="font-serif font-bold text-sm border-l border-white/30 pl-3">৳{subtotal}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Order sheet — right-side drawer */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* Backdrop — clicking discards the order */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                if (success) return;
                setSheetOpen(false);
                setLocalItems([]);
                setTableNumber("");
                setCustomerName("");
                setCustomerPhone("");
                setNote("");
                setErrors({});
                setCouponInput(""); setCouponCode(""); setCouponDiscount(0); setCouponMsg(null);
              }}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              {/* Success overlay */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center gap-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="w-20 h-20 bg-brand-green-herb/15 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-10 h-10 text-brand-green-herb" />
                    </motion.div>
                    <p className="font-serif text-2xl font-bold text-brand-brown">Order Placed!</p>
                    <p className="font-sans text-sm text-brand-brown-mid text-center px-8">
                      Kitchen is being notified. Your tracker will appear once they accept.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 pt-6 pb-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl font-bold text-brand-brown">Place Order</h2>
                  {/* X discards the order */}
                  <button
                    onClick={() => {
                      setSheetOpen(false);
                      setLocalItems([]);
                      setTableNumber("");
                      setCustomerName("");
                      setCustomerPhone("");
                      setNote("");
                      setErrors({});
                      setCouponInput(""); setCouponCode(""); setCouponDiscount(0); setCouponMsg(null);
                    }}
                    className="text-brand-brown-mid hover:text-red-500 transition-colors p-1"
                    aria-label="Discard order"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="font-sans text-xs text-brand-brown-mid -mt-3">
                  Closing this sheet will discard your selection.
                </p>

                {/* Items recap */}
                <div className="bg-brand-cream rounded-2xl p-4 space-y-2">
                  {localItems.map((item) => (
                    <div key={item.id} className="flex justify-between font-sans text-sm">
                      <span className="text-brand-brown">{item.name} ×{item.qty}</span>
                      <span className="font-semibold text-brand-brown">৳{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="border-t border-brand-warm-gray pt-2 space-y-1">
                    <div className="flex justify-between font-sans text-sm text-brand-brown-mid">
                      <span>Subtotal</span>
                      <span>৳{subtotal}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between font-sans text-sm text-brand-green-herb font-semibold">
                        <span>Coupon ({couponCode})</span>
                        <span>−৳{discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-serif font-bold text-brand-brown pt-1 border-t border-brand-warm-gray">
                      <span>Total</span>
                      <span className="text-brand-orange">৳{totalPrice}</span>
                    </div>
                  </div>
                  {errors.items && <p className="text-xs text-red-500">{errors.items}</p>}
                </div>

                {/* Coupon */}
                <div>
                  <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-2">
                    Coupon Code
                  </label>
                  {couponCode ? (
                    <div className="flex items-center gap-3 bg-brand-green-herb/10 border border-brand-green-herb/30 rounded-xl px-4 py-2.5">
                      <Tag className="w-4 h-4 text-brand-green-herb shrink-0" />
                      <span className="font-sans text-sm font-bold text-brand-green-herb flex-1">{couponCode} — {couponDiscount}% off</span>
                      <button onClick={removeCoupon} className="text-brand-brown-mid hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponMsg(null); }}
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        placeholder="Enter coupon code"
                        className="flex-1 font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
                      />
                      <button
                        onClick={applyCoupon}
                        className="shrink-0 bg-brand-brown text-white rounded-xl px-4 py-2.5 font-sans text-sm font-semibold flex items-center gap-1.5 hover:bg-brand-brown/80 transition-colors"
                      >
                        Apply <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {couponMsg && (
                    <p className={cn("font-sans text-xs mt-1.5", couponMsg.ok ? "text-brand-green-herb" : "text-red-500")}>
                      {couponMsg.text}
                    </p>
                  )}
                </div>

                {/* 1. Customer name — OPTIONAL */}
                <div>
                  <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
                    Your Name <span className="normal-case font-normal opacity-60">(optional)</span>
                  </label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="So we can call you — leave blank to use table name"
                    className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors"
                  />
                  <p className="font-sans text-xs text-brand-brown-mid mt-1 opacity-60">
                    If left blank your order will show as &ldquo;{tableNumber ? `${tableNumber} Guest` : "Table Guest"}&rdquo;
                  </p>
                </div>

                {/* 2. Table number — REQUIRED */}
                <div>
                  <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-2">
                    Table Number <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {TABLE_NUMBERS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTableNumber(t)}
                        className={cn(
                          "py-3 rounded-xl font-sans font-bold text-sm border-2 transition-colors",
                          tableNumber === t
                            ? "border-brand-orange bg-brand-orange text-white"
                            : "border-brand-warm-gray text-brand-brown-mid hover:border-brand-orange/50"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {errors.tableNumber && <p className="text-xs text-red-500 mt-1">{errors.tableNumber}</p>}
                </div>

                {/* 3. Order type */}
                <div>
                  <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-2">
                    Order Type
                  </label>
                  <div className="flex gap-2">
                    {(["table-food", "parcel"] as OrderType[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setOrderType(t)}
                        className={cn(
                          "flex-1 py-3 rounded-xl font-sans font-semibold text-sm border-2 transition-colors",
                          orderType === t
                            ? "border-brand-orange bg-brand-orange text-white"
                            : "border-brand-warm-gray text-brand-brown-mid"
                        )}
                      >
                        {t === "table-food" ? "🪑 Table Food" : "📦 Parcel"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Parcel extra fields */}
                <AnimatePresence>
                  {orderType === "parcel" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div>
                        <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Full name for parcel"
                          className={cn(
                            "w-full font-sans text-sm bg-brand-warm-gray/40 border rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors",
                            errors.customerName ? "border-red-400" : "border-brand-warm-gray"
                          )}
                        />
                        {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
                      </div>
                      <div>
                        <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          type="tel"
                          className={cn(
                            "w-full font-sans text-sm bg-brand-warm-gray/40 border rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors",
                            errors.customerPhone ? "border-red-400" : "border-brand-warm-gray"
                          )}
                        />
                        {errors.customerPhone && <p className="text-xs text-red-500 mt-1">{errors.customerPhone}</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 5. Special requirements */}
                <div>
                  <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
                    Special Requirements <span className="normal-case font-normal opacity-60">(optional)</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Extra spicy? No onion? Allergy info? Anything for the kitchen…"
                    rows={3}
                    className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors resize-none"
                  />
                </div>

              </div>

              {/* Sticky footer — always visible */}
              <div className="shrink-0 px-5 py-4 border-t border-brand-warm-gray bg-white">
                <Button
                  onClick={handlePlaceOrder}
                  className="w-full bg-brand-orange hover:bg-brand-orange-light text-white rounded-full py-5 font-semibold text-base shadow-xl flex items-center justify-center gap-3"
                >
                  Place Order
                  <span className="border-l border-white/30 pl-3 font-bold">৳{totalPrice}</span>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
