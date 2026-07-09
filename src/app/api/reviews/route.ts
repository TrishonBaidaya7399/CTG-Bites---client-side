import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// GET /api/reviews?menuItemId=X — public, approved reviews only
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = new URL(apiUrl("/api/reviews"));
  const menuItemId = searchParams.get("menuItemId");
  if (menuItemId) url.searchParams.set("menuItemId", menuItemId);

  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to load reviews" }, { status: res.status });
  }

  return NextResponse.json({ success: true, reviews: data.reviews ?? [] });
}

// POST /api/reviews — public (guest or logged-in customer), creates one review per rated item
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const authHeader = req.headers.get("authorization");

  const res = await fetch(apiUrl("/api/reviews"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to submit review" }, { status: res.status });
  }

  return NextResponse.json({ success: true, reviews: data.reviews ?? [] });
}
