import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// POST /api/orders — proxy to backend order creation (public, guest checkout allowed)
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const res = await fetch(apiUrl("/api/orders"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? data?.message ?? "Failed to place order" }, { status: res.status });
  }

  return NextResponse.json({ success: true, order: data.order });
}

// GET /api/orders — staff-only, forwards Bearer token + optional filters
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const url = new URL(apiUrl("/api/orders"));
  for (const key of ["mode", "status", "type"]) {
    const val = searchParams.get(key);
    if (val) url.searchParams.set(key, val);
  }

  const res = await fetch(url, {
    headers: { Authorization: authHeader },
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to load orders" }, { status: res.status });
  }

  return NextResponse.json({ success: true, orders: data.orders ?? data });
}
