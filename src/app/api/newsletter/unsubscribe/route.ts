import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// POST /api/newsletter/unsubscribe — public, { token }
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.token) {
    return NextResponse.json({ success: false, error: "Missing unsubscribe token" }, { status: 400 });
  }

  const res = await fetch(apiUrl("/api/newsletter/unsubscribe"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Could not unsubscribe" }, { status: res.status });
  }

  return NextResponse.json({ success: true, message: data.message });
}
