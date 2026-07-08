"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/store/orderStore";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  kind: "menu" | "appetizer";
}

function normalizeCategory(raw: Record<string, unknown>): Category {
  return {
    id: (raw._id ?? raw.id) as string,
    name: raw.name as string,
    slug: raw.slug as string,
    kind: raw.kind as "menu" | "appetizer",
  };
}

function CategoryPanel({ kind, title }: { kind: "menu" | "appetizer"; title: string }) {
  const adminAccessToken = useOrderStore((s) => s.adminAccessToken);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/categories?kind=${kind}`, { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && res.ok && data.success) {
          setCategories((data.categories ?? []).map(normalizeCategory));
        }
      } catch {
        if (!cancelled) setError("Failed to load categories.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [kind]);

  async function handleAdd() {
    if (!newName.trim() || !adminAccessToken) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ name: newName.trim(), kind }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Failed to add category.");
        return;
      }
      setCategories((prev) => [...prev, normalizeCategory(data.category)]);
      setNewName("");
    } catch {
      setError("Network error — could not add category.");
    } finally {
      setAdding(false);
    }
  }

  async function handleRename(id: string) {
    if (!editName.trim() || !adminAccessToken) return;
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCategories((prev) => prev.map((c) => (c.id === id ? normalizeCategory(data.category) : c)));
      }
    } finally {
      setEditingId(null);
      setEditName("");
    }
  }

  async function handleDelete(id: string) {
    if (!adminAccessToken) return;
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-brand-warm-gray p-5 space-y-4">
      <h2 className="font-serif text-lg font-bold text-brand-brown">{title}</h2>

      {error && (
        <p className="text-xs text-red-500 font-sans bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
      )}

      {/* Add new */}
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="New category name"
          className="flex-1 font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-3 py-2 outline-none focus:border-brand-orange transition-colors"
        />
        <Button size="sm" onClick={handleAdd} disabled={adding || !newName.trim()}
          className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-xl text-xs shrink-0 disabled:opacity-60">
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </div>

      {loading ? (
        <p className="font-sans text-sm text-brand-brown-mid text-center py-6">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="font-sans text-sm text-brand-brown-mid text-center py-6">No categories yet.</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {categories.map((cat) => (
              <motion.li
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="flex items-center gap-2 bg-brand-warm-gray/30 rounded-xl px-3 py-2"
              >
                {editingId === cat.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRename(cat.id)}
                      autoFocus
                      className="flex-1 font-sans text-sm bg-white border border-brand-orange rounded-lg px-2 py-1 outline-none"
                    />
                    <button onClick={() => handleRename(cat.id)} className="text-brand-green-herb hover:opacity-70 transition-opacity">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setEditingId(null); setEditName(""); }} className="text-brand-brown-mid hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-sans text-sm text-brand-brown">{cat.name}</span>
                    <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }} className="text-brand-brown-mid hover:text-brand-orange transition-colors p-1">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {deletingId === cat.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(cat.id)} className="text-xs font-semibold text-red-500 px-2 py-1 rounded-lg bg-red-50">Confirm</button>
                        <button onClick={() => setDeletingId(null)} className="text-xs font-semibold text-brand-brown-mid px-2 py-1">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeletingId(cat.id)} className="text-brand-brown-mid hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6")}>
      <CategoryPanel kind="menu" title="Menu Categories" />
      <CategoryPanel kind="appetizer" title="Appetizer Categories" />
    </div>
  );
}
