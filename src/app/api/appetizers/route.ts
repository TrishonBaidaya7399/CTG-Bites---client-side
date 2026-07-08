import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// GET /api/appetizers?category=X&includeUnavailable=true — public
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const url = new URL(apiUrl("/api/appetizers"));
  const category = searchParams.get("category");
  const includeUnavailable = searchParams.get("includeUnavailable");
  if (category) url.searchParams.set("category", category);
  if (includeUnavailable) url.searchParams.set("includeUnavailable", includeUnavailable);

  const authHeader = req.headers.get("authorization");

  const res = await fetch(url, {
    headers: authHeader ? { Authorization: authHeader } : undefined,
    next: includeUnavailable ? undefined : { revalidate: 60 },
    cache: includeUnavailable ? "no-store" : undefined,
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to load appetizers" }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: data.appetizers ?? data.items ?? [] });
}

// POST /api/appetizers — owner/manager only
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const res = await fetch(apiUrl("/api/appetizers"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to create appetizer" }, { status: res.status });
  }

  return NextResponse.json({ success: true, data: data.appetizer ?? data });
}
