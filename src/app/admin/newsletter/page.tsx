"use client";
import { useEffect, useState } from "react";
import { Mail, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderStore } from "@/store/orderStore";
import { cn } from "@/lib/utils";

interface Subscriber {
  id: string;
  email: string;
  status: "active" | "unsubscribed";
  subscribedAt: string;
  lastSentAt?: string;
  recipesSent: number;
}

const STATUS_TABS: { value: "active" | "unsubscribed" | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "unsubscribed", label: "Unsubscribed" },
];

export default function AdminNewsletterPage() {
  const adminAccessToken = useOrderStore((s) => s.adminAccessToken);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [tab, setTab] = useState<"active" | "unsubscribed" | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState("");

  useEffect(() => {
    if (!adminAccessToken) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const url = tab === "all" ? "/api/newsletter/subscribers" : `/api/newsletter/subscribers?status=${tab}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
          cache: "no-store",
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.success) {
          setSubscribers(data.subscribers ?? []);
        } else {
          setError(data.error ?? "Failed to load subscribers.");
        }
      } catch {
        if (!cancelled) setError("Network error loading subscribers.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [adminAccessToken, tab]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllActive() {
    setSelected(new Set(subscribers.filter((s) => s.status === "active").map((s) => s.id)));
  }

  async function handleSend() {
    if (!adminAccessToken || selected.size === 0 || !subject.trim() || !bodyHtml.trim()) return;
    setSending(true);
    setSendResult("");
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminAccessToken}` },
        body: JSON.stringify({
          subscriberIds: Array.from(selected),
          subject: subject.trim(),
          bodyHtml: bodyHtml.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSendResult(data.error ?? "Failed to send email.");
        return;
      }
      setSendResult(`Sent to ${data.sent} subscriber${data.sent === 1 ? "" : "s"}.`);
      setSubject("");
      setBodyHtml("");
      setSelected(new Set());
    } catch {
      setSendResult("Network error — could not send email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-xl font-bold text-brand-brown">Newsletter</h1>
        <p className="font-sans text-sm text-brand-brown-mid mt-1">
          Manage subscribers and send emails via Resend. Active subscribers also receive one recipe per day automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscriber list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-2">
              {STATUS_TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={cn(
                    "px-4 py-2 rounded-full font-sans text-sm font-semibold transition-colors",
                    tab === t.value ? "bg-brand-orange text-white" : "bg-white border border-brand-warm-gray text-brand-brown-mid hover:border-brand-orange/50"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={selectAllActive}
              className="flex items-center gap-1.5 font-sans text-xs font-semibold text-brand-orange border border-brand-orange/30 bg-brand-orange/5 hover:bg-brand-orange hover:text-white px-3 py-1.5 rounded-full transition-colors"
            >
              <Users className="w-3.5 h-3.5" /> Select all active
            </button>
          </div>

          {error && <p className="text-sm text-red-500 font-sans bg-red-50 border border-red-200 rounded-xl px-4 py-2">{error}</p>}

          {loading ? (
            <p className="font-sans text-sm text-brand-brown-mid text-center py-16">Loading subscribers…</p>
          ) : subscribers.length === 0 ? (
            <p className="font-sans text-sm text-brand-brown-mid text-center py-16">No subscribers yet.</p>
          ) : (
            <div className="bg-white rounded-2xl border border-brand-warm-gray divide-y divide-brand-warm-gray max-h-[520px] overflow-y-auto">
              {subscribers.map((s) => (
                <label key={s.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-brand-warm-gray/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={selected.has(s.id)}
                    onChange={() => toggleSelect(s.id)}
                    disabled={s.status !== "active"}
                    className="w-4 h-4 accent-brand-orange shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-brand-brown truncate">{s.email}</p>
                    <p className="font-sans text-xs text-brand-brown-mid">
                      {s.recipesSent} recipe{s.recipesSent === 1 ? "" : "s"} sent
                      {s.lastSentAt ? ` · last ${new Date(s.lastSentAt).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "font-sans text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0",
                      s.status === "active"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    )}
                  >
                    {s.status}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Compose + send */}
        <div className="bg-white rounded-2xl border border-brand-warm-gray p-5 space-y-4 h-fit">
          <p className="font-serif font-bold text-brand-brown flex items-center gap-2">
            <Mail className="w-4 h-4 text-brand-orange" /> Compose Email
          </p>
          <p className="font-sans text-xs text-brand-brown-mid">
            {selected.size} subscriber{selected.size === 1 ? "" : "s"} selected
          </p>

          <div>
            <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-3 py-2.5 outline-none focus:border-brand-orange transition-colors"
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold text-brand-brown-mid uppercase tracking-wider mb-1.5">
              Body (HTML)
            </label>
            <textarea
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              rows={8}
              placeholder="<p>Hello there...</p>"
              className="w-full font-sans text-sm bg-brand-warm-gray/40 border border-brand-warm-gray rounded-xl px-3 py-2.5 outline-none focus:border-brand-orange transition-colors resize-none font-mono"
            />
          </div>

          {sendResult && <p className="font-sans text-xs text-brand-brown-mid">{sendResult}</p>}

          <Button
            onClick={handleSend}
            disabled={sending || selected.size === 0 || !subject.trim() || !bodyHtml.trim()}
            className="w-full bg-brand-orange hover:bg-brand-orange-light text-white rounded-full text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Send className="w-4 h-4" /> {sending ? "Sending…" : "Send Email"}
          </Button>
        </div>
      </div>
    </div>
  );
}
