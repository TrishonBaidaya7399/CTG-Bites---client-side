"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Pencil, Plus, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useOrderStore } from "@/store/orderStore";
import { cn } from "@/lib/utils";

interface Appetizer {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  available: boolean;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

function normalizeAppetizer(raw: Record<string, unknown>): Appetizer {
  return {
    id: (raw._id ?? raw.id) as string,
    name: raw.name as string,
    category: raw.category as string,
    price: raw.price as number,
    description: (raw.description as string) ?? "",
    image: (raw.image as string) ?? "",
    available: (raw.available as boolean) ?? true,
  };
}

const EMPTY_DRAFT = { name: "", category: "", price: 0, description: "", image: "" };

export default function AdminAppetizersPage() {
  const adminAccessToken = useOrderStore((s) => s.adminAccessToken);

  const [items, setItems] = useState<Appetizer[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<typeof EMPTY_DRAFT>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!adminAccessToken) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [itemsRes, catRes] = await Promise.all([
          fetch("/api/appetizers?includeUnavailable=true", {
            headers: { Authorization: `Bearer ${adminAccessToken}` },
            cache: "no-store",
          }),
          fetch("/api/categories?kind=appetizer", { cache: "no-store" }),
        ]);
        const itemsData = await itemsRes.json();
        const catData = await catRes.json();
        if (cancelled) return;

        if (itemsRes.ok && itemsData.success) {
          setItems((itemsData.data ?? []).map(normalizeAppetizer));
        } else {
          setLoadError(itemsData.error ?? "Failed to load appetizers.");
        }
        if (catRes.ok && catData.success) {
          setCategories((catData.categories ?? []).map((raw: Record<string, unknown>) => ({
            id: (raw._id ?? raw.id) as string,
            name: raw.name as string,
            slug: raw.slug as string,
          })));
        }
      } catch {
        if (!cancelled) setLoadError("Network error loading appetizers.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [adminAccessToken]);

  function openCreate() {
    setEditId(null);
    setDraft(EMPTY_DRAFT);
    setSaveError("");
    setDialogOpen(true);
  }

  function openEdit(item: Appetizer) {
    setEditId(item.id);
    setDraft({ name: item.name, category: item.category, price: item.price, description: item.description, image: item.image });
    setSaveError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!adminAccessToken || !draft.name.trim() || !draft.category) {
      setSaveError("Name and category are required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const url = editId ? `/api/appetizers/${encodeURIComponent(editId)}` : "/api/appetizers";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSaveError(data.error ?? "Failed to save appetizer.");
        return;
      }
      const saved = normalizeAppetizer(data.data);
      setItems((prev) => (editId ? prev.map((i) => (i.id === editId ? saved : i)) : [saved, ...prev]));
      setDialogOpen(false);
    } catch {
      setSaveError("Network error — could not save appetizer.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailable(item: Appetizer) {
    if (!adminAccessToken) return;
    const nextAvailable = !item.available;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: nextAvailable } : i)));
    try {
      const res = await fetch(`/api/appetizers/${encodeURIComponent(item.id)}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ available: nextAvailable }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: item.available } : i)));
      }
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, available: item.available } : i)));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-bold text-brand-brown">Appetizers</h1>
        <Button onClick={openCreate} size="sm" className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-full text-xs flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Appetizer
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-brand-brown">{editId ? "Edit Appetizer" : "New Appetizer"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Name</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors cursor-pointer"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Price (৳)</label>
              <input
                type="number"
                value={draft.price}
                onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Image URL</label>
              <input
                value={draft.image}
                onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))}
                placeholder="/images/menu/example.png"
                className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors"
              />
              <p className="font-sans text-xs text-brand-brown-mid mt-1.5 opacity-70">
                Direct file upload isn&apos;t wired to storage yet — paste an existing image path or URL.
              </p>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors resize-none"
              />
            </div>

            {saveError && (
              <p className="text-xs text-red-500 font-sans bg-red-50 border border-red-200 rounded-xl px-3 py-2">{saveError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button onClick={() => setDialogOpen(false)} variant="outline" className="flex-1 rounded-full">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-brand-orange hover:bg-brand-orange-light text-white rounded-full disabled:opacity-60">
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loadError && (
        <p className="text-sm text-red-500 font-sans bg-red-50 border border-red-200 rounded-xl px-4 py-2">{loadError}</p>
      )}

      {loading ? (
        <p className="font-sans text-sm text-brand-brown-mid text-center py-16">Loading appetizers…</p>
      ) : items.length === 0 ? (
        <p className="font-sans text-sm text-brand-brown-mid text-center py-16">No appetizers yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              className={cn(
                "bg-white rounded-2xl shadow-sm border border-brand-warm-gray overflow-hidden",
                !item.available && "opacity-50"
              )}
            >
              <div className="relative h-32 bg-brand-warm-gray">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" unoptimized />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-brand-brown-mid">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                  </div>
                )}
                {!item.available && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="font-sans font-bold text-white text-sm">Unavailable</span>
                  </div>
                )}
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-serif font-bold text-brand-brown text-sm leading-tight">{item.name}</p>
                  <span className="font-sans font-bold text-brand-orange text-sm shrink-0">৳{item.price}</span>
                </div>
                <p className="font-sans text-xs text-brand-brown-mid line-clamp-2">{item.description}</p>
                <div className="flex gap-2">
                  <Button onClick={() => openEdit(item)} size="sm" variant="outline"
                    className="flex-1 border-brand-warm-gray text-brand-brown rounded-xl text-xs flex items-center gap-1">
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button onClick={() => toggleAvailable(item)} size="sm" variant="ghost"
                    className={cn(
                      "flex-1 rounded-xl text-xs",
                      item.available
                        ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        : "bg-brand-green-herb text-white hover:bg-brand-green-herb/90"
                    )}>
                    {item.available ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
