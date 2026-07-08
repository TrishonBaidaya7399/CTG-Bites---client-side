import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// POST /api/auth/forgot-password — public, { email }
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.email) {
    return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
  }

  const res = await fetch(apiUrl("/api/auth/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Could not process request." }, { status: res.status });
  }

  return NextResponse.json({ success: true, ...data });
}
