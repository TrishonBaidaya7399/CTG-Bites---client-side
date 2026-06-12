"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, Bike, Minus, Plus, Trash2, ShoppingBag, Flame, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { menuCategories, menuItems } from "@/lib/mock-data";
import { useOrderStore } from "@/store/orderStore";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/order";

const AREAS = [
  "Agrabad","Badda","Bayezid","Chawkbazar","Double Mooring","GEC Circle",
  "Hali Shahar","Khulshi","Kotwali","Muradpur","Nasirabad","Panchlaish","Pahartali","Patenga",
];

type LocalItem = { id: string; name: string; price: number; image: string; qty: number };

export function OnlineOrderClient() {
  const { placeOrder } = useOrderStore();

  const [activeCategory, setActiveCategory] = useState("All");
  const [localItems, setLocalItems] = useState<LocalItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderRef, setOrderRef] = useState("");
  const [success, setSuccess] = useState(false);

  const filtered = activeCategory === "All" ? menuItems : menuItems.filter((i) => i.category === activeCategory);
  const totalPrice = localItems.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty = localItems.reduce((s, i) => s + i.qty, 0);

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

  function getQty(id: string) { return localItems.find((i) => i.id === id)?.qty ?? 0; }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required.";
    if (!/^01[3-9]\d{8}$/.test(phone.replace(/\s/g, ""))) e.phone = "Enter a valid BD mobile number.";
    if (!area) e.area = "Select a delivery area.";
    if (!address.trim()) e.address = "Street address is required.";
    if (localItems.length === 0) e.items = "Add at least one item to your order.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handlePlaceOrder() {
    if (!validate()) return;
    const ref = "ONL-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const order: Order = {
      id: ref,
      mode: "online",
      type: "delivery",
      status: "pending",
      customerName: name,
      customerPhone: phone,
      customerAddress: `${address}, ${area}, Chittagong`,
      items: localItems.map((i) => ({ menuItemId: i.id, name: i.name, price: i.price, quantity: i.qty, image: i.image })),
      note: note || undefined,
      total: totalPrice,
      estimatedMinutes: 10,
      createdAt: new Date().toISOString(),
    };
    placeOrder(order);
    setOrderRef(ref);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 bg-brand-green-herb/15 rounded-full flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle2 className="w-10 h-10 text-brand-green-herb" />
          </motion.div>
          <h2 className="font-serif text-2xl font-bold text-brand-brown mb-2">Order Placed!</h2>
          <p className="font-sans text-sm text-brand-brown-mid mb-6">
            Thank you, <strong className="text-brand-brown">{name}</strong>! We'll deliver to <strong>{area}</strong>.
          </p>
          <div className="bg-brand-cream rounded-2xl px-5 py-4 text-left space-y-2 mb-6">
            <p className="font-sans text-xs uppercase tracking-wider text-brand-brown-mid font-semibold mb-2">Order Details</p>
            {[
              ["Order ID", orderRef],
              ["Phone", phone],
              ["Area", area],
              ["Address", address],
              ["Total", `৳${totalPrice}`],
              ["Payment", "Cash on Delivery"],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between font-sans text-sm">
                <span className="text-brand-brown-mid">{l}</span>
                <span className="text-brand-brown font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 justify-center text-xs text-brand-brown-mid font-sans mb-6">
            <Bike className="w-4 h-4 text-brand-orange" />
            Estimated delivery: <strong className="text-brand-brown">30–45 minutes</strong>
          </div>
          <Button onClick={() => { setSuccess(false); setLocalItems([]); setName(""); setPhone(""); setArea(""); setAddress(""); setNote(""); }}
            className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-full px-8">
            Order More
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeading eyebrow="Order Online" title="Fresh to your door." subtitle="Select items, fill delivery details, and we'll bring it to you in 30 minutes." />

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — menu */}
          <div className="lg:col-span-2 space-y-5">
            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {menuCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full font-sans text-sm font-semibold transition-colors whitespace-nowrap shrink-0",
                    activeCategory === cat
                      ? "bg-brand-orange text-white shadow-md"
                      : "bg-white text-brand-brown-mid border border-brand-warm-gray hover:border-brand-orange/50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {errors.items && (
              <p className="text-sm text-red-500 font-sans bg-red-50 border border-red-200 rounded-xl px-4 py-2">{errors.items}</p>
            )}

            {/* Menu grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filtered.map((item) => {
                const qty = getQty(item.id);
                return (
                  <motion.div key={item.id} layout className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col">
                    <div className="relative h-32 bg-brand-warm-gray">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {item.isVeg && <span className="bg-brand-green-herb text-white rounded-full p-1"><Leaf className="w-2.5 h-2.5" /></span>}
                        {item.isSpicy && <span className="bg-red-500 text-white rounded-full p-1"><Flame className="w-2.5 h-2.5" /></span>}
                      </div>
                    </div>
                    <div className="p-3 flex flex-col flex-1 gap-1">
                      <p className="font-serif text-sm font-bold text-brand-brown line-clamp-2">{item.name}</p>
                      <p className="font-sans font-bold text-brand-orange text-sm mt-auto">৳{item.price}</p>
                      <div className="mt-2">
                        {qty === 0 ? (
                          <button onClick={() => adjustQty(item, 1)}
                            className="w-full bg-brand-orange text-white rounded-xl py-1.5 font-sans text-xs font-semibold">
                            + Add
                          </button>
                        ) : (
                          <div className="flex items-center justify-between">
                            <button onClick={() => adjustQty(item, -1)} className="w-7 h-7 rounded-lg border border-brand-warm-gray flex items-center justify-center hover:border-brand-orange"><Minus className="w-3 h-3" /></button>
                            <span className="font-sans font-bold text-brand-brown text-sm">{qty}</span>
                            <button onClick={() => adjustQty(item, 1)} className="w-7 h-7 rounded-lg bg-brand-orange text-white flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right — delivery form + cart summary */}
          <div className="space-y-4">
            {/* Cart summary */}
            {localItems.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-brand-orange" />
                  <p className="font-serif font-bold text-brand-brown">Your Order ({totalQty} items)</p>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {localItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-brand-warm-gray">
                        <Image src={item.image} alt={item.name} width={32} height={32} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-xs font-medium text-brand-brown truncate">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => adjustQty(menuItems.find(m=>m.id===item.id)!, -1)} className="w-5 h-5 rounded-full border border-brand-warm-gray flex items-center justify-center"><Minus className="w-2.5 h-2.5" /></button>
                        <span className="font-sans text-xs font-bold text-brand-brown w-4 text-center">{item.qty}</span>
                        <button onClick={() => adjustQty(menuItems.find(m=>m.id===item.id)!, 1)} className="w-5 h-5 rounded-full bg-brand-orange text-white flex items-center justify-center"><Plus className="w-2.5 h-2.5" /></button>
                      </div>
                      <p className="font-sans text-xs font-bold text-brand-orange shrink-0 ml-1">৳{item.price * item.qty}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-serif font-bold text-brand-brown border-t border-brand-warm-gray pt-2">
                  <span>Total</span>
                  <span className="text-brand-orange">৳{totalPrice}</span>
                </div>
              </div>
            )}

            {/* Delivery form */}
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
              <p className="font-serif font-bold text-brand-brown">Delivery Details</p>

              {[
                { label: "Full Name", value: name, setter: setName, key: "name", placeholder: "Your full name", type: "text" },
                { label: "Mobile Number", value: phone, setter: setPhone, key: "phone", placeholder: "01XXXXXXXXX", type: "tel" },
                { label: "Street Address", value: address, setter: setAddress, key: "address", placeholder: "House no., Road, Block…", type: "text" },
              ].map(({ label, value, setter, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className={cn("w-full font-sans text-sm bg-brand-warm-gray/40 border rounded-xl px-3 py-2.5 outline-none focus:border-brand-orange transition-colors", errors[key] ? "border-red-400" : "border-brand-warm-gray")}
                  />
                  {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
                </div>
              ))}

              <div>
                <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Delivery Area</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={cn("w-full font-sans text-sm bg-brand-warm-gray/40 border rounded-xl px-3 py-2.5 outline-none focus:border-brand-orange transition-colors cursor-pointer", errors.area ? "border-red-400" : "border-brand-warm-gray")}
                >
                  <option value="">Select area in Chittagong</option>
                  {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Special Note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any dietary requirements or delivery notes…"
                  rows={2}
                  className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-3 py-2.5 outline-none focus:border-brand-orange transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-brand-brown-mid font-sans bg-brand-green-herb/8 rounded-xl px-3 py-2.5">
                <Bike className="w-4 h-4 text-brand-green-herb shrink-0" />
                Cash on Delivery — pay when food arrives
              </div>

              <Button
                onClick={handlePlaceOrder}
                className="w-full bg-brand-orange hover:bg-brand-orange-light text-white rounded-full py-5 font-semibold shadow-lg"
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
