import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// GET /api/newsletter/subscribers?status=X — staff-only
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const url = new URL(apiUrl("/api/newsletter/subscribers"));
  const status = searchParams.get("status");
  if (status) url.searchParams.set("status", status);

  const res = await fetch(url, {
    headers: { Authorization: authHeader },
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to load subscribers" }, { status: res.status });
  }

  return NextResponse.json({ success: true, subscribers: data.subscribers ?? [] });
}
