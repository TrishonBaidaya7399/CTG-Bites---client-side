import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// POST /api/coupons/validate — public, { code, subtotal } -> { ok, discountPercent, discountAmount } or { ok:false, message }
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.code) {
    return NextResponse.json({ ok: false, message: "Coupon code is required." }, { status: 400 });
  }

  const res = await fetch(apiUrl("/api/coupons/validate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  // Backend returns 200 with {ok:false,...} for invalid coupons, but be defensive either way
  if (!res.ok) {
    return NextResponse.json({ ok: false, message: data?.message ?? "Could not validate coupon." }, { status: res.status });
  }

  return NextResponse.json(data);
}
