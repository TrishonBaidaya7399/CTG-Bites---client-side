"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag, Minus, Plus, Trash2, Tag, X,
  ChevronLeft, ChevronRight, CheckCircle2, Package,
  MapPin, Phone, User, FileText, Bike,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { useOrderStore } from "@/store/orderStore";
import { cn } from "@/lib/utils";

type Step = "cart" | "checkout" | "success";

interface DeliveryForm {
  name: string;
  phone: string;
  area: string;
  address: string;
  notes: string;
}

const EMPTY_FORM: DeliveryForm = { name: "", phone: "", area: "", address: "", notes: "" };

const AREAS = [
  "Agrabad", "Badda", "Bayezid", "Chawkbazar", "Chittagong City",
  "Double Mooring", "Hali Shahar", "Khulshi", "Kotwali",
  "Muradpur", "Nasirabad", "Panchlaish", "Pahartali", "Patenga",
];

export function CartPageClient() {
  const {
    items, removeItem, updateQty, clearCart,
    subtotal, discountAmount, total,
    couponCode, couponDiscount, applyCoupon, removeCoupon,
  } = useCartStore();

  const { placeOrder } = useOrderStore();
  const [step, setStep] = useState<Step>("cart");
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState<DeliveryForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<DeliveryForm>>({});
  const [orderRef] = useState(() => "CTG-" + Math.random().toString(36).slice(2, 8).toUpperCase());

  function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput);
    setCouponMsg({ ok: result.ok, text: result.message });
    if (result.ok) setCouponInput("");
  }

  function validate() {
    const e: Partial<DeliveryForm> = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!/^01[3-9]\d{8}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a valid BD mobile number.";
    if (!form.area) e.area = "Select a delivery area.";
    if (!form.address.trim()) e.address = "Street address is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handlePlaceOrder() {
    if (!validate()) return;
    placeOrder({
      id: orderRef,
      mode: "online",
      type: "delivery",
      status: "pending",
      customerName: form.name,
      customerPhone: form.phone,
      customerAddress: `${form.address}, ${form.area}`,
      items: items.map((i) => ({
        menuItemId: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image,
      })),
      note: form.notes || undefined,
      total: total(),
      estimatedMinutes: 10,
      createdAt: new Date().toISOString(),
    });
    clearCart();
    setStep("success");
  }

  if (step === "success") {
    return <SuccessView orderRef={orderRef} form={form} />;
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-16 md:pt-20">
      {/* Progress header — sits below the fixed navbar */}
      <div className="sticky top-16 md:top-20 z-10 bg-white/80 backdrop-blur-md border-b border-brand-warm-gray">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="text-brand-brown-mid hover:text-brand-brown transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <StepPip active={step === "cart"} done={step === "checkout"} label="Cart" />
            <div className="flex-1 h-px bg-brand-warm-gray" />
            <StepPip active={step === "checkout"} done={false} label="Checkout" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === "cart" ? (
            <motion.div
              key="cart"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left — item list */}
              <div className="lg:col-span-2 space-y-4">
                <h1 className="font-serif text-2xl font-bold text-brand-brown flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-brand-orange" /> Your Cart
                </h1>

                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
                    <ShoppingBag className="w-20 h-20 text-brand-warm-gray" />
                    <p className="font-serif text-2xl text-brand-brown-mid">Nothing here yet</p>
                    <Link href="/menu">
                      <Button className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-full px-8">
                        Browse the Menu
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 60, transition: { duration: 0.18 } }}
                        className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm"
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-brand-warm-gray">
                          <Image src={item.image} alt={item.name} width={80} height={80} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif font-bold text-brand-brown">{item.name}</p>
                          <p className="font-sans text-sm text-brand-brown-mid mt-0.5">৳{item.price} each</p>
                          <div className="flex items-center gap-3 mt-3">
                            <button
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full border border-brand-warm-gray flex items-center justify-center hover:border-brand-orange hover:text-brand-orange transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-sans font-semibold text-brand-brown w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full border border-brand-warm-gray flex items-center justify-center hover:border-brand-orange hover:text-brand-orange transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between shrink-0">
                          <button onClick={() => removeItem(item.id)} className="text-brand-brown-mid hover:text-red-500 transition-colors p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <p className="font-serif font-bold text-brand-orange">৳{item.price * item.quantity}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Right — summary */}
              {items.length > 0 && (
                <div className="space-y-4">
                  {/* Coupon */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-brown-mid uppercase tracking-wider">
                      <Tag className="w-3.5 h-3.5" /> Coupon Code
                    </p>
                    {couponCode ? (
                      <div className="flex items-center justify-between bg-brand-green-herb/10 border border-brand-green-herb/30 rounded-xl px-3 py-2.5">
                        <span className="font-sans text-sm font-bold text-brand-green-herb">{couponCode} — {couponDiscount}% off</span>
                        <button onClick={() => { removeCoupon(); setCouponMsg(null); }} className="text-brand-brown-mid hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponMsg(null); }}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                          placeholder="e.g. WELCOME15"
                          className="flex-1 font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-3 py-2.5 outline-none focus:border-brand-orange transition-colors uppercase placeholder:normal-case"
                        />
                        <Button size="sm" onClick={handleApplyCoupon} variant="outline"
                          className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white rounded-xl shrink-0">
                          Apply
                        </Button>
                      </div>
                    )}
                    {couponMsg && !couponCode && (
                      <p className={cn("text-xs font-medium", couponMsg.ok ? "text-brand-green-herb" : "text-red-500")}>
                        {couponMsg.text}
                      </p>
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2.5">
                    <p className="font-serif font-bold text-brand-brown mb-3">Order Summary</p>
                    <Row label="Subtotal" value={`৳${subtotal()}`} />
                    {couponDiscount > 0 && (
                      <Row label={`Discount (${couponDiscount}%)`} value={`−৳${discountAmount()}`} accent="green" />
                    )}
                    <Row label="Delivery" value="Free" accent="green" />
                    <div className="border-t border-brand-warm-gray pt-2.5 mt-1">
                      <Row label="Total" value={`৳${total()}`} bold />
                    </div>
                    <Button
                      onClick={() => setStep("checkout")}
                      className="w-full mt-2 bg-brand-orange hover:bg-brand-orange-light text-white rounded-full py-5 font-semibold shadow-lg flex items-center justify-center gap-2"
                    >
                      Proceed to Checkout <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* COD note */}
                  <div className="flex items-center gap-2 text-xs text-brand-brown-mid font-sans bg-white rounded-xl px-4 py-3 shadow-sm">
                    <Bike className="w-4 h-4 text-brand-orange shrink-0" />
                    Cash on Delivery only. Pay when your order arrives.
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left — delivery form */}
              <div className="lg:col-span-2 space-y-5">
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep("cart")} className="text-brand-brown-mid hover:text-brand-brown transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h1 className="font-serif text-2xl font-bold text-brand-brown">Delivery Details</h1>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
                  {/* Name */}
                  <FormField icon={<User className="w-4 h-4" />} label="Full Name" error={errors.name}>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Your full name"
                      className={fieldCls(!!errors.name)}
                    />
                  </FormField>

                  {/* Phone */}
                  <FormField icon={<Phone className="w-4 h-4" />} label="Mobile Number" error={errors.phone}>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                      className={fieldCls(!!errors.phone)}
                    />
                  </FormField>

                  {/* Area */}
                  <FormField icon={<MapPin className="w-4 h-4" />} label="Delivery Area" error={errors.area}>
                    <select
                      value={form.area}
                      onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                      className={cn(fieldCls(!!errors.area), "cursor-pointer")}
                    >
                      <option value="">Select area in Chittagong</option>
                      {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </FormField>

                  {/* Address */}
                  <FormField icon={<MapPin className="w-4 h-4" />} label="Street Address" error={errors.address}>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      placeholder="House no., Road, Block..."
                      className={fieldCls(!!errors.address)}
                    />
                  </FormField>

                  {/* Notes */}
                  <FormField icon={<FileText className="w-4 h-4" />} label="Special Instructions (optional)">
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Any dietary requirements or delivery notes..."
                      rows={3}
                      className={cn(fieldCls(false), "resize-none")}
                    />
                  </FormField>
                </div>

                {/* COD badge */}
                <div className="flex items-center gap-3 bg-brand-green-herb/10 border border-brand-green-herb/30 rounded-2xl px-5 py-4">
                  <Bike className="w-5 h-5 text-brand-green-herb shrink-0" />
                  <div>
                    <p className="font-sans font-semibold text-brand-green-herb text-sm">Cash on Delivery</p>
                    <p className="font-sans text-xs text-brand-brown-mid">Pay in cash when your order arrives. No upfront payment needed.</p>
                  </div>
                </div>
              </div>

              {/* Right — order recap */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="font-serif font-bold text-brand-brown mb-4">Your Order</p>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-brand-warm-gray">
                          <Image src={item.image} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-medium text-brand-brown truncate">{item.name}</p>
                          <p className="font-sans text-xs text-brand-brown-mid">×{item.quantity}</p>
                        </div>
                        <p className="font-sans text-sm font-semibold text-brand-brown shrink-0">৳{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-brand-warm-gray mt-4 pt-3 space-y-1.5">
                    <Row label="Subtotal" value={`৳${subtotal()}`} />
                    {couponDiscount > 0 && <Row label={`Discount (${couponDiscount}%)`} value={`−৳${discountAmount()}`} accent="green" />}
                    <Row label="Delivery" value="Free" accent="green" />
                    <div className="border-t border-brand-warm-gray pt-2 mt-1">
                      <Row label="Total" value={`৳${total()}`} bold />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  className="w-full bg-brand-orange hover:bg-brand-orange-light text-white rounded-full py-5 font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" /> Place Order (COD)
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Sub-components ──

function StepPip({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors",
        done ? "bg-brand-green-herb border-brand-green-herb text-white"
          : active ? "bg-brand-orange border-brand-orange text-white"
            : "border-brand-warm-gray text-brand-brown-mid",
      )}>
        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : label[0]}
      </div>
      <span className={cn("text-xs font-sans", active ? "text-brand-orange font-semibold" : "text-brand-brown-mid")}>{label}</span>
    </div>
  );
}

function Row({ label, value, accent, bold }: { label: string; value: string; accent?: "green"; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between font-sans text-sm", bold ? "font-bold text-brand-brown" : "text-brand-brown-mid")}>
      <span>{label}</span>
      <span className={accent === "green" ? "text-brand-green-herb font-semibold" : bold ? "text-brand-orange" : ""}>{value}</span>
    </div>
  );
}

function FormField({ icon, label, error, children }: {
  icon?: React.ReactNode; label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
        {icon && <span className="text-brand-orange">{icon}</span>} {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1 font-sans">{error}</p>}
    </div>
  );
}

function fieldCls(hasError: boolean) {
  return cn(
    "w-full font-sans text-sm bg-brand-warm-gray/40 border rounded-xl px-4 py-2.5 outline-none transition-colors",
    hasError
      ? "border-red-400 focus:border-red-500"
      : "border-brand-warm-gray focus:border-brand-orange",
  );
}

function SuccessView({ orderRef, form }: { orderRef: string; form: DeliveryForm }) {
  const { orders, cancelOrder } = useOrderStore();
  const liveOrder = orders.find((o) => o.id === orderRef);
  const isPending = liveOrder?.status === "pending";
  const isCancelled = liveOrder?.status === "cancelled";
  const [cancelConfirm, setCancelConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
      >
        {/* Icon — green = placed/active, red = cancelled */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5",
            isCancelled ? "bg-red-50" : "bg-brand-green-herb/15"
          )}
        >
          <CheckCircle2 className={cn("w-10 h-10", isCancelled ? "text-red-400" : "text-brand-green-herb")} />
        </motion.div>

        <h2 className="font-serif text-2xl font-bold text-brand-brown mb-2">
          {isCancelled ? "Order Cancelled" : "Order Placed!"}
        </h2>
        <p className="font-sans text-sm text-brand-brown-mid mb-6">
          {isCancelled
            ? "Your order has been cancelled."
            : <>Thank you, <strong className="text-brand-brown">{form.name}</strong>! Your food is on its way.</>}
        </p>

        {/* Order details */}
        <div className="bg-brand-cream rounded-2xl px-5 py-4 text-left space-y-2 mb-6">
          <p className="font-sans text-xs uppercase tracking-wider text-brand-brown-mid font-semibold mb-2">Order Details</p>
          <InfoRow label="Order ID" value={orderRef} />
          <InfoRow label="Phone" value={form.phone} />
          <InfoRow label="Area" value={form.area} />
          <InfoRow label="Address" value={form.address} />
          <InfoRow label="Payment" value="Cash on Delivery" />
          {liveOrder && <InfoRow label="Status" value={liveOrder.status.charAt(0).toUpperCase() + liveOrder.status.slice(1)} />}
        </div>

        {!isCancelled && (
          <div className="flex items-center gap-2 justify-center text-xs text-brand-brown-mid font-sans mb-6">
            <Bike className="w-4 h-4 text-brand-orange" />
            Estimated delivery: <strong className="text-brand-brown">30–45 minutes</strong>
          </div>
        )}

        {/* Cancel — only while pending */}
        {isPending && (
          <AnimatePresence mode="wait">
            {cancelConfirm ? (
              <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex gap-2 mb-4">
                <button onClick={() => setCancelConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-warm-gray font-sans text-sm font-semibold text-brand-brown-mid hover:border-brand-brown transition-colors">
                  Keep Order
                </button>
                <button onClick={() => { cancelOrder(orderRef); setCancelConfirm(false); }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 font-sans text-sm font-semibold text-white transition-colors">
                  Yes, Cancel
                </button>
              </motion.div>
            ) : (
              <motion.button key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setCancelConfirm(true)}
                className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 font-sans text-sm font-semibold transition-colors mb-4">
                Cancel Order
              </motion.button>
            )}
          </AnimatePresence>
        )}

        <Link href="/menu">
          <Button className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-full px-8">
            {isCancelled ? "Back to Menu" : "Order More Food"}
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm font-sans">
      <span className="text-brand-brown-mid">{label}</span>
      <span className="text-brand-brown font-medium text-right">{value}</span>
    </div>
  );
}
