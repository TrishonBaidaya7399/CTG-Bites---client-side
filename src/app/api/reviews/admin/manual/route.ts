import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// POST /api/reviews/admin/manual — staff-only, hand-enter a review left elsewhere
// (Google, Facebook, in person) with no backing order.
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const res = await fetch(apiUrl("/api/reviews/admin/manual"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Failed to add review" }, { status: res.status });
  }

  return NextResponse.json({ success: true, review: data.review });
}
