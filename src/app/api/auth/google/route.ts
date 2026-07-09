import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

// POST /api/auth/google — public, exchanges a Google ID token for our own session
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.idToken) {
    return NextResponse.json({ success: false, error: "Missing Google ID token" }, { status: 400 });
  }

  const res = await fetch(apiUrl("/api/auth/google"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json({ success: false, error: data?.error ?? "Google sign-in failed" }, { status: res.status });
  }

  return NextResponse.json({ success: true, ...data });
}
