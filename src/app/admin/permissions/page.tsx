"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/store/orderStore";
import { cn } from "@/lib/utils";

type EditableRole = "manager" | "staff" | "rider";

const ROLE_LABELS: Record<EditableRole, string> = {
  manager: "Manager",
  staff: "Staff",
  rider: "Rider",
};

// Grouped for readability — must stay in sync with PERMISSION_KEYS in the backend's
// src/models/RolePermission.ts. Label/group text only; the key is the source of truth.
const PERMISSION_GROUPS: { title: string; keys: { key: string; label: string }[] }[] = [
  {
    title: "Menu & Appetizers",
    keys: [
      { key: "menu:write", label: "Create / edit / delete menu items" },
      { key: "menu:availability", label: "Toggle menu item availability" },
      { key: "appetizers:write", label: "Create / edit / delete appetizers" },
      { key: "appetizers:availability", label: "Toggle appetizer availability" },
      { key: "categories:write", label: "Manage categories" },
      { key: "recipes:write", label: "Manage recipes" },
    ],
  },
  {
    title: "Orders",
    keys: [
      { key: "orders:view", label: "View order lists" },
      { key: "orders:accept", label: "Accept orders" },
      { key: "orders:status", label: "Update order status" },
      { key: "orders:cancel", label: "Cancel orders" },
      { key: "orders:assign-rider", label: "Assign a rider" },
    ],
  },
  {
    title: "Coupons & Uploads",
    keys: [
      { key: "coupons:manage", label: "Create / edit coupons" },
      { key: "coupons:delete", label: "Delete coupons" },
      { key: "uploads:write", label: "Upload images" },
    ],
  },
  {
    title: "Reports",
    keys: [
      { key: "reports:dashboard", label: "View dashboard stats" },
      { key: "reports:revenue", label: "View revenue report" },
      { key: "reports:sales", label: "View sales summary" },
    ],
  },
  {
    title: "Staff",
    keys: [
      { key: "users:manage", label: "Add / edit staff members" },
      { key: "users:delete", label: "Delete staff members" },
    ],
  },
  {
    title: "Reviews",
    keys: [
      { key: "reviews:moderate", label: "Approve, edit, hide, or delete reviews" },
    ],
  },
  {
    title: "Newsletter",
    keys: [
      { key: "newsletter:manage", label: "View subscribers and send newsletter emails" },
    ],
  },
];

const EDITABLE_ROLES: EditableRole[] = ["manager", "staff", "rider"];

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-10 h-5.5 bg-brand-warm-gray rounded-full peer peer-checked:bg-brand-orange transition-colors" />
      <div className="absolute left-0.5 top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4.5" />
    </label>
  );
}

export default function AdminPermissionsPage() {
  const adminAccessToken = useOrderStore((s) => s.adminAccessToken);
  const currentUser = useOrderStore((s) => s.adminUser);

  const [activeRole, setActiveRole] = useState<EditableRole>("manager");
  const [matrix, setMatrix] = useState<Record<EditableRole, string[]>>({ manager: [], staff: [], rider: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!adminAccessToken) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/roles/permissions", {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.success) {
          setMatrix({
            manager: data.permissions?.manager ?? [],
            staff: data.permissions?.staff ?? [],
            rider: data.permissions?.rider ?? [],
          });
        } else {
          setLoadError(data.error ?? "Failed to load permissions.");
        }
      } catch {
        if (!cancelled) setLoadError("Network error loading permissions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [adminAccessToken]);

  function toggle(key: string, value: boolean) {
    setDirty(true);
    setSaved(false);
    setMatrix((prev) => {
      const current = prev[activeRole];
      const next = value ? [...current, key] : current.filter((k) => k !== key);
      return { ...prev, [activeRole]: next };
    });
  }

  async function handleSave() {
    if (!adminAccessToken) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/roles/${activeRole}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ permissions: matrix[activeRole] }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSaveError(data.error ?? "Failed to save permissions.");
        return;
      }
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError("Network error — could not save permissions.");
    } finally {
      setSaving(false);
    }
  }

  if (currentUser && currentUser.role !== "owner") {
    return (
      <p className="font-sans text-sm text-brand-brown-mid text-center py-16">
        Only the owner account can edit role permissions.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-xl font-bold text-brand-brown">Role Permissions</h1>
        <p className="font-sans text-sm text-brand-brown-mid mt-1">
          Choose exactly what each role is allowed to do. Changes apply immediately across the app.
        </p>
      </div>

      {loadError && (
        <p className="text-sm text-red-500 font-sans bg-red-50 border border-red-200 rounded-xl px-4 py-2">{loadError}</p>
      )}

      {/* Role tabs */}
      <div className="flex gap-2">
        {EDITABLE_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => { setActiveRole(role); setSaveError(""); setSaved(false); }}
            className={cn(
              "px-4 py-2 rounded-full font-sans text-sm font-semibold transition-colors",
              activeRole === role ? "bg-brand-orange text-white" : "bg-white border border-brand-warm-gray text-brand-brown-mid hover:border-brand-orange/50"
            )}
          >
            {ROLE_LABELS[role]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-sans text-sm text-brand-brown-mid text-center py-16">Loading permissions…</p>
      ) : (
        <motion.div
          key={activeRole}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.title} className="bg-white rounded-2xl border border-brand-warm-gray p-4 space-y-3">
              <p className="font-serif font-bold text-brand-brown text-sm">{group.title}</p>
              <div className="space-y-2.5">
                {group.keys.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <span className="font-sans text-xs text-brand-brown-mid flex-1">{label}</span>
                    <Switch
                      checked={matrix[activeRole].includes(key)}
                      onChange={(v) => toggle(key, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {saveError && (
        <p className="text-sm text-red-500 font-sans bg-red-50 border border-red-200 rounded-xl px-4 py-2">{saveError}</p>
      )}

      {/* Sticky save bar */}
      <div className="sticky bottom-4 flex items-center justify-end gap-3">
        {saved && <span className="font-sans text-xs font-semibold text-brand-green-herb">Saved ✓</span>}
        <Button
          onClick={handleSave}
          disabled={saving || !dirty || loading}
          className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-full text-sm shadow-xl flex items-center gap-2 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : `Save ${ROLE_LABELS[activeRole]} Permissions`}
        </Button>
      </div>
    </div>
  );
}
