import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// GET /api/reviews/eligibility/:orderId — public, { reviewable, reason? }
export async function GET(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  const res = await fetch(apiUrl(`/api/reviews/eligibility/${encodeURIComponent(orderId)}`), {
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ reviewable: false, reason: data?.error ?? "Could not check review eligibility." }, { status: res.status });
  }

  return NextResponse.json(data);
}
