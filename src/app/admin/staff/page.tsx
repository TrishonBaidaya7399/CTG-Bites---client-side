"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, UserX, UserCheck } from "lucide-react";
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

type StaffRole = "owner" | "manager" | "staff" | "rider";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  phone?: string;
  isActive: boolean;
}

const ROLE_LABELS: Record<StaffRole, string> = {
  owner: "Owner",
  manager: "Manager",
  staff: "Staff",
  rider: "Rider",
};

const ROLE_BADGE: Record<StaffRole, string> = {
  owner: "bg-brand-brown text-white",
  manager: "bg-brand-orange text-white",
  staff: "bg-blue-100 text-blue-700",
  rider: "bg-purple-100 text-purple-700",
};

function normalizeStaff(raw: Record<string, unknown>): StaffMember {
  return {
    id: (raw._id ?? raw.id) as string,
    name: raw.name as string,
    email: raw.email as string,
    role: raw.role as StaffRole,
    phone: raw.phone as string | undefined,
    isActive: (raw.isActive as boolean) ?? true,
  };
}

const EMPTY_DRAFT = { name: "", email: "", password: "", role: "staff" as StaffRole, phone: "" };

// Managers can only be assigned by an owner; managers themselves can only create staff/rider.
const ASSIGNABLE_ROLES: StaffRole[] = ["manager", "staff", "rider"];

export default function AdminStaffPage() {
  const adminAccessToken = useOrderStore((s) => s.adminAccessToken);
  const currentUser = useOrderStore((s) => s.adminUser);

  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!adminAccessToken) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.success) {
          setMembers((data.data ?? []).map(normalizeStaff));
        } else {
          setLoadError(data.error ?? "Failed to load staff.");
        }
      } catch {
        if (!cancelled) setLoadError("Network error loading staff.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [adminAccessToken]);

  function openCreate() {
    setDraft(EMPTY_DRAFT);
    setSaveError("");
    setDialogOpen(true);
  }

  async function handleCreate() {
    if (!adminAccessToken) return;
    if (!draft.name.trim() || !draft.email.trim() || draft.password.length < 6) {
      setSaveError("Name, email, and a password of at least 6 characters are required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({
          name: draft.name.trim(),
          email: draft.email.trim(),
          password: draft.password,
          role: draft.role,
          phone: draft.phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSaveError(data.error ?? "Failed to add staff member.");
        return;
      }
      setMembers((prev) => [normalizeStaff(data.data), ...prev]);
      setDialogOpen(false);
    } catch {
      setSaveError("Network error — could not add staff member.");
    } finally {
      setSaving(false);
    }
  }

  async function changeRole(member: StaffMember, role: StaffRole) {
    if (!adminAccessToken || role === member.role) return;
    const prevRole = member.role;
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role } : m)));
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(member.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role: prevRole } : m)));
      }
    } catch {
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, role: prevRole } : m)));
    }
  }

  async function toggleActive(member: StaffMember) {
    if (!adminAccessToken) return;
    const nextActive = !member.isActive;
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, isActive: nextActive } : m)));
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(member.id)}/deactivate`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, isActive: member.isActive } : m)));
      }
    } catch {
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, isActive: member.isActive } : m)));
    }
  }

  async function handleDelete(id: string) {
    if (!adminAccessToken) return;
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-xl font-bold text-brand-brown">Staff & Roles</h1>
        <Button onClick={openCreate} size="sm" className="bg-brand-orange hover:bg-brand-orange-light text-white rounded-full text-xs flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Member
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-brand-brown">Add Staff Member</DialogTitle>
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
              <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Temporary Password</label>
              <input
                type="password"
                value={draft.password}
                onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
                placeholder="At least 6 characters"
                className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Phone <span className="normal-case font-normal opacity-60">(optional)</span></label>
              <input
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">Role</label>
              <select
                value={draft.role}
                onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value as StaffRole }))}
                className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-4 py-2.5 outline-none focus:border-brand-orange transition-colors cursor-pointer"
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
              {currentUser?.role === "manager" && (
                <p className="font-sans text-xs text-brand-brown-mid mt-1.5 opacity-70">
                  Managers can only add Staff or Rider accounts.
                </p>
              )}
            </div>

            {saveError && (
              <p className="text-xs text-red-500 font-sans bg-red-50 border border-red-200 rounded-xl px-3 py-2">{saveError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button onClick={() => setDialogOpen(false)} variant="outline" className="flex-1 rounded-full">Cancel</Button>
            <Button onClick={handleCreate} disabled={saving} className="flex-1 bg-brand-orange hover:bg-brand-orange-light text-white rounded-full disabled:opacity-60">
              {saving ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loadError && (
        <p className="text-sm text-red-500 font-sans bg-red-50 border border-red-200 rounded-xl px-4 py-2">{loadError}</p>
      )}

      {loading ? (
        <p className="font-sans text-sm text-brand-brown-mid text-center py-16">Loading staff…</p>
      ) : members.length === 0 ? (
        <p className="font-sans text-sm text-brand-brown-mid text-center py-16">No staff members yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-warm-gray shadow-sm overflow-hidden">
          <ul className="divide-y divide-brand-warm-gray">
            <AnimatePresence initial={false}>
              {members.map((member) => (
                <motion.li
                  key={member.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn("flex flex-wrap items-center gap-3 p-4", !member.isActive && "opacity-50")}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-sans font-semibold text-brand-brown text-sm truncate">{member.name}</p>
                    <p className="font-sans text-xs text-brand-brown-mid truncate">{member.email}</p>
                  </div>

                  <span className={cn("font-sans text-xs font-bold px-2.5 py-1 rounded-full shrink-0", ROLE_BADGE[member.role])}>
                    {ROLE_LABELS[member.role]}
                  </span>

                  {member.role !== "owner" && (
                    <select
                      value={member.role}
                      onChange={(e) => changeRole(member, e.target.value as StaffRole)}
                      className="font-sans text-xs bg-brand-warm-gray/40 border border-brand-warm-gray rounded-lg px-2 py-1.5 outline-none focus:border-brand-orange transition-colors cursor-pointer shrink-0"
                    >
                      {ASSIGNABLE_ROLES.map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </select>
                  )}

                  {!member.isActive && (
                    <span className="font-sans text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-2 py-1 rounded-full shrink-0">
                      Deactivated
                    </span>
                  )}

                  {member.role !== "owner" && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        onClick={() => toggleActive(member)}
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "rounded-xl text-xs flex items-center gap-1",
                          member.isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                            : "bg-brand-green-herb text-white hover:bg-brand-green-herb/90"
                        )}
                      >
                        {member.isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        {member.isActive ? "Deactivate" : "Reactivate"}
                      </Button>

                      {deletingId === member.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(member.id)} className="text-xs font-semibold text-red-500 px-2 py-1.5 rounded-lg bg-red-50">Confirm</button>
                          <button onClick={() => setDeletingId(null)} className="text-xs font-semibold text-brand-brown-mid px-2 py-1.5">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingId(member.id)} className="text-brand-brown-mid hover:text-red-500 transition-colors p-1.5">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </div>
  );
}
